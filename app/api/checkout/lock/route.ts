import { NextRequest, NextResponse } from 'next/server';
import { acquireLock } from '@/lib/lockStore';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { ticketId } = await req.json();

    if (!ticketId) {
      return NextResponse.json({ error: 'ticketId requerido' }, { status: 400 });
    }

    // Generate a unique session token for this checkout attempt
    const sessionToken = uuidv4();

    const lock = acquireLock(ticketId, sessionToken);

    if (!lock) {
      return NextResponse.json(
        { error: 'Esta mesa ya está siendo procesada por otro usuario. Intenta en unos minutos.' },
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