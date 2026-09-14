const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdykhdekhwvmhrdrnv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR5a2hkZWtod3ZtaHJkcm52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2ODIyMjcsImV4cCI6MjA5OTI1ODIyN30.Hy_FKrK3X26_BYtSMznzNGxJH-35UdiOKE_nBpFN5e8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addColumn() {
  // Let's check if we can call rpc or query postgres or if we can update start_date / is_active
  const { data, error } = await supabase.rpc('exec_sql', { sql: 'ALTER TABLE event_stages ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;' });
  console.log('RPC result:', data, error);
}

addColumn().catch(console.error);
