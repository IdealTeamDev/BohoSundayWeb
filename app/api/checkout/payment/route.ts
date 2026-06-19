import { NextRequest, NextResponse } from 'next/server';
import { verifyLock, markAsSold, releaseLock, getLockQuantity } from '@/lib/lockStore';
import { addEmailToQueue } from '@/lib/emailQueue';

export async function POST(req: NextRequest) {
  try {
    const { ticketId, buyerInfo } = await req.json();

    if (!ticketId || !buyerInfo) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const sessionToken = req.cookies.get(`checkout_token_${ticketId}`)?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Sesión inválida o expirada' },
        { status: 401 }
      );
    }

    const valid = verifyLock(ticketId, sessionToken);
    if (!valid) {
      return NextResponse.json(
        { error: 'Tu tiempo de reserva expiró. Por favor intenta de nuevo.' },
        { status: 410 }
      );
    }

    // ----- SIMULATE PAYMENT -----
    // When payment gateway is ready, call it here and check result.
    // For now, we simulate a 1 second processing delay and approve.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const paymentApproved = true; // replace with real gateway response
    // ----------------------------

    if (!paymentApproved) {
      releaseLock(ticketId, sessionToken);
      return NextResponse.json({ error: 'Pago rechazado' }, { status: 402 });
    }

    const quantity = getLockQuantity(ticketId, sessionToken) || 1;

    // Mark ticket as permanently sold
    markAsSold(ticketId, sessionToken);

    // Generate a fake order ID — replace with real DB record ID later
    const orderId = `ORD-${ticketId.toUpperCase()}-${Date.now()}`;

    // Queue confirmation email in background
    addEmailToQueue({
      ticketId,
      orderId,
      buyerInfo,
      quantity,
    });

    const response = NextResponse.json({
      success: true,
      orderId,
      buyerInfo,
    });

    // Clear the checkout cookie
    response.cookies.delete(`checkout_token_${ticketId}`);

    return response;
  } catch {
    return NextResponse.json({ error: 'Error procesando el pago' }, { status: 500 });
  }
}