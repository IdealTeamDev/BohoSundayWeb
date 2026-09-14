const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdykhdekhwvmhrdrnv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR5a2hkZWtod3ZtaHJkcm52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2ODIyMjcsImV4cCI6MjA5OTI1ODIyN30.Hy_FKrK3X26_BYtSMznzNGxJH-35UdiOKE_nBpFN5e8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOverride() {
  const { data: dbCamas } = await supabase.from('boleteria_mesas').select('*');
  const { data: stages } = await supabase.from('event_stages').select('*');
  
  const activeStage = stages.find(s => s.name === 'BELIEVERS');
  console.log('Active stage prices:', activeStage.prices);

  const overrides = activeStage.prices || {};

  const mapped = dbCamas.map((row) => {
    const t = {
      id: row.id,
      zone: row.zone,
      name: row.name,
      price: Number(row.price),
    };

    // Check matching
    const zoneKey = (t.zone || '').toLowerCase();
    const idPrefix = (t.id || '').split('-')[0].toLowerCase();
    const nameLower = (t.name || '').toLowerCase();

    let matchedPrice = undefined;
    if (overrides[t.id] !== undefined) {
      matchedPrice = Number(overrides[t.id]);
    } else if (zoneKey && overrides[zoneKey] !== undefined) {
      matchedPrice = Number(overrides[zoneKey]);
    } else if (idPrefix && overrides[idPrefix] !== undefined) {
      matchedPrice = Number(overrides[idPrefix]);
    } else {
      // Find key in overrides that matches nameLower
      for (const k of Object.keys(overrides)) {
        if (nameLower.includes(k.toLowerCase())) {
          matchedPrice = Number(overrides[k]);
          break;
        }
      }
    }

    return {
      id: t.id,
      name: t.name,
      originalPrice: t.price,
      overridePrice: matchedPrice ?? t.price
    };
  });

  console.log('Sample mapped results (first 5):', mapped.slice(0, 5));
}

testOverride().catch(console.error);
