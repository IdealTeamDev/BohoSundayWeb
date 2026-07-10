import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders } from '@/lib/orderStore';
import { getDynamicTickets } from '@/lib/tickets';
import { validateSession } from '@/lib/authStore';

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('x-admin-token');
    
    // Check dynamic session first, fallback to static secret if necessary for legacy testing
    const secret = process.env.ADMIN_SECRET_TOKEN;
    const isValidLegacy = secret && token === secret;
    const sessionUser = validateSession(token);
    
    if (!isValidLegacy && !sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allOrders = getAllOrders();
    // Sort by most recent first
    allOrders.sort((a, b) => b.createdAt - a.createdAt);
    
    const tickets = await getDynamicTickets();
    const ticketsMap = new Map(tickets.map(t => [t.id, t]));

    const enrichedOrders = allOrders.map(order => {
      const ticket = ticketsMap.get(order.ticketId);
      return {
        ...order,
        ticketName: ticket ? ticket.name : 'Unknown',
        zone: ticket ? ticket.zone : 'general',
        price: ticket ? ticket.price : 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedOrders
    });

  } catch (error) {
    console.error('[Admin Orders API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
