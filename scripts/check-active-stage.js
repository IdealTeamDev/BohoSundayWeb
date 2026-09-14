const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdykhdekhwvmhrdrnv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR5a2hkZWtod3ZtaHJkcm52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2ODIyMjcsImV4cCI6MjA5OTI1ODIyN30.Hy_FKrK3X26_BYtSMznzNGxJH-35UdiOKE_nBpFN5e8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCurrentStages() {
  const { data: stages } = await supabase.from('event_stages').select('*').order('start_date', { ascending: true });
  console.log('Current stages in DB:', JSON.stringify(stages, null, 2));

  // Check active stage returned by getActiveStage logic
  const { data: active } = await supabase
    .from('event_stages')
    .select('*')
    .lte('start_date', new Date().toISOString())
    .order('start_date', { ascending: false })
    .limit(1);

  console.log('getActiveStage() would return:', active);
}

checkCurrentStages().catch(console.error);
