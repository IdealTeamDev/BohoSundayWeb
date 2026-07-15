import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch all configured tables/beds from boleteria_mesas
    const { data: dbMesas, error: dbMesasError } = await supabase
      .from('boleteria_mesas')
      .select('id, zone, price, name');

    if (dbMesasError) throw dbMesasError;

    // 2. Fetch all configured individual tickets from boleteria_individual
    const { data: dbIndividual, error: dbIndError } = await supabase
      .from('boleteria_individual')
      .select('id, name, price, stock');

    if (dbIndError) throw dbIndError;

    // 3. Fetch all paid purchased tickets
    const { data: dbPurchased, error: dbPurError } = await supabase
      .from('purchased_tickets')
      .select('ticket_id, ticket_price, total_accesos, zone')
      .eq('status', 'paid');

    if (dbPurError) throw dbPurError;

    // --- Process Mesas/Camas Stats ---
    // Group mesas by zone
    const mesasByZone: Record<string, { total: number; sold: number; revenue: number; name: string }> = {};
    
    // Initialize zones
    dbMesas?.forEach(m => {
      const zone = m.zone;
      if (!mesasByZone[zone]) {
        mesasByZone[zone] = { total: 0, sold: 0, revenue: 0, name: zone.toUpperCase() };
      }
      mesasByZone[zone].total += 1;
    });

    // Populate sold counts and revenue for mesas
    const mesaIds = new Set(dbMesas?.map(m => m.id) || []);
    dbPurchased?.forEach(p => {
      if (mesaIds.has(p.ticket_id)) {
        const mesa = dbMesas?.find(m => m.id === p.ticket_id);
        if (mesa) {
          const zone = mesa.zone;
          if (mesasByZone[zone]) {
            mesasByZone[zone].sold += 1;
            mesasByZone[zone].revenue += Number(p.ticket_price) || 0;
          }
        }
      }
    });

    const zoneStats = Object.keys(mesasByZone).map(zone => {
      const stats = mesasByZone[zone];
      return {
        zone,
        name: stats.name,
        total: stats.total,
        sold: stats.sold,
        remaining: Math.max(0, stats.total - stats.sold),
        revenue: stats.revenue
      };
    });

    // --- Process Individual Tickets Stats ---
    const individualStats = dbIndividual?.map(ind => {
      // Find matching sales
      const sales = dbPurchased?.filter(p => p.ticket_id === ind.id) || [];
      const soldCount = sales.reduce((sum, s) => sum + (s.total_accesos || 0), 0);
      const revenue = sales.reduce((sum, s) => sum + ((s.ticket_price || 0) * (s.total_accesos || 0)), 0);
      
      return {
        id: ind.id,
        name: ind.name,
        totalStock: ind.stock,
        sold: soldCount,
        remaining: Math.max(0, ind.stock - soldCount),
        revenue: revenue
      };
    }) || [];

    return NextResponse.json({
      success: true,
      data: {
        zones: zoneStats,
        individuals: individualStats
      }
    });
  } catch (error: any) {
    console.error('[Quick Sell Stats API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
