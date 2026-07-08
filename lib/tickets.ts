import { tickets as staticTickets } from '@/data/tickets';
import type { Ticket, ZoneType } from '@/types';

/**
 * Fetch tickets dynamically from WordPress REST API (ACF Camas)
 * and merge them with static individual tickets.
 * Fallback to static tickets if API fails or returns no data.
 */
export async function getDynamicTickets(): Promise<Ticket[]> {
  const baseUrl = process.env.WORDPRESS_API_URL || 'https://bohosundayapp.wpenginepowered.com';
  
  // WordPress plain permalink route fallback for robustness
  const url = `${baseUrl.replace(/\/$/, '')}/?rest_route=/wp/v2/camas&lang=es&nocache=${Date.now()}`;
  
  try {
    const res = await fetch(url, {
      cache: 'no-store', // Disable caching in Next.js/Vercel
    });
    
    if (!res.ok) {
      throw new Error(`WordPress API returned status ${res.status}`);
    }
    
    const wpData = await res.json();
    
    if (!Array.isArray(wpData)) {
      throw new Error('WordPress API response is not an array');
    }
    
    // Fallback to static list if WordPress has no entries
    if (wpData.length === 0) {
      console.warn('[Tickets Service] WordPress returned 0 camas. Falling back to static data.');
      return staticTickets;
    }
    
    const wordpressTickets: Ticket[] = wpData.map((item: any) => {
      const acf = item.acf || {};
      
      // Resolve zone safely (handles class_list categories slug extraction or direct acf zone)
      let zoneVal: ZoneType = 'general';
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
      
      // Resolve available safely from root or nested row
      let isAvailable = true;
      if (acf.available !== undefined) {
        isAvailable = acf.available === true || acf.available === '1' || acf.available === 1;
      } else if (row && row.available !== undefined) {
        isAvailable = row.available === true || row.available === '1' || row.available === 1;
      }
      
      // Resolve position safely from root or nested row
      let x = 0;
      let y = 0;
      const positionSource = acf.position || (row ? row.position : null);
      if (Array.isArray(positionSource) && positionSource.length > 0) {
        const posRow = positionSource[0];
        x = Number(posRow.x) || 0;
        y = Number(posRow.y) || 0;
      }
      
      return {
        id: String(acf.id || item.id || `wp-${item.slug || Math.random()}`),
        zone: zoneVal,
        iconCard: acf.iconcard || undefined,
        img: acf.img || '',
        name: acf.name || item.title?.rendered || 'Mesa/Cama',
        description: acf.description || undefined,
        number: Number(acf.number) || 0,
        persons: Number(acf.persons) || 0,
        price: Number(acf.price) || 0,
        currency: acf.currency || 'COP',
        includes: { licor, agua, redBull },
        available: isAvailable,
        disabled: !isAvailable,
        position: { x, y }
      };
    });
    
    // Filter out static general tickets (like early, anytime) and combine with WordPress camas
    const staticIndividual = staticTickets.filter(t => t.zone === 'general');
    return [...wordpressTickets, ...staticIndividual];
    
  } catch (error) {
    console.error('[Tickets Service] Error fetching tickets from WordPress, using static fallback:', error);
    return staticTickets;
  }
}
