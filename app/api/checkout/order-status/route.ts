import { NextRequest, NextResponse } from 'next/server';
import { getOrder } from '@/lib/orderStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'orderId es requerido' }, { status: 400 });
    }

    const order = getOrder(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
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
