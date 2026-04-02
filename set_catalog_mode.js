const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setCatalogMode() {
  console.log('Setting catalog_mode to full_open...');
  const { data, error } = await supabase
    .from('store_settings')
    .upsert(
      { key: 'catalog_mode', value: JSON.stringify({ mode: 'full_open' }) },
      { onConflict: 'key' }
    );

  if (error) {
    console.error('Error updating catalog_mode:', error);
  } else {
    console.log('Successfully set catalog_mode to full_open.');
  }
}

setCatalogMode();
