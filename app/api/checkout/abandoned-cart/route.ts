import { NextRequest, NextResponse } from 'next/server';
import {
  trackCheckoutProgress,
  triggerAbandonedCartForOrder,
  isValidEmail,
} from '@/lib/abandonedCart';
import { releaseLock } from '@/lib/lockStore';
import { getDynamicTickets } from '@/lib/tickets';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action = 'track',
      ticketId,
      buyerInfo,
      quantity = 1,
      paymentMethod = 'wompi',
      orderId,
    } = body;

    if (!ticketId || !buyerInfo || !isValidEmail(buyerInfo.email)) {
      return NextResponse.json({ success: false, reason: 'invalid_email' }, { status: 200 });
    }

    const sessionToken = req.cookies.get(`checkout_token_${ticketId}`)?.value || '';

    if (action === 'expire') {
      if (sessionToken) {
        const tickets = await getDynamicTickets().catch(() => []);
        await releaseLock(ticketId, sessionToken, tickets).catch(() => {});
      }

      const sent = await triggerAbandonedCartForOrder({
        orderId: orderId || undefined,
        sessionToken,
        ticketId,
        buyerInfo,
        reason: 'timeout_10m',
      });

      return NextResponse.json({
        success: true,
        action: 'expire',
        sent,
      });
    }

    const result = await trackCheckoutProgress({
      ticketId,
      sessionToken,
      buyerInfo,
      quantity: Number(quantity) || 1,
      paymentMethod: paymentMethod === 'mercadopago' ? 'mercadopago' : 'wompi',
    });

    return NextResponse.json({
      success: true,
      action: 'track',
      ...result,
    });
  } catch (error: any) {
    console.error('[AbandonedCart API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Error procesando carrito abandonado' },
      { status: 500 }
    );
  }
}
