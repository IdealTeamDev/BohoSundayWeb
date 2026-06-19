import { NextResponse } from 'next/server';
import { tickets } from '@/data/tickets';
import { getTicketStatus, getRemainingStock } from '@/lib/lockStore';

export async function GET() {
  try {
    const data = tickets.map((t) => ({
      id: t.id,
      status: getTicketStatus(t.id),
      remaining: t.stock !== undefined ? getRemainingStock(t.id, t.stock) : undefined,
    }));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error obteniendo estados' }, { status: 500 });
  }
}
