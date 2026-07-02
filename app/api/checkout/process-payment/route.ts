import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { getOrder, approveOrder, rejectOrder } from '@/lib/orderStore';
import { markAsSold, releaseLock } from '@/lib/lockStore';
import { addEmailToQueue } from '@/lib/emailQueue';
import { tickets } from '@/data/tickets';

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
    console.log(`[Checkout API] 🚀 Processing card payment for Order ${orderId}`);
    
    const paymentResult = await payment.create({
      body: {
        transaction_amount: formData.transaction_amount,
        token: formData.token,
        installments: formData.installments,
        payment_method_id: formData.payment_method_id,
        issuer_id: formData.issuer_id,
        payer: {
          email: formData.payer.email,
          identification: formData.payer.identification,
        },
        external_reference: orderId,
      },
    });

    const paymentStatus = paymentResult.status;
    const paymentId = String(paymentResult.id);

    console.log(`[Checkout API] 🔍 Mercado Pago payment status: ${paymentStatus}, ID: ${paymentId}`);

    if (paymentStatus === 'approved') {
      // Approve order in memory
      approveOrder(orderId, paymentId);

      // Permanently lock ticket
      markAsSold(order.ticketId, order.sessionToken);

      // Queue email confirmation
      await addEmailToQueue({
        ticketId: order.ticketId,
        orderId: order.orderId,
        buyerInfo: order.buyerInfo,
        quantity: order.quantity,
      });

      return NextResponse.json({ success: true, status: 'approved', paymentId });
    } else {
      // Payment rejected, failed, or pending
      const detail = paymentResult.status_detail || 'Payment was not approved';
      console.warn(`[Checkout API] ❌ Payment not approved for Order ${orderId}: ${paymentStatus} (${detail})`);
      
      rejectOrder(orderId, `Mercado Pago payment status: ${paymentStatus}. Detail: ${detail}`);
      releaseLock(order.ticketId, order.sessionToken);

      return NextResponse.json({
        success: false,
        status: paymentStatus,
        error: `El pago fue rechazado (${detail}). Por favor intenta con otra tarjeta.`,
      });
    }
  } catch (error: any) {
    console.error('[ProcessPayment] 🚨 Exception processing payment:', error);
    return NextResponse.json({
      error: error.message || 'Error interno al procesar el pago',
    }, { status: 500 });
  }
}
