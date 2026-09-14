const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdykhdekhwvmhrdrnv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR5a2hkZWtod3ZtaHJkcm52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2ODIyMjcsImV4cCI6MjA5OTI1ODIyN30.Hy_FKrK3X26_BYtSMznzNGxJH-35UdiOKE_nBpFN5e8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testGetTickets() {
  // Fetch active stage
  const { data: activeStageArr } = await supabase
    .from('event_stages')
    .select('*')
    .lte('start_date', new Date().toISOString())
    .order('start_date', { ascending: false })
    .limit(1);

  const activeStage = activeStageArr ? activeStageArr[0] : null;
  console.log('Active stage:', activeStage.name, activeStage.prices);

  // Fetch dbCamas
  const { data: dbCamas } = await supabase.from('boleteria_mesas').select('*');

  let combined = dbCamas.map((row) => ({
    id: row.id,
    zone: row.zone,
    name: row.name,
    number: Number(row.number),
    price: Number(row.price),
  }));

  console.log('BEFORE price overrides apply (first 3):', combined.slice(0, 3));

  // Current lib/tickets.ts logic:
  if (activeStage && activeStage.prices && typeof activeStage.prices === 'object') {
    const overrides = activeStage.prices;
    combined = combined.map((t) => {
      if (overrides[t.id] !== undefined) {
        return { ...t, price: Number(overrides[t.id]) };
      }
      if (t.zone && overrides[t.zone] !== undefined) {
        return { ...t, price: Number(overrides[t.zone]) };
      }
      return t;
    });
  }

  console.log('AFTER current lib/tickets.ts price overrides apply (first 3):', combined.slice(0, 3));
}

testGetTickets().catch(console.error);
