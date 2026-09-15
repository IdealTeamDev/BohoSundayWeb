import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://placeholder.supabase.co';

// Prioritize SUPABASE_SERVICE_ROLE_KEY for server-side API routes so database operations bypass RLS
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.CUSTOM_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'placeholder';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
 
