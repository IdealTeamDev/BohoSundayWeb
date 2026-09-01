import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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
    const selectedEdition = searchParams.get('edition') || activeEdition.slug;

    // Fetch all paid purchased tickets from database
    const { data: dbPurchased, error: dbError } = await supabase
      .from('purchased_tickets')
      .select('*')
      .eq('status', 'paid');

    if (dbError) throw dbError;

    const purchasedList = dbPurchased || [];
    const tickets = await getDynamicTickets();

    // Calculate overall capacity for active tickets
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

    // Breakdown per edition map
    const editionsMap = new Map<string, {
      slug: string;
      name: string;
      totalRevenue: number;
      totalSold: number;
      totalCheckIns: number;
      totalOrders: number;
      ordersSet: Set<string>;
    }>();

    // Initialize map with known registered editions
    editions.forEach(ed => {
      editionsMap.set(ed.slug, {
        slug: ed.slug,
        name: ed.name,
        totalRevenue: 0,
        totalSold: 0,
        totalCheckIns: 0,
        totalOrders: 0,
        ordersSet: new Set<string>(),
      });
    });

    // Process all paid purchased tickets
    let filteredRevenue = 0;
    let filteredSold = 0;
    let filteredCheckIns = 0;
    const filteredOrdersSet = new Set<string>();

    purchasedList.forEach(ticketRow => {
      const edSlug = ticketRow.edition_slug || 'colombiamoda';
      const edName = ticketRow.edition_name || (edSlug === 'entre-soles' ? 'Entre Soles' : 'Colombiamoda');
      
      const price = Number(ticketRow.ticket_price) || 0;
      const totalAccesos = Number(ticketRow.total_accesos) || 1;
      const accesosRestantes = Number(ticketRow.accesos_restantes) ?? totalAccesos;
      const checkInsUsed = Math.max(0, totalAccesos - accesosRestantes);

      // Revenue: if price is bed price or ticket price
      const rev = price;
      const sold = 1; // 1 ticket or bed purchased

      if (!editionsMap.has(edSlug)) {
        editionsMap.set(edSlug, {
          slug: edSlug,
          name: edName,
          totalRevenue: 0,
          totalSold: 0,
          totalCheckIns: 0,
          totalOrders: 0,
          ordersSet: new Set<string>(),
        });
      }

      const edStat = editionsMap.get(edSlug)!;
      edStat.totalRevenue += rev;
      edStat.totalSold += sold;
      edStat.totalCheckIns += checkInsUsed;
      if (ticketRow.order_id) {
        edStat.ordersSet.add(ticketRow.order_id);
      }

      // Filter check
      if (selectedEdition === 'all' || edSlug === selectedEdition) {
        filteredRevenue += rev;
        filteredSold += sold;
        filteredCheckIns += checkInsUsed;
        if (ticketRow.order_id) {
          filteredOrdersSet.add(ticketRow.order_id);
        }
      }
    });

    const editionsComparison = Array.from(editionsMap.values()).map(item => ({
      slug: item.slug,
      name: item.name,
      totalRevenue: item.totalRevenue,
      totalSold: item.totalSold,
      totalCheckIns: item.totalCheckIns,
      totalOrders: item.ordersSet.size,
    }));

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
        totalOrders: filteredOrdersSet.size,
      },
      editionsComparison,
    });

  } catch (error) {
    console.error('[Admin Stats API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
