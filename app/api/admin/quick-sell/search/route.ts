import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q') || '';
    
    let queryBuilder = supabase
      .from('purchased_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (q.trim().length >= 2) {
      const searchTerm = `%${q.trim()}%`;
      queryBuilder = queryBuilder.or(`buyer_name.ilike.${searchTerm},buyer_email.ilike.${searchTerm}`);
    }

    const { data: purchases, error } = await queryBuilder.limit(20);

    if (error) {
      console.error('[Search Buyers API] Database error:', error);
      return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: (purchases || []).map(p => ({
        orderId: p.order_id,
        ticketId: p.ticket_id,
        ticketName: p.ticket_name,
        ticketNumber: p.ticket_number,
        zone: p.zone,
        buyerName: p.buyer_name,
        buyerEmail: p.buyer_email,
        buyerPhone: p.buyer_phone,
        totalAccesos: p.total_accesos,
        createdAt: p.created_at,
        language: p.language
      }))
    });

  } catch (error) {
    console.error('[Search Buyers API] Exception:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
