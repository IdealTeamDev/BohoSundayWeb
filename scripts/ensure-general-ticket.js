const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hctdykhdekhwvmhrdrnv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdGR5a2hkZWtod3ZtaHJkcm52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2ODIyMjcsImV4cCI6MjA5OTI1ODIyN30.Hy_FKrK3X26_BYtSMznzNGxJH-35UdiOKE_nBpFN5e8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Checking boleteria_individual table in Supabase...');
  
  const { data, error } = await supabase
    .from('boleteria_individual')
    .select('*');
    
  if (error) {
    console.error('Error selecting from boleteria_individual:', error);
    return;
  }
  
  console.log('Current rows in boleteria_individual:', data);

  const existingGeneral = data.find(r => r.id === 'general');
  if (existingGeneral) {
    console.log('Ticket "general" already exists in boleteria_individual:', existingGeneral);
  } else {
    console.log('Inserting "general" ticket into boleteria_individual...');
    const { data: inserted, error: insertErr } = await supabase
      .from('boleteria_individual')
      .upsert([{
        id: 'general',
        name: 'GENERAL',
        price: 250000,
        stock: 100,
      }])
      .select();
      
    if (insertErr) {
      console.error('Error inserting general ticket:', insertErr);
    } else {
      console.log('Successfully inserted general ticket:', inserted);
    }
  }
}

main().catch(console.error);
