import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateSession } from '@/lib/authStore';

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('x-admin-token');
    const secret = process.env.ADMIN_SECRET_TOKEN;
    const isValidLegacy = secret && token === secret;
    const sessionUser = await validateSession(token);

    const queryKey = req.nextUrl.searchParams.get('api_key');
    const isValidQueryKey = secret && queryKey === secret;

    if (!isValidLegacy && !sessionUser && !isValidQueryKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10', 10)));
    const zone = searchParams.get('zone') || 'all';
    const q = searchParams.get('search') || searchParams.get('q') || '';

    // 1. Fetch available unique zones for filtering selector
    const { data: zoneData } = await supabase
      .from('purchased_tickets')
      .select('zone');
    
    const uniqueZonesSet = new Set<string>();
    if (zoneData) {
      zoneData.forEach((item: any) => {
        if (item.zone) {
          uniqueZonesSet.add(item.zone.trim());
        }
      });
    }
    const availableZones = Array.from(uniqueZonesSet).sort();

    // 2. Main query with pagination and filters
    let queryBuilder = supabase
      .from('purchased_tickets')
      .select('*', { count: 'exact' });

    // Filter by Zone
    if (zone && zone !== 'all') {
      queryBuilder = queryBuilder.ilike('zone', zone.trim());
    }

    // Filter by Search Query
    if (q.trim().length > 0) {
      const searchTerm = `%${q.trim()}%`;
      queryBuilder = queryBuilder.or(
        `order_id.ilike.${searchTerm},buyer_name.ilike.${searchTerm},buyer_email.ilike.${searchTerm},buyer_phone.ilike.${searchTerm},ticket_name.ilike.${searchTerm},ticket_id.ilike.${searchTerm}`
      );
    }

    // Order by created_at desc
    queryBuilder = queryBuilder.order('created_at', { ascending: false });

    // Apply pagination range
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data: purchases, count, error } = await queryBuilder.range(from, to);

    if (error) {
      console.error('[Purchased Tickets API] Database error:', error);
      return NextResponse.json({ error: 'Error al consultar la base de datos' }, { status: 500 });
    }

    const totalRecords = count || 0;
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    const formattedData = (purchases || []).map((p: any) => ({
      orderId: p.order_id,
      ticketId: p.ticket_id,
      ticketName: p.ticket_name,
      ticketNumber: p.ticket_number,
      zone: p.zone,
      buyerName: p.buyer_name,
      buyerEmail: p.buyer_email,
      buyerPhone: p.buyer_phone,
      totalAccesos: p.total_accesos ?? 0,
      accesosRestantes: p.accesos_restantes ?? 0,
      createdAt: p.created_at,
      status: p.status || 'paid',
      paymentRef: p.payment_ref || '',
      ticketPrice: p.ticket_price || 0,
      language: p.language || 'ES',
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
      pagination: {
        total: totalRecords,
        page,
        limit,
        totalPages,
      },
      zones: availableZones,
    });

  } catch (error) {
    console.error('[Purchased Tickets API] Exception:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
