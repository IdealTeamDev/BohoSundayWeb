import { NextResponse } from 'next/server';
import { tickets } from '@/data/tickets';
import { getTicketStatus } from '@/lib/lockStore';

export async function GET() {
  try {
    const data = tickets.map((t) => ({
      id: t.id,
      status: getTicketStatus(t.id),
    }));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error obteniendo estados' }, { status: 500 });
  }
}
