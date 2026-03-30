import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Browser-side client (anon key — safe to expose)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side admin client (service role — only used in API routes, never in browser)
export function getSupabaseAdmin() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
}
