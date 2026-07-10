import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders } from '@/lib/orderStore';
import { validateSession } from '@/lib/authStore';
import { getDynamicTickets } from '@/lib/tickets';

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('x-admin-token');
    const secret = process.env.ADMIN_SECRET_TOKEN;
    const isValidLegacy = secret && token === secret;
    const sessionUser = validateSession(token);
    
    // We also allow an API Key passed by query param for external services
    const queryKey = req.nextUrl.searchParams.get('api_key');
    const isValidQueryKey = secret && queryKey === secret;

    if (!isValidLegacy && !sessionUser && !isValidQueryKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allOrders = getAllOrders();
    const approvedOrders = allOrders.filter(o => o.status === 'approved');

    const tickets = await getDynamicTickets();
    const ticketsMap = new Map(tickets.map(t => [t.id, t.name]));

    // Use Map to ensure emails are unique if someone bought multiple tickets
    const buyersMap = new Map();

    approvedOrders.forEach(order => {
      const email = order.buyerInfo?.email?.toLowerCase().trim();
      if (email && !buyersMap.has(email)) {
        buyersMap.set(email, {
          buyer_email: email,
          buyer_name: order.buyerInfo.name || '',
          buyer_phone: order.buyerInfo.phone || '',
          ticket_purchased: ticketsMap.get(order.ticketId) || 'Boleto/Mesa',
          order_date: new Date(order.createdAt).toISOString()
        });
      }
    });

    return NextResponse.json({
      success: true,
      total_buyers: buyersMap.size,
      data: Array.from(buyersMap.values())
    });

  } catch (error) {
    console.error('[Admin Buyers API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
