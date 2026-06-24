import { NextRequest, NextResponse } from 'next/server';
import { getOrder, approveOrder, rejectOrder } from '@/lib/orderStore';
import { markAsSold, releaseLock } from '@/lib/lockStore';
import { addEmailToQueue } from '@/lib/emailQueue';

export async function POST(req: NextRequest) {
  try {
    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const order = getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    console.log(`[Wompi Mock Webhook] 🔔 Simulating webhook. Order ID: ${orderId}, Status: ${status}`);

    if (status === 'approved') {
      if (order.status === 'approved') {
        return NextResponse.json({ success: true, message: 'Already approved' });
      }

      const paymentId = `wompi-mock-${Date.now()}`;
      
      // Update order status
      approveOrder(orderId, paymentId);

      // Lock ticket permanently
      markAsSold(order.ticketId, order.sessionToken);

      // Queue confirmation email
      addEmailToQueue({
        ticketId: order.ticketId,
        orderId: order.orderId,
        buyerInfo: order.buyerInfo,
        quantity: order.quantity,
      });

      console.log(`[Wompi Mock Webhook] ✅ Order ${orderId} finalized and email queued.`);
    } else {
      // Rejected
      rejectOrder(orderId, 'Pago rechazado en el simulador de Wompi.');
      
      // Release lock
      releaseLock(order.ticketId, order.sessionToken);
      console.log(`[Wompi Mock Webhook] ❌ Order ${orderId} rejected and ticket lock released.`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[WompiMockWebhook] 🚨 Error processing mock webhook:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
