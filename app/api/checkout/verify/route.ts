import { NextRequest, NextResponse } from 'next/server';
import { verifyLock, getRemainingSeconds } from '@/lib/lockStore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticketId = searchParams.get('ticketId');

  if (!ticketId) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const sessionToken = req.cookies.get(`checkout_token_${ticketId}`)?.value;

  if (!sessionToken) {
    return NextResponse.json({ valid: false, reason: 'no_session' });
  }

  const valid = verifyLock(ticketId, sessionToken);
  const remainingSeconds = valid ? getRemainingSeconds(ticketId, sessionToken) : 0;

  return NextResponse.json({ valid, remainingSeconds, sessionToken });
}