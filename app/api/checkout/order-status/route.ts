import { NextRequest, NextResponse } from 'next/server';
import { getOrder, createOrder } from '@/lib/orderStore';
import { getActiveStage } from '@/lib/tickets';
import { verifyOrderWithWompi } from '@/lib/wompiReconciliation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, wompiTxId, ticketId, buyerInfo, quantity } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId es requerido' }, { status: 400 });
    }

    let order = await getOrder(orderId);

    // If order is not found in memory/DB, recreate it using the details passed from sessionStorage
    if (!order && buyerInfo && ticketId && quantity) {
      console.log(`[OrderStore] 🔄 Recreating missing order ${orderId} for verification.`);
      const activeStage = await getActiveStage();
      order = await createOrder(orderId, ticketId, '', buyerInfo, Number(quantity), 'wompi', activeStage?.id);
      
      // If it is a quick sale, approve it immediately
      if (orderId.startsWith('ORD-QUICK-')) {
        console.log(`[OrderStore] ⚡ Recreated order is a quick sale. Approving immediately.`);
        order.status = 'approved';
        order.paymentId = 'manual-sale';
      }
    }

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    // Active server-to-server verification with Wompi / MercadoPago if order is still pending
    // Works both when wompiTxId is in the redirect URL AND by querying reference={orderId} directly!
    if (order.status === 'pending') {
      console.log(`[OrderStatus] 🔍 Active reconciliation triggered for pending Order ${orderId} (Tx: ${wompiTxId || 'by-reference'})`);
      await verifyOrderWithWompi(orderId, {
        wompiTxId: wompiTxId || undefined,
        autoRejectOnDecline: Boolean(wompiTxId),
      });
      const refreshed = await getOrder(orderId);
      if (refreshed) {
        order = refreshed;
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      ticketId: order.ticketId,
      buyerInfo: order.buyerInfo,
      quantity: order.quantity,
      paymentMethod: order.paymentMethod,
      status: order.status,
      paymentId: order.paymentId,
      errorDetail: order.errorDetail,
    });
  } catch (error) {
    console.error('[OrderStatus] 🚨 Error fetching order status:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
