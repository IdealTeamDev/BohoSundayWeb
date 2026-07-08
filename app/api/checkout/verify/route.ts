import { NextRequest, NextResponse } from 'next/server';
import { verifyLock, getRemainingSeconds, getLockQuantity } from '@/lib/lockStore';
import { getDynamicTickets } from '@/lib/tickets';

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

  const tickets = await getDynamicTickets();
  const valid = verifyLock(ticketId, sessionToken, tickets);
  const remainingSeconds = valid ? getRemainingSeconds(ticketId, sessionToken, tickets) : 0;
  const quantity = valid ? getLockQuantity(ticketId, sessionToken, tickets) : 0;
  const ticket = tickets.find((t) => t.id === ticketId);

  return NextResponse.json({ valid, remainingSeconds, sessionToken, quantity, ticket });
}