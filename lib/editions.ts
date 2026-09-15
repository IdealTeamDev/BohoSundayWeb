import { supabase } from './supabase';

export interface EventEdition {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
  start_date?: string | null;
  end_date?: string | null;
  created_at?: string | null;
}

const DEFAULT_ACTIVE_EDITION: EventEdition = {
  id: 'entre-soles',
  slug: 'entre-soles',
  name: 'Entre Soles',
  is_active: true,
  start_date: '2026-10-18',
};

/**
 * Calculates lock expiration date as 1 day after event start_date at 23:59:59.
 * If start_date is "2026-10-18", expiration is "2026-10-19T23:59:59-05:00".
 */
export function getEditionLockExpiration(edition?: EventEdition | null): string {
  const dateStr = edition?.start_date || '2026-10-18';
  const cleanDate = dateStr.split('T')[0];
  const parts = cleanDate.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const day = parseInt(parts[2], 10);
    const expDate = new Date(year, month, day + 1);
    const expYear = expDate.getFullYear();
    const expMonth = String(expDate.getMonth() + 1).padStart(2, '0');
    const expDay = String(expDate.getDate()).padStart(2, '0');
    return `${expYear}-${expMonth}-${expDay}T23:59:59-05:00`;
  }
  return '2026-10-19T23:59:59-05:00';
}

/**
 * Fetch all registered event editions from Supabase
 */
export async function getAllEditions(): Promise<EventEdition[]> {
  try {
    const { data, error } = await supabase
      .from('event_editions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn('[Editions Service] Error or no editions found in DB, returning defaults:', error);
      return [
        DEFAULT_ACTIVE_EDITION,
        { id: 'colombiamoda', slug: 'colombiamoda', name: 'Colombiamoda', is_active: false, start_date: '2026-07-26' }
      ];
    }

    return data.map((item: any) => ({
      id: item.id || item.slug,
      slug: item.slug || item.id,
      name: item.name,
      is_active: Boolean(item.is_active),
      start_date: item.start_date || (item.slug === 'entre-soles' ? '2026-10-18' : null),
      end_date: item.end_date || null,
      created_at: item.created_at || null,
    }));
  } catch (err) {
    console.error('[Editions Service] Exception fetching editions:', err);
    return [
      DEFAULT_ACTIVE_EDITION,
      { id: 'colombiamoda', slug: 'colombiamoda', name: 'Colombiamoda', is_active: false, start_date: '2026-07-26' }
    ];
  }
}

/**
 * Fetch the currently active event edition
 */
export async function getActiveEdition(): Promise<EventEdition> {
  try {
    const { data, error } = await supabase
      .from('event_editions')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) {
      console.warn('[Editions Service] No active edition set in DB, using fallback "Entre Soles"');
      return DEFAULT_ACTIVE_EDITION;
    }

    return {
      id: data.id || data.slug,
      slug: data.slug || data.id,
      name: data.name,
      is_active: true,
      start_date: data.start_date || DEFAULT_ACTIVE_EDITION.start_date,
      end_date: data.end_date || null,
      created_at: data.created_at || null,
    };
  } catch (err) {
    console.error('[Editions Service] Exception getting active edition:', err);
    return DEFAULT_ACTIVE_EDITION;
  }
}

/**
 * Change the active event edition
 */
export async function setActiveEdition(slug: string): Promise<boolean> {
  try {
    // 1. Set all to inactive
    await supabase
      .from('event_editions')
      .update({ is_active: false })
      .neq('slug', '____none____');

    // 2. Set target slug to active
    const { error } = await supabase
      .from('event_editions')
      .update({ is_active: true })
      .eq('slug', slug);

    if (error) {
      console.error(`[Editions Service] Error setting active edition to ${slug}:`, error);
      return false;
    }

    console.log(`[Editions Service] ✅ Active edition changed to "${slug}"`);
    return true;
  } catch (err) {
    console.error(`[Editions Service] Exception setting active edition to ${slug}:`, err);
    return false;
  }
}

/**
 * Create a new event edition with optional start_date
 */
export async function createEdition(name: string, slug?: string, startDate?: string | null): Promise<EventEdition | null> {
  const generatedSlug = (slug || name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const cleanStartDate = startDate && startDate.trim() ? startDate.trim() : null;

  const newEdition: EventEdition = {
    id: generatedSlug,
    slug: generatedSlug,
    name: name.trim(),
    is_active: false,
    start_date: cleanStartDate,
  };

  try {
    const { error } = await supabase
      .from('event_editions')
      .insert([{
        id: generatedSlug,
        slug: generatedSlug,
        name: name.trim(),
        is_active: false,
        start_date: cleanStartDate,
      }]);

    if (error) {
      console.error('[Editions Service] Error creating edition:', error);
      return null;
    }

    return newEdition;
  } catch (err) {
    console.error('[Editions Service] Exception creating edition:', err);
    return null;
  }
}

/**
 * Reset inventory for beds/tables and individual tickets for a fresh event edition.
 * Clears temporary table locks so tables start 100% available.
 * Does NOT delete historical sales or buyer information.
 */
export async function resetInventoryForEdition(): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Delete all temporary locks from ticket_locks table
    const { error: locksErr } = await supabase
      .from('ticket_locks')
      .delete()
      .neq('lock_key', '____none____');

    if (locksErr) {
      console.error('[Editions Service] Error cleaning ticket_locks:', locksErr);
    }

    // 2. Set all camas/mesas available = true in Supabase
    const { error: mesasErr } = await supabase
      .from('boleteria_mesas')
      .update({ available: true })
      .neq('id', '____none____');

    if (mesasErr) {
      console.error('[Editions Service] Error resetting boleteria_mesas:', mesasErr);
    }

    // 3. Reset individual tickets stock to 100 in Supabase
    const { error: individualErr } = await supabase
      .from('boleteria_individual')
      .update({ stock: 100 })
      .neq('id', '____none____');

    if (individualErr) {
      console.error('[Editions Service] Error resetting boleteria_individual:', individualErr);
    }

    console.log('[Editions Service] 🔄 Inventory and locks reset executed successfully for new edition.');
    return {
      success: true,
      message: 'Inventario de mesas, bloqueos y disponibilidad de boletas reiniciado exitosamente para la nueva edición.',
    };
  } catch (err: any) {
    console.error('[Editions Service] Exception resetting inventory:', err);
    return {
      success: false,
      message: err?.message || 'Error al reiniciar inventario',
    };
  }
}
