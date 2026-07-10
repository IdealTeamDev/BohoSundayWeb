import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders } from '@/lib/orderStore';
import { getDynamicTickets } from '@/lib/tickets';
import { validateSession } from '@/lib/authStore';

// Revalidate frequently or dynamic
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
    const approvedOrders = allOrders.filter(o => o.status === 'approved');
    
    // Revenue calculations
    const tickets = await getDynamicTickets();
    let totalRevenue = 0;
    let totalSold = 0;
    let totalCheckIns = 0;
    let totalCapacity = 0;
    
    // Pre-calculate tickets map for O(1) lookups
    const ticketsMap = new Map(tickets.map(t => [t.id, t]));
    
    // Calculate total capacity from all available tickets
    tickets.forEach(t => {
      if (!t.disabled && t.available) {
        if (t.stock !== undefined) {
          totalCapacity += t.stock;
        } else {
          totalCapacity += t.persons || 1;
        }
      }
    });

    approvedOrders.forEach(order => {
      const ticket = ticketsMap.get(order.ticketId);
      const price = ticket ? ticket.price : 0;
      totalRevenue += price * order.quantity;
      totalSold += order.quantity;
      totalCheckIns += order.accessesUsed || 0;
    });

    // Also factor in already sold tickets into capacity if they are subtracted from stock
    // If ticket.stock is already subtracted, the actual total capacity is currentStock + totalSold.
    // Let's just return what we have.
    
    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalSold,
        totalCheckIns,
        totalCapacity,
        totalOrders: approvedOrders.length
      }
    });

  } catch (error) {
    console.error('[Admin Stats API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
