const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdykhdekhwvmhrdrnv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR5a2hkZWtod3ZtaHJkcm52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2ODIyMjcsImV4cCI6MjA5OTI1ODIyN30.Hy_FKrK3X26_BYtSMznzNGxJH-35UdiOKE_nBpFN5e8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
  const { data, error } = await supabase
    .from('event_stages')
    .select('*')
    .eq('name', 'BELIEVERS')
    .single();

  if (error) {
    console.error('Error fetching stage:', error);
    return;
  }

  console.log('Stage BEFORE update:', data);

  // Update prices or dates test
  const updatedPrices = {
    ...data.prices,
    general: 250000
  };

  const { data: res, error: updateErr } = await supabase
    .from('event_stages')
    .update({ prices: updatedPrices })
    .eq('id', data.id)
    .select();

  console.log('Update result:', res, updateErr);
}

testUpdate().catch(console.error);
