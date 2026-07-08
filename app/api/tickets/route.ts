import { NextResponse } from 'next/server';
import { getDynamicTickets } from '@/lib/tickets';
import { getTicketStatus, getRemainingStock } from '@/lib/lockStore';

export async function GET() {
  try {
    const tickets = await getDynamicTickets();
    const data = tickets.map((t) => ({
      ...t,
      status: getTicketStatus(t.id),
      remaining: t.stock !== undefined ? getRemainingStock(t.id, t.stock) : undefined,
    }));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error obteniendo estados' }, { status: 500 });
  }
}
