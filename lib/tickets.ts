import { tickets as staticTickets } from '@/data/tickets';
import type { Ticket, ZoneType } from '@/types';
import { supabase } from './supabase';
import { ZONE_DEFAULTS } from '@/data/zones';

/**
 * Fetch the currently active event stage based on start_date
 */
export async function getActiveStage(): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('event_stages')
      .select('*')
      .lte('start_date', new Date().toISOString())
      .order('start_date', { ascending: false })
      .limit(1);

    if (error) {
      console.error('[Tickets Service] Error fetching active stage:', error);
      return null;
    }

    if (data && data.length > 0) {
      return data[0];
    }
  } catch (err) {
    console.error('[Tickets Service] Exception fetching active stage:', err);
  }
  return null;
}

/**
 * Fetch tickets dynamically from Supabase database (boleteria_mesas and boleteria_individual).
 * Fallback to static tickets if database fails completely.
 */
export async function getDynamicTickets(stageId?: string): Promise<Ticket[]> {
  let dbCamasMapped: Ticket[] = [];
  let dbIndividualMapped: Ticket[] = [];
  let hasCamasError = false;
  let hasIndividualError = false;

  // 1. Fetch Camas/Mesas from Supabase database
  try {
    const { data: dbCamas, error: dbError } = await supabase
      .from('boleteria_mesas')
      .select('*');

    if (dbError) {
      throw dbError;
    }

    if (dbCamas) {
      dbCamasMapped = dbCamas.map((row: any) => {
        const zoneKey = (row.zone || '').toLowerCase();
        const def = ZONE_DEFAULTS[zoneKey] || {};

        const rawIcon = row.icon_card || def.iconCard || undefined;
        const rawImg = row.img || def.img || '';

        const formatPath = (p?: string) => p ? (p.startsWith('/') ? p : `/${p}`) : p;

        return {
          id: row.id,
          zone: (row.zone || 'general') as ZoneType,
          iconCard: formatPath(rawIcon),
          img: formatPath(rawImg) || '',
          name: row.name || def.name || row.id,
          description: row.description || def.description || undefined,
          number: Number(row.number) || 0,
          persons: row.persons ? Number(row.persons) : (def.persons || 10),
          price: Number(row.price) || 0,
          currency: row.currency || 'COP',
          includes: {
            licor: row.licor || def.licor || '',
            agua: row.agua !== undefined && row.agua !== null ? Number(row.agua) : (def.agua || 0),
            redBull: row.redbull !== undefined && row.redbull !== null ? Number(row.redbull) : (def.redbull || 0),
          },
          available: row.available === true || row.available === '1' || row.available === 1,
          position: {
            x: Number(row.x) || 0,
            y: Number(row.y) || 0,
          },
        };
      });
    }
  } catch (error) {
    console.error('[Tickets Service] Error fetching camas from Supabase:', error);
    hasCamasError = true;
  }

  // 2. Fetch Individual Tickets from Supabase database
  try {
    const { data: dbTickets, error: dbError } = await supabase
      .from('boleteria_individual')
      .select('*');

    if (dbError) {
      throw dbError;
    }

    if (dbTickets) {
      dbIndividualMapped = dbTickets.map((row: any) => {
        const staticInfo = staticTickets.find((s) => s.id === row.id) || {
          zone: 'general',
          iconCard: `/images/icon/icon-${row.id}.png`,
          img: `/images/individual-ticket/card-${row.id}.png`,
          includes: { licor: '', agua: 0, redBull: 0 }
        };
        const formatPath = (p?: string) => p ? (p.startsWith('/') ? p : `/${p}`) : p;
        return {
          id: row.id,
          zone: 'general' as const,
          iconCard: formatPath(staticInfo.iconCard),
          img: formatPath(staticInfo.img) || '',
          name: row.name,
          number: row.id === 'early' ? 1 : (row.id === 'general' ? 3 : 2),
          persons: 1,
          price: Number(row.price),
          currency: 'COP',
          includes: staticInfo.includes,
          available: Number(row.stock) > 0,
          position: { x: 0, y: 0 },
          stock: Number(row.stock),
        };
      });
    }
  } catch (error) {
    console.error('[Tickets Service] Error fetching individual tickets from Supabase:', error);
    hasIndividualError = true;
  }

  // Fallbacks to static data ONLY if the database query fails completely
  const finalCamas = hasCamasError
    ? staticTickets.filter(t => t.zone !== 'general')
    : dbCamasMapped;

  const finalIndividual = hasIndividualError
    ? staticTickets.filter(t => t.zone === 'general')
    : dbIndividualMapped;

  // 3. Fetch stage override if applicable
  let activeStage: any = null;
  try {
    if (stageId) {
      const { data, error } = await supabase
        .from('event_stages')
        .select('*')
        .eq('id', stageId)
        .maybeSingle();
      if (!error && data) {
        activeStage = data;
      }
    } else {
      activeStage = await getActiveStage();
    }
  } catch (err) {
    console.error('[Tickets Service] Error fetching event stage overrides:', err);
  }

  // 4. Check if active stage is 'Believers' stage
  const isBelieversStage = Boolean(
    activeStage &&
    (
      (activeStage.id && String(activeStage.id).toLowerCase().includes('believer')) ||
      (activeStage.name && String(activeStage.name).toLowerCase().includes('believer')) ||
      (activeStage.slug && String(activeStage.slug).toLowerCase().includes('believer'))
    )
  );

  // Filter out 'general' ticket if active stage is not Believers
  const filteredIndividual = finalIndividual.filter(t => {
    if (t.id === 'general') {
      return isBelieversStage;
    }
    return true;
  });

  let combined = [...finalCamas, ...filteredIndividual];

  // 5. Apply stage price overrides
  if (activeStage && activeStage.prices && typeof activeStage.prices === 'object') {
    const overrides = activeStage.prices as Record<string, any>;
    combined = combined.map((t) => {
      const zoneKey = (t.zone || '').toLowerCase();
      const idPrefix = (t.id || '').split('-')[0].toLowerCase();
      const nameLower = (t.name || '').toLowerCase();

      let overridePrice: number | undefined = undefined;

      if (overrides[t.id] !== undefined) {
        overridePrice = Number(overrides[t.id]);
      } else if (zoneKey && overrides[zoneKey] !== undefined) {
        overridePrice = Number(overrides[zoneKey]);
      } else if (idPrefix && overrides[idPrefix] !== undefined) {
        overridePrice = Number(overrides[idPrefix]);
      } else {
        for (const k of Object.keys(overrides)) {
          if (k && nameLower.includes(k.toLowerCase())) {
            overridePrice = Number(overrides[k]);
            break;
          }
        }
      }

      if (overridePrice !== undefined && !isNaN(overridePrice)) {
        return {
          ...t,
          price: overridePrice,
        };
      }
      return t;
    });
  }

  return combined;
}

/**
 * Mark a cama/mesa as unavailable or decrease individual ticket stock in Supabase in real time.
 */
export async function decreaseDatabaseStock(ticketId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('boleteria_mesas')
      .update({ available: false })
      .eq('id', ticketId);

    if (error) {
      console.error(`[Database Sync] ❌ Error marking mesa/cama ${ticketId} as unavailable in Supabase:`, error);
    } else {
      console.log(`[Database Sync] ✅ Mesa/Cama ${ticketId} marked as unavailable in Supabase.`);
    }
  } catch (error) {
    console.error(`[Database Sync] 🚨 Exception marking mesa/cama ${ticketId} as unavailable:`, error);
  }
}
