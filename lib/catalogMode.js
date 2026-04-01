/**
 * Catalog Mode — three-mode site access control
 * Modes: gated | open_catalog | full_open
 * Reads from site_settings table, caches for 60s
 */
import { createClient } from '@supabase/supabase-js';

// Module-level cache — refreshes every 60 seconds
// Default to open_catalog so visitors can browse products without login
let cache = { mode: 'open_catalog', fetchedAt: 0 };
const CACHE_TTL = 60 * 1000;

export async function getCatalogMode() {
  const now = Date.now();
  if (now - cache.fetchedAt < CACHE_TTL) {
    return cache.mode;
  }
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'catalog_mode')
      .single();

    if (data?.value) {
      const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
      // Handle both old format (gated: bool) and new (mode: string)
      const mode = parsed.mode || (parsed.gated ? 'gated' : 'open_catalog');
      cache = { mode, fetchedAt: now };
      return mode;
    }
  } catch (e) {
    console.warn('catalogMode fetch error:', e?.message);
    // On error: default to open_catalog so visitors can still browse
  }
  return 'open_catalog';
}

export const MODES = {
  GATED: 'gated',
  OPEN_CATALOG: 'open_catalog',
  FULL_OPEN: 'full_open',
};

export function isProductsPublic(mode) {
  return mode === 'open_catalog' || mode === 'full_open';
}

export function isCheckoutPublic(mode) {
  return mode === 'full_open';
}
