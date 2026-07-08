import { NextRequest, NextResponse } from 'next/server';
import { acquireLock } from '@/lib/lockStore';
import { getDynamicTickets } from '@/lib/tickets';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { ticketId, quantity } = await req.json();

    if (!ticketId) {
      return NextResponse.json({ error: 'ticketId requerido' }, { status: 400 });
    }

    const reqQuantity = typeof quantity === 'number' ? quantity : 1;

    // Generate a unique session token for this checkout attempt
    const sessionToken = uuidv4();

    const tickets = await getDynamicTickets();
    const lock = acquireLock(ticketId, sessionToken, reqQuantity, tickets);

    if (!lock) {
      return NextResponse.json(
        { error: 'La cantidad seleccionada de boletas ya no está disponible. Intenta con un número menor o en unos minutos.' },
        { status: 409 }
      );
    }

    // Store token in a cookie so the server can verify it on each checkout step
    const response = NextResponse.json({
      success: true,
      sessionToken,
      expiresAt: lock.expiresAt,
    });

    response.cookies.set(`checkout_token_${ticketId}`, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 10, // 10 min
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}