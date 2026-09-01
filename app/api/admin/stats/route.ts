import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders } from '@/lib/orderStore';
import { getDynamicTickets } from '@/lib/tickets';
import { validateSession } from '@/lib/authStore';
import { getAllEditions, getActiveEdition } from '@/lib/editions';

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('x-admin-token');
    const secret = process.env.ADMIN_SECRET_TOKEN;
    const isValidLegacy = secret && token === secret;
    const sessionUser = await validateSession(token);
    
    if (!isValidLegacy && !sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const activeEdition = await getActiveEdition();
    const editions = await getAllEditions();
    const selectedEdition = searchParams.get('edition') || 'all';

    const allOrders = await getAllOrders();
    const approvedOrders = allOrders.filter(o => o.status === 'approved');
    const tickets = await getDynamicTickets();
    const ticketsMap = new Map(tickets.map(t => [t.id, t]));

    // Calculate overall available capacity for active tickets
    let currentCapacity = 0;
    tickets.forEach(t => {
      if (!t.disabled && t.available) {
        if (t.stock !== undefined) {
          currentCapacity += t.stock;
        } else {
          currentCapacity += t.persons || 1;
        }
      }
    });

    // Breakdown per edition
    const editionsMap = new Map<string, {
      slug: string;
      name: string;
      totalRevenue: number;
      totalSold: number;
      totalCheckIns: number;
      totalOrders: number;
    }>();

    // Initialize map with known editions
    editions.forEach(ed => {
      editionsMap.set(ed.slug, {
        slug: ed.slug,
        name: ed.name,
        totalRevenue: 0,
        totalSold: 0,
        totalCheckIns: 0,
        totalOrders: 0,
      });
    });

    // Process all approved orders
    let filteredRevenue = 0;
    let filteredSold = 0;
    let filteredCheckIns = 0;
    let filteredOrdersCount = 0;

    approvedOrders.forEach(order => {
      const edSlug = order.editionSlug || 'colombiamoda';
      const edName = order.editionName || (edSlug === 'entre-soles' ? 'Entre Soles' : 'Colombiamoda');
      const ticket = ticketsMap.get(order.ticketId);
      const price = ticket ? ticket.price : 0;
      const rev = price * order.quantity;
      const sold = order.quantity;
      const checkIns = order.accessesUsed || 0;

      // Update edition stats
      if (!editionsMap.has(edSlug)) {
        editionsMap.set(edSlug, {
          slug: edSlug,
          name: edName,
          totalRevenue: 0,
          totalSold: 0,
          totalCheckIns: 0,
          totalOrders: 0,
        });
      }

      const edStat = editionsMap.get(edSlug)!;
      edStat.totalRevenue += rev;
      edStat.totalSold += sold;
      edStat.totalCheckIns += checkIns;
      edStat.totalOrders += 1;

      // Filter check
      if (selectedEdition === 'all' || edSlug === selectedEdition) {
        filteredRevenue += rev;
        filteredSold += sold;
        filteredCheckIns += checkIns;
        filteredOrdersCount += 1;
      }
    });

    const editionsComparison = Array.from(editionsMap.values());

    return NextResponse.json({
      success: true,
      selectedEdition,
      activeEdition,
      editions,
      data: {
        totalRevenue: filteredRevenue,
        totalSold: filteredSold,
        totalCheckIns: filteredCheckIns,
        totalCapacity: currentCapacity,
        totalOrders: filteredOrdersCount,
      },
      editionsComparison,
    });

  } catch (error) {
    console.error('[Admin Stats API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
