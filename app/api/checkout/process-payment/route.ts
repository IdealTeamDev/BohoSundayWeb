import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { getOrder, approveOrder, rejectOrder } from '@/lib/orderStore';
import { markAsSold, releaseLock } from '@/lib/lockStore';
import { addEmailToQueue } from '@/lib/emailQueue';
import { getDynamicTickets } from '@/lib/tickets';

export async function POST(req: NextRequest) {
  let parsedOrderId: string | undefined;
  try {
    const body = await req.json();
    const { orderId, ticketId, formData } = body;
    parsedOrderId = orderId;

    if (!orderId || !ticketId || !formData) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    if (order.status === 'approved') {
      return NextResponse.json({ success: true, status: 'approved' });
    }

    const tickets = await getDynamicTickets(order.stageId, true, true);
    const ticket = tickets.find(
      (t) => t.id === ticketId || t.id.toLowerCase() === ticketId.toLowerCase()
    );
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

    // Capture buyer's IP address (mandatory for fraud checks in Mercado Pago)
    const xForwardedFor = req.headers.get('x-forwarded-for');
    const ip = xForwardedFor ? xForwardedFor.split(',')[0].trim() : undefined;

    // Extract first and last names (required for anti-fraud & PSE/Bank Transfers in Mercado Pago)
    const nameParts = (order.buyerInfo.name || '').trim().split(/\s+/);
    const firstName = formData.payer?.first_name || nameParts[0] || 'Cliente';
    const lastName = formData.payer?.last_name || nameParts.slice(1).join(' ') || 'Boho';

    // Extract phone area code and number from order.buyerInfo.phone (e.g. "+57 3001234567")
    const rawPhone = (order.buyerInfo.phone || '').trim();
    const phoneMatch = rawPhone.match(/^\+?(\d{1,4})\s*(.+)$/);
    const phoneAreaCode = phoneMatch ? phoneMatch[1] : '57';
    const phoneNumber = (phoneMatch ? phoneMatch[2] : rawPhone).replace(/\D/g, '');

    const rawDocType = order.buyerInfo.docType;
    const fallbackIdType = rawDocType === 'C.C' ? 'CC' : rawDocType === 'C.E' ? 'CE' : 'CC';
    const payerIdentification =
      formData.payer?.identification?.number
        ? formData.payer.identification
        : order.buyerInfo.docNumber
        ? {
            type: fallbackIdType,
            number: String(order.buyerInfo.docNumber).trim(),
          }
        : undefined;

    const unitPrice = Number(ticket.price) || Number(formData.transaction_amount) / (order.quantity || 1);

    const paymentBody: any = {
      transaction_amount: Number(formData.transaction_amount),
      payment_method_id: formData.payment_method_id,
      description: `${ticket.name} - Boho Sunday`,
      statement_descriptor: 'BOHO SUNDAY',
      binary_mode: false,
      three_d_secure_mode: 'optional',
      notification_url: `${siteUrl}/api/checkout/webhooks/mercadopago`,
      external_reference: orderId,
      payer: {
        email: formData.payer?.email || order.buyerInfo.email,
        ...(payerIdentification ? { identification: payerIdentification } : {}),
        first_name: firstName,
        last_name: lastName,
        ...(formData.payer?.entity_type && {
          entity_type: formData.payer.entity_type,
        }),
      },
      additional_info: {
        ...(ip && ip !== '127.0.0.1' && ip !== '::1' ? { ip_address: ip } : {}),
        items: [
          {
            id: ticket.id,
            title: ticket.name,
            description: `${ticket.name} - Evento Boho Sunday`,
            category_id: 'tickets',
            quantity: Number(order.quantity) || 1,
            unit_price: unitPrice,
          },
        ],
        payer: {
          first_name: firstName,
          last_name: lastName,
          ...(phoneNumber
            ? {
                phone: {
                  area_code: phoneAreaCode,
                  number: phoneNumber,
                },
              }
            : {}),
        },
      },
    };

    // Include token details if paying with credit/debit card
    if (formData.token) {
      paymentBody.token = formData.token;
      paymentBody.installments = Number(formData.installments) || 1;
      if (formData.issuer_id) {
        paymentBody.issuer_id = formData.issuer_id;
      }
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
      // Approve order in database
      await approveOrder(orderId, paymentId, order);

      // Permanently lock ticket
      await markAsSold(order.ticketId, order.sessionToken, tickets);

      // Queue email confirmation
      await addEmailToQueue({
        ticketId: order.ticketId,
        orderId: order.orderId,
        buyerInfo: order.buyerInfo,
        quantity: order.quantity,
      });

      return NextResponse.json({ success: true, status: 'approved', paymentId });
    } else if (paymentStatus === 'pending' || paymentStatus === 'in_process') {
      // Fetch the redirect bank page (PSE), 3DS challenge URL, or print ticket (Efecty) URL
      const externalResourceUrl =
        paymentResult.transaction_details?.external_resource_url ||
        paymentResult.point_of_interaction?.transaction_data?.ticket_url;

      console.log(`[Checkout API] ⏳ Payment ${paymentStatus}. External Resource URL: ${externalResourceUrl}`);

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
      
      await rejectOrder(orderId, `Mercado Pago payment status: ${paymentStatus}. Detail: ${detail}`);

      const isEnglish = (order.buyerInfo.locale || '').toLowerCase() === 'en';
      const isHighRisk = detail === 'cc_rejected_high_risk' || detail === 'cc_rejected_other_reason';

      const friendlyError = isHighRisk
        ? isEnglish
          ? `Mercado Pago declined the payment due to an automated security check (${detail}). Please select WOMPI as your payment method right above to complete your purchase immediately, or try another card.`
          : `Mercado Pago rechazó el pago por validación automática de seguridad (${detail}). Te recomendamos seleccionar WOMPI como método de pago aquí arriba para completar tu compra de inmediato, o intentar con otra tarjeta.`
        : isEnglish
        ? `The payment was declined (${detail}). Please try another card or select WOMPI as your payment method.`
        : `El pago fue rechazado (${detail}). Por favor intenta con otra tarjeta o selecciona WOMPI como medio de pago.`;

      return NextResponse.json({
        success: false,
        status: paymentStatus,
        statusDetail: detail,
        error: friendlyError,
      });
    }
  } catch (error: any) {
    console.error('[ProcessPayment] 🚨 Exception processing payment:', error);
    // Extract detailed Mercado Pago API response errors if present
    const detailedError = error.apiResponse?.body || error.cause || error.message || error;
    const errorStr = typeof detailedError === 'object' ? JSON.stringify(detailedError) : String(detailedError);
    console.error('Detailed Error object:', errorStr);

    if (parsedOrderId) {
      rejectOrder(parsedOrderId, `Exception processing payment: ${errorStr}`).catch((err) => {
        console.error('[ProcessPayment] Error calling rejectOrder on exception:', err);
      });
    }

    return NextResponse.json({
      error: errorStr,
    }, { status: 500 });
  }
}
