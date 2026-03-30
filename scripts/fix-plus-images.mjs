/**
 * Fix image paths for 3 products with + in filenames
 */
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://jkhcsjvsmvdnehrrlrud.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpraGNzanZzbXZkbmVocnJscnVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzQ3MTI3MiwiZXhwIjoyMDg5MDQ3MjcyfQ.LSsCdskACyf_6mXybw3izCEUot3ltHuNxO4G5ZWPGaM'
);

// Fix main product.image for 3 products
const MAIN_FIXES = [
  { id: 988073, image: '/images/products/catalog/BPC-157 TB500 20MG.png' },
  { id: 988134, image: '/images/products/catalog/NAD-Plus 500MG.png' },
  { id: 988082, image: '/images/products/catalog/CJC-1295 Ipamorelin 10MG.png' },
];

// Fix sizes[].imageUrl for CJC+Ipa (id 988082) which has per-size images
// and NAD+ (id 988134) has no per-size images, BPC+TB500 (id 988073) has no per-size images

let ok = 0, fail = 0;

for (const { id, image } of MAIN_FIXES) {
  const { error } = await sb.from('products').update({ image }).eq('id', id);
  if (error) { console.error(`  ✗ id=${id}: ${error.message}`); fail++; }
  else { console.log(`  ✓ id=${id}: ${image}`); ok++; }
}

// Fix CJC-1295 + Ipamorelin sizes imageUrl
const { data: cjcRow, error: cjcErr } = await sb.from('products').select('id, name, sizes').eq('id', 988082).single();
if (cjcErr) {
  console.error('Failed to fetch CJC row:', cjcErr.message);
} else if (cjcRow?.sizes?.length) {
  const updatedSizes = cjcRow.sizes.map(s => ({
    ...s,
    imageUrl: s.imageUrl?.includes('CJC-1295 + Ipamorelin') || s.imageUrl?.includes('CJC-1295%20%2B%20Ipamorelin')
      ? '/images/products/catalog/CJC-1295 Ipamorelin 10MG.png'
      : s.imageUrl,
  }));
  const { error: upErr } = await sb.from('products').update({ sizes: updatedSizes }).eq('id', 988082);
  if (upErr) { console.error(`  ✗ CJC sizes: ${upErr.message}`); fail++; }
  else { console.log(`  ✓ CJC sizes updated`); ok++; }
}

console.log(`\nDone: ${ok} updated, ${fail} failed`);
