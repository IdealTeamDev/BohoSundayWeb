import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { getOrder, approveOrder, rejectOrder } from '@/lib/orderStore';
import { markAsSold, releaseLock } from '@/lib/lockStore';
import { addEmailToQueue } from '@/lib/emailQueue';
import { getDynamicTickets } from '@/lib/tickets';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, ticketId, formData } = body;

    if (!orderId || !ticketId || !formData) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const order = getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    if (order.status === 'approved') {
      return NextResponse.json({ success: true, status: 'approved' });
    }

    const tickets = await getDynamicTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: 'Mercado Pago no configurado' }, { status: 500 });
    }

    // Initialize Mercado Pago client
    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);

    // Call Mercado Pago API to create payment
    console.log(`[Checkout API] 🚀 Processing payment for Order ${orderId} using method: ${formData.payment_method_id}`);
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const callbackUrl = `${siteUrl}/checkout/${ticketId}/success?orderId=${orderId}`;

    // Capture buyer's IP address (mandatory for fraud checks in some methods like PSE)
    const xForwardedFor = req.headers.get('x-forwarded-for');
    const ip = xForwardedFor ? xForwardedFor.split(',')[0].trim() : '127.0.0.1';

    // Extract first and last names (required for PSE/Bank Transfers in Mercado Pago)
    const nameParts = (order.buyerInfo.name || '').trim().split(/\s+/);
    const firstName = formData.payer?.first_name || nameParts[0] || 'Cliente';
    const lastName = formData.payer?.last_name || nameParts.slice(1).join(' ') || 'Boho';

    const paymentBody: any = {
      transaction_amount: formData.transaction_amount,
      payment_method_id: formData.payment_method_id,
      description: `${ticket.name} - Boho Sunday`,
      notification_url: `${siteUrl}/api/checkout/webhooks/mercadopago`,
      external_reference: orderId,
      payer: {
        email: formData.payer.email,
        identification: formData.payer.identification,
        first_name: firstName,
        last_name: lastName,
        ...(formData.payer.entity_type && {
          entity_type: formData.payer.entity_type,
        }),
      },
      additional_info: {
        ip_address: ip,
      },
    };

    // Include token details if paying with credit/debit card
    if (formData.token) {
      paymentBody.token = formData.token;
      paymentBody.installments = formData.installments;
      paymentBody.issuer_id = formData.issuer_id;
    }

    // Include PSE specifics if transfer was chosen
    if (formData.payment_method_id === 'pse') {
      paymentBody.transaction_details = {
        financial_institution: formData.transaction_details?.financial_institution,
      };
      paymentBody.callback_url = callbackUrl;
    }

    const paymentResult = await payment.create({ body: paymentBody });

    const paymentStatus = paymentResult.status;
    const paymentId = String(paymentResult.id);

    console.log(`[Checkout API] 🔍 Mercado Pago payment status: ${paymentStatus}, ID: ${paymentId}`);

    if (paymentStatus === 'approved') {
      // Approve order in memory
      approveOrder(orderId, paymentId);

      // Permanently lock ticket
      markAsSold(order.ticketId, order.sessionToken, tickets);

      // Queue email confirmation
      await addEmailToQueue({
        ticketId: order.ticketId,
        orderId: order.orderId,
        buyerInfo: order.buyerInfo,
        quantity: order.quantity,
      });

      return NextResponse.json({ success: true, status: 'approved', paymentId });
    } else if (paymentStatus === 'pending') {
      // Fetch the redirect bank page (PSE) or print ticket (Efecty) URL
      const externalResourceUrl =
        paymentResult.transaction_details?.external_resource_url ||
        paymentResult.point_of_interaction?.transaction_data?.ticket_url;

      console.log(`[Checkout API] ⏳ Payment pending. External Resource URL: ${externalResourceUrl}`);

      return NextResponse.json({
        success: true,
        status: 'pending',
        paymentId,
        externalResourceUrl: externalResourceUrl || null,
      });
    } else {
      // Payment rejected, failed, etc.
      const detail = paymentResult.status_detail || 'Payment was not approved';
      console.warn(`[Checkout API] ❌ Payment not approved for Order ${orderId}: ${paymentStatus} (${detail})`);
      
      rejectOrder(orderId, `Mercado Pago payment status: ${paymentStatus}. Detail: ${detail}`);
      releaseLock(order.ticketId, order.sessionToken, tickets);

      return NextResponse.json({
        success: false,
        status: paymentStatus,
        error: `El pago fue rechazado (${detail}). Por favor intenta con otra tarjeta o medio de pago.`,
      });
    }
  } catch (error: any) {
    console.error('[ProcessPayment] 🚨 Exception processing payment:', error);
    // Extract detailed Mercado Pago API response errors if present
    const detailedError = error.apiResponse?.body || error.cause || error.message || error;
    console.error('Detailed Error object:', JSON.stringify(detailedError));
    return NextResponse.json({
      error: typeof detailedError === 'object' ? JSON.stringify(detailedError) : String(detailedError),
    }, { status: 500 });
  }
}
