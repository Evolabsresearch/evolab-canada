/**
 * recolor-vials.mjs
 *
 * Downloads every product image, applies a per-category hue rotation so
 * the green EvoLabs label becomes the category accent color, then saves
 * the result to public/images/products/<filename>.
 *
 * Run: node scripts/recolor-vials.mjs
 */

import sharp from 'sharp';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'products');
fs.mkdirSync(OUT_DIR, { recursive: true });

// ── Category hue-rotation map ─────────────────────────────────────────────────
// Base green label hue ≈ 162°.  Rotation = targetHue - 162.
// Also tune saturation multiplier so faded or vivid targets look right.
const CAT_ADJUST = {
  'Growth Hormone Peptides':     { hue:  59, saturation: 1.4 },  // → dark blue  #1E3A8A
  'GLP-1 Research Peptides':     { hue: 101, saturation: 1.6 },  // → purple     #4C1D95
  'Healing & Regeneration':      { hue: -12, saturation: 1.0 },  // → dark green #14532D (near base)
  'Mitochondrial Peptides':      { hue: -139, saturation: 1.8 }, // → amber      #92400E
  'Cognitive & Neuro Peptides':  { hue:  52, saturation: 1.3 },  // → dark blue  #1E3A5F
  'Metabolic Peptides':          { hue: 190, saturation: 1.5 },  // → crimson    #9D1C2E
  'Reconstitution Supplies':     { hue: -10, saturation: 0.9 },  // → sage green #1A4731
  'Research Kits':               { hue:  15, saturation: 1.1 },  // → teal       #134E4A
};

// ── Product list (name → category → image URL) ───────────────────────────────
const PRODUCTS = [
  { id:  1, name: 'BPC-157',                           category: 'Healing & Regeneration',     image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-5-315x315.png' },
  { id:  2, name: 'GLP 3 (R)',                         category: 'GLP-1 Research Peptides',    image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-16-315x315.png' },
  { id:  3, name: 'GLP 2 (T)',                         category: 'GLP-1 Research Peptides',    image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-12-315x315.png' },
  { id:  4, name: 'HGH 191aa',                         category: 'Growth Hormone Peptides',    image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-12-1-315x315.png' },
  { id:  5, name: 'NAD+',                              category: 'Mitochondrial Peptides',     image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-21-1-315x315.png' },
  { id:  6, name: 'Epithalon',                         category: 'Mitochondrial Peptides',     image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-9-1-315x315.png' },
  { id:  7, name: 'KLOW',                              category: 'GLP-1 Research Peptides',    image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-38-1-315x315.png' },
  { id:  8, name: 'MOTS-C',                            category: 'Mitochondrial Peptides',     image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-19-1-315x315.png' },
  { id:  9, name: 'Ipamorelin',                        category: 'Growth Hormone Peptides',    image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-14-1-315x315.png' },
  { id: 10, name: 'CJC-1295 w/o DAC',                 category: 'Growth Hormone Peptides',    image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-5-2-315x315.png' },
  { id: 11, name: 'CJC-1295 W/O DAC + Ipamorelin',    category: 'Growth Hormone Peptides',    image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-6-1-315x315.png' },
  { id: 12, name: 'Semax',                             category: 'Cognitive & Neuro Peptides', image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-25-1-315x315.png' },
  { id: 13, name: 'Selank',                            category: 'Cognitive & Neuro Peptides', image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-24-1-315x315.png' },
  { id: 14, name: 'GLP 1 (S)',                         category: 'GLP-1 Research Peptides',    image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-21-315x315.png' },
  { id: 15, name: 'GHK-CU',                            category: 'Healing & Regeneration',     image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/ChatGPT-Image-Mar-9-2026-03_11_03-PM-315x315.png' },
  { id: 16, name: 'Glutathione',                       category: 'Mitochondrial Peptides',     image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-10-1-315x315.png' },
  { id: 17, name: 'BPC 157 + TB 500',                  category: 'Healing & Regeneration',     image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-3-1-315x315.png' },
  { id: 18, name: 'IGF-1LR3',                          category: 'Growth Hormone Peptides',    image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-13-1-315x315.png' },
  { id: 19, name: 'Kisspeptin',                        category: 'Growth Hormone Peptides',    image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-15-1-315x315.png' },
  { id: 20, name: 'KPV',                               category: 'Healing & Regeneration',     image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-17-1-315x315.png' },
  { id: 21, name: 'PT-141',                            category: 'Metabolic Peptides',         image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-23-1-315x315.png' },
  { id: 22, name: 'MT-2 (Melanotan II)',               category: 'Metabolic Peptides',         image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-20-1-315x315.png' },
  { id: 23, name: 'Thymosin Alpha',                    category: 'Healing & Regeneration',     image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-28-315x315.png' },
  { id: 24, name: 'SS31',                              category: 'Mitochondrial Peptides',     image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-27-315x315.png' },
  { id: 25, name: 'SNAP-8',                            category: 'Healing & Regeneration',     image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-26-315x315.png' },
  { id: 26, name: 'GLOW',                              category: 'Healing & Regeneration',     image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-42-1-315x315.png' },
  { id: 27, name: 'DSIP',                              category: 'Cognitive & Neuro Peptides', image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-7-1-315x315.png' },
  { id: 28, name: 'Cerebrolysin',                      category: 'Cognitive & Neuro Peptides', image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-4-315x315.png' },
  { id: 29, name: 'Pinealon',                          category: 'Cognitive & Neuro Peptides', image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-22-1-315x315.png' },
  { id: 30, name: 'Tesa',                              category: 'Growth Hormone Peptides',    image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-11-315x315.png' },
  { id: 31, name: 'Cagrilintide',                      category: 'GLP-1 Research Peptides',    image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-7-315x315.png' },
  { id: 32, name: '5 Amino 1 MQ',                      category: 'Metabolic Peptides',         image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-37-1-315x315.png' },
  { id: 33, name: 'B12',                               category: 'Reconstitution Supplies',    image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-1-1-315x315.png' },
  { id: 34, name: 'LIPO C',                            category: 'Metabolic Peptides',         image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-18-1-315x315.png' },
  { id: 35, name: 'Bac Water 10 mL',                  category: 'Reconstitution Supplies',    image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-2-1-315x315.png' },
  { id: 36, name: 'Bac Water United Labs® (30ML)',     category: 'Reconstitution Supplies',    image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/BAC-Water-315x315.png' },
  { id: 37, name: 'EVO Alpha Research Stack',          category: 'Research Kits',              image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-29-315x315.png' },
  { id: 38, name: 'EVO Cognitive Research Stack',      category: 'Research Kits',              image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-35-1-315x315.png' },
  { id: 39, name: 'EVO Elite Research Stack',          category: 'Research Kits',              image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-56-315x315.png' },
  { id: 40, name: 'EVO Endurance Research Stack',      category: 'Research Kits',              image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-31-315x315.png' },
  { id: 41, name: 'EVO Longevity Research Stack',      category: 'Research Kits',              image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-32-315x315.png' },
  { id: 42, name: 'EVO Metabolic Research Stack',      category: 'Research Kits',              image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-33-315x315.png' },
  { id: 43, name: 'EVO Muscle & Repair Stack',         category: 'Research Kits',              image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-43-1-315x315.png' },
  { id: 44, name: 'EVO GLP-2 (T) 5 Vial Set',         category: 'GLP-1 Research Peptides',    image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-39-315x315.png' },
  { id: 45, name: 'EVO GLP-2 (T) 10 Vial Set',        category: 'GLP-1 Research Peptides',    image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-36-315x315.png' },
  { id: 46, name: 'EVO GLP-3 (R) 5 Vial Set',         category: 'GLP-1 Research Peptides',    image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-47-315x315.png' },
  { id: 47, name: 'EVO GLP-3 (R) 10 Vial Set',        category: 'GLP-1 Research Peptides',    image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-43-315x315.png' },
  { id: 48, name: 'EVO HGH 5 Vial Set',               category: 'Growth Hormone Peptides',    image: 'https://evolabsresearch.ca/wp-content/uploads/2026/02/10MG-55-315x315.png' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function download(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        res.resume();
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function filenameFromUrl(url) {
  return path.basename(new URL(url).pathname);
}

// ── Main ─────────────────────────────────────────────────────────────────────
const LOCAL_PATHS = {}; // id → '/images/products/<filename>'

let ok = 0, fail = 0;
for (const p of PRODUCTS) {
  const adjust = CAT_ADJUST[p.category] ?? { hue: 0, saturation: 1.0 };
  const filename = `${String(p.id).padStart(2, '0')}-${filenameFromUrl(p.image)}`;
  const outPath = path.join(OUT_DIR, filename);
  const localPath = `/images/products/${filename}`;

  // Force reprocess — delete existing
  if (fs.existsSync(outPath)) fs.unlinkSync(outPath);

  try {
    process.stdout.write(`  dl    [${p.id}] ${p.name} ... `);
    const buf = await download(p.image);
    await sharp(buf)
      .modulate({ hue: adjust.hue, saturation: adjust.saturation })
      .png()
      .toFile(outPath);
    LOCAL_PATHS[p.id] = localPath;
    console.log('✓');
    ok++;
  } catch (err) {
    console.log(`✗  ${err.message}`);
    LOCAL_PATHS[p.id] = p.image; // fallback to original URL
    fail++;
  }
}

console.log(`\nDone: ${ok} ok, ${fail} failed`);

// ── Print data.js patch ───────────────────────────────────────────────────────
console.log('\n── LOCAL_PATHS (for data.js) ──');
for (const [id, lp] of Object.entries(LOCAL_PATHS)) {
  console.log(`  ${id}: '${lp}'`);
}

// ── Write a JSON map for the update script ────────────────────────────────────
const mapPath = path.join(__dirname, 'image-map.json');
fs.writeFileSync(mapPath, JSON.stringify(LOCAL_PATHS, null, 2));
console.log(`\nWrote image map to ${mapPath}`);
