import { NextRequest, NextResponse } from 'next/server';
import { getDynamicTickets } from '@/lib/tickets';
import { getTicketStatus, getRemainingStock } from '@/lib/lockStore';

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stageId = searchParams.get('stageId') || undefined;

    const tickets = await getDynamicTickets(stageId);
    const data = await Promise.all(tickets.map(async (t) => ({
      ...t,
      status: await getTicketStatus(t.id, tickets),
      remaining: t.stock !== undefined ? await getRemainingStock(t.id, t.stock) : undefined,
    })));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error obteniendo estados' }, { status: 500 });
  }
}
