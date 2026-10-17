import { NextRequest, NextResponse } from 'next/server';
import { getDynamicTickets } from '@/lib/tickets';
import { getTicketsWithStatusAndStock } from '@/lib/lockStore';

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stageId = searchParams.get('stageId') || undefined;
    const admin = searchParams.get('admin') === 'true' || searchParams.get('forAdmin') === 'true';

    const tickets = await getDynamicTickets(stageId, admin);
    const data = await getTicketsWithStatusAndStock(tickets);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error obteniendo estados' }, { status: 500 });
  }
}
