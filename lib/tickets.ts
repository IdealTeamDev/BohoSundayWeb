import { tickets as staticTickets } from '@/data/tickets';
import type { Ticket, ZoneType } from '@/types';

/**
 * Helper to parse a raw WordPress item into a clean Ticket object
 */
function parseWpTicket(item: any, type: 'cama' | 'individual'): Ticket {
  const acf = item.acf || {};
  
  // Resolve zone
  let zoneVal: ZoneType = 'general';
  
  if (type === 'cama') {
    if (item.class_list && Array.isArray(item.class_list)) {
      const catClass = item.class_list.find((cls: string) => cls.startsWith('categoria-de-camas-'));
      if (catClass) {
        zoneVal = catClass.replace('categoria-de-camas-', '').toLowerCase() as ZoneType;
      }
    }
    
    if (zoneVal === 'general' && acf.zone) {
      if (typeof acf.zone === 'string') {
        zoneVal = acf.zone as ZoneType;
      } else if (typeof acf.zone === 'object') {
        if (Array.isArray(acf.zone) && acf.zone.length > 0) {
          zoneVal = (typeof acf.zone[0] === 'string' 
            ? acf.zone[0] 
            : (acf.zone[0].slug || acf.zone[0].name || 'general')) as ZoneType;
        } else {
          zoneVal = (acf.zone.slug || acf.zone.name || 'general') as ZoneType;
        }
      }
    }
  } else {
    // Individual tickets zone is always 'general'
    zoneVal = 'general';
  }
  
  // Resolve includes safely from Repeater
  let licor = '';
  let agua = 0;
  let redBull = 0;
  let row: any = null;
  if (Array.isArray(acf.includes) && acf.includes.length > 0) {
    row = acf.includes[0];
    licor = row.licor || '';
    agua = Number(row.agua) || 0;
    redBull = Number(row.redbull) || 0;
  }
  
  // Resolve available safely
  let isAvailable = true;
  if (acf.available !== undefined) {
    isAvailable = acf.available === true || acf.available === '1' || acf.available === 1;
  } else if (row && row.available !== undefined) {
    isAvailable = row.available === true || row.available === '1' || row.available === 1;
  }
  
  // Resolve position safely
  let x = 0;
  let y = 0;
  const positionSource = acf.position || (row ? row.position : null);
  if (Array.isArray(positionSource) && positionSource.length > 0) {
    const posRow = positionSource[0];
    x = Number(posRow.x) || 0;
    y = Number(posRow.y) || 0;
  }

  const id = String(acf.id || item.slug || item.id || `wp-${type}-${Math.random()}`);

  // Resolve image fallback for individual tickets if not defined in WordPress
  let img = acf.img || '';
  if (!img && type === 'individual') {
    if (id === 'early') {
      img = 'images/individual-ticket/card-early.png';
    } else if (id === 'anytime') {
      img = 'images/individual-ticket/card-anytime.png';
    }
  }

  // Resolve iconCard fallback for individual tickets if not defined in WordPress
  let iconCard = acf.iconcard || undefined;
  if (!iconCard && type === 'individual') {
    if (id === 'early') {
      iconCard = 'images/icon/icon-early.png';
    } else if (id === 'anytime') {
      iconCard = 'images/icon/icon-anytime.png';
    }
  }

  return {
    id,
    zone: zoneVal,
    iconCard,
    img,
    name: acf.name || item.title?.rendered || (type === 'individual' ? 'Boleto Individual' : 'Mesa/Cama'),
    description: acf.description || undefined,
    number: Number(acf.number) || 0,
    persons: Number(acf.persons) || (type === 'individual' ? 1 : 0),
    price: Number(acf.price) || 0,
    currency: acf.currency || 'COP',
    includes: { licor, agua, redBull },
    available: isAvailable,
    disabled: !isAvailable,
    position: { x, y },
    ...(type === 'individual' && { stock: acf.stock !== undefined ? Number(acf.stock) : 100 }),
    wpPostId: item.id
  };
}

/**
 * Fetch tickets dynamically from WordPress REST API (ACF Camas and ACF Boleteria Individual)
 * and merge them together. Fallback to static tickets if API fails.
 */
export async function getDynamicTickets(): Promise<Ticket[]> {
  const baseUrl = process.env.WORDPRESS_API_URL || 'https://bohosundayapp.wpenginepowered.com';
  
  const camasUrl = `${baseUrl.replace(/\/$/, '')}/?rest_route=/wp/v2/camas&per_page=100&lang=es&nocache=${Date.now()}`;
  const individualUrl = `${baseUrl.replace(/\/$/, '')}/?rest_route=/wp/v2/boleteria-invidual&per_page=100&lang=es&nocache=${Date.now()}`;
  
  let wordpressCamas: Ticket[] = [];
  let wordpressIndividual: Ticket[] = [];
  let hasCamasError = false;
  let hasIndividualError = false;

  // 1. Fetch Camas from WordPress
  try {
    const res = await fetch(camasUrl, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      throw new Error(`WordPress Camas API returned status ${res.status}`);
    }
    
    const wpData = await res.json();
    if (!Array.isArray(wpData)) {
      throw new Error('WordPress Camas API response is not an array');
    }
    
    wordpressCamas = wpData.map((item: any) => parseWpTicket(item, 'cama'));
  } catch (error) {
    console.error('[Tickets Service] Error fetching camas from WordPress:', error);
    hasCamasError = true;
  }

  // 2. Fetch Individual Tickets from WordPress
  try {
    const res = await fetch(individualUrl, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      throw new Error(`WordPress Individual Tickets API returned status ${res.status}`);
    }
    
    const wpData = await res.json();
    if (!Array.isArray(wpData)) {
      throw new Error('WordPress Individual Tickets API response is not an array');
    }
    
    wordpressIndividual = wpData.map((item: any) => parseWpTicket(item, 'individual'));
  } catch (error) {
    console.error('[Tickets Service] Error fetching individual tickets from WordPress:', error);
    hasIndividualError = true;
  }

  // Graceful Fallbacks to static data ONLY if the WordPress request fails
  const finalCamas = hasCamasError
    ? staticTickets.filter(t => t.zone !== 'general')
    : wordpressCamas;

  const finalIndividual = hasIndividualError
    ? staticTickets.filter(t => t.zone === 'general')
    : wordpressIndividual;

  return [...finalCamas, ...finalIndividual];
}

/**
 * Update the stock of an individual ticket or disable a cama in WordPress in real time.
 */
export async function decreaseWordPressStock(ticketId: string, quantity: number): Promise<void> {
  const username = process.env.WORDPRESS_API_USER;
  const password = process.env.WORDPRESS_API_PASSWORD;
  const baseUrl = process.env.WORDPRESS_API_URL || 'https://bohosundayapp.wpenginepowered.com';

  if (!username || !password) {
    console.warn('[WordPress Sync] ⚠️ WORDPRESS_API_USER or WORDPRESS_API_PASSWORD not configured in .env. Skipping WordPress sync.');
    return;
  }

  try {
    // 1. Get all tickets to find the WordPress Post ID and type
    const tickets = await getDynamicTickets();
    const ticket = tickets.find(t => t.id === ticketId);

    if (!ticket || !ticket.wpPostId) {
      console.warn(`[WordPress Sync] ⚠️ Ticket with ID "${ticketId}" not found or has no WordPress Post ID associated.`);
      return;
    }

    const authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

    if (ticket.stock !== undefined) {
      // CASE A: Individual Ticket (Update stock)
      const fetchUrl = `${baseUrl.replace(/\/$/, '')}/?rest_route=/wp/v2/boleteria-invidual/${ticket.wpPostId}`;
      const getRes = await fetch(fetchUrl, {
        headers: { 'Authorization': authHeader },
        cache: 'no-store'
      });

      if (!getRes.ok) {
        throw new Error(`Failed to fetch current ticket details from WordPress (status: ${getRes.status})`);
      }

      const wpPost = await getRes.json();
      const currentStock = wpPost.acf?.stock !== undefined ? Number(wpPost.acf.stock) : ticket.stock;
      const newStock = Math.max(0, currentStock - quantity);

      console.log(`[WordPress Sync] 📉 Decreasing stock for post ${ticket.wpPostId} (${ticket.name}) from ${currentStock} to ${newStock}`);

      const updateUrl = `${baseUrl.replace(/\/$/, '')}/?rest_route=/wp/v2/boleteria-invidual/${ticket.wpPostId}`;
      const updateRes = await fetch(updateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          acf: { stock: newStock }
        })
      });

      if (!updateRes.ok) {
        const errBody = await updateRes.text();
        throw new Error(`WordPress API returned status ${updateRes.status}: ${errBody}`);
      }

      console.log(`[WordPress Sync] ✅ WordPress stock updated successfully to ${newStock} for ticket "${ticket.name}"`);
    } else {
      // CASE B: Cama/Mesa (Mark as unavailable)
      console.log(`[WordPress Sync] 🚫 Disabling Cama/Mesa ${ticket.wpPostId} (${ticket.name}) in WordPress`);

      const updateUrl = `${baseUrl.replace(/\/$/, '')}/?rest_route=/wp/v2/camas/${ticket.wpPostId}`;
      const updateRes = await fetch(updateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          acf: { available: false }
        })
      });

      if (!updateRes.ok) {
        const errBody = await updateRes.text();
        throw new Error(`WordPress API returned status ${updateRes.status}: ${errBody}`);
      }

      console.log(`[WordPress Sync] ✅ WordPress Cama/Mesa "${ticket.name}" marked as unavailable successfully.`);
    }
  } catch (error) {
    console.error(`[WordPress Sync] ❌ Error updating WordPress status for ticket ${ticketId}:`, error);
  }
}
