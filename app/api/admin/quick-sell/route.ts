import { NextRequest, NextResponse } from 'next/server';
import { createOrder, approveOrder } from '@/lib/orderStore';
import { addEmailToQueue } from '@/lib/emailQueue';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketId, quantity, buyerInfo } = body;

    if (!ticketId || !buyerInfo || !quantity) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Generate unique order ID
    const orderId = `ORD-QUICK-${ticketId.toUpperCase()}-${Date.now()}`;

    // Create order in memory (pass empty sessionToken for manual sale)
    createOrder(orderId, ticketId, '', buyerInfo, Number(quantity), 'wompi');

    // Immediately approve the order (handles stock reduction and admin notification email)
    await approveOrder(orderId, 'manual-sale');

    // Queue client email confirmation containing QR code
    await addEmailToQueue({
      ticketId,
      orderId,
      buyerInfo,
      quantity: Number(quantity),
    });

    console.log(`[Quick Sell] ✅ Manual sale successfully registered for Order ${orderId}`);

    return NextResponse.json({
      success: true,
      orderId,
    });
  } catch (error: any) {
    console.error('[Quick Sell API] 🚨 Exception registering manual sale:', error);
    return NextResponse.json({ error: 'Error interno del servidor al procesar la venta' }, { status: 500 });
  }
}
