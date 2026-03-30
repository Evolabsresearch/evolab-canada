/**
 * cap-tint.mjs
 * Tints the metallic silver cap of every vial to match its category accent color.
 * Targets low-saturation (gray/silver) pixels in the upper 40% of each image.
 * Run: node scripts/cap-tint.mjs
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '..', 'public', 'images', 'products');

// Category accent colors (hex → RGB) — must match CATEGORIES in lib/data.js
const CAT_ACCENT = {
  'growth':       { r: 30,  g: 58,  b: 138 }, // #1E3A8A  Growth Hormone
  'glp1':         { r: 76,  g: 29,  b: 149 }, // #4C1D95  GLP-1
  'healing':      { r: 20,  g: 83,  b: 45  }, // #14532D  Healing & Regen
  'mitochondrial':{ r: 146, g: 64,  b: 14  }, // #92400E  Mitochondrial
  'cognitive':    { r: 30,  g: 58,  b: 95  }, // #1E3A5F  Cognitive
  'metabolic':    { r: 157, g: 28,  b: 46  }, // #9D1C2E  Metabolic
  'supplies':     { r: 26,  g: 71,  b: 49  }, // #1A4731  Supplies
  'kits':         { r: 19,  g: 78,  b: 74  }, // #134E4A  Research Kits
};

// Map product filename prefix (id) → category key
// Based on product list order in recolor-vials.mjs
const ID_TO_CAT = {
  '01': 'healing',      // BPC-157
  '02': 'glp1',         // GLP 3 (R)
  '03': 'glp1',         // GLP 2 (T)
  '04': 'growth',       // HGH 191aa
  '05': 'mitochondrial',// NAD+
  '06': 'mitochondrial',// Epithalon
  '07': 'glp1',         // KLOW
  '08': 'mitochondrial',// MOTS-C
  '09': 'growth',       // Ipamorelin
  '10': 'growth',       // CJC-1295 w/o DAC
  '11': 'growth',       // CJC-1295 + Ipamorelin
  '12': 'cognitive',    // Semax
  '13': 'cognitive',    // Selank
  '14': 'glp1',         // GLP 1 (S)
  '15': 'healing',      // GHK-CU
  '16': 'mitochondrial',// Glutathione
  '17': 'healing',      // BPC 157 + TB 500
  '18': 'growth',       // IGF-1LR3
  '19': 'growth',       // Kisspeptin
  '20': 'healing',      // KPV
  '21': 'metabolic',    // PT-141
  '22': 'metabolic',    // MT-2
  '23': 'healing',      // Thymosin Alpha
  '24': 'mitochondrial',// SS31
  '25': 'healing',      // SNAP-8
  '26': 'healing',      // GLOW
  '27': 'cognitive',    // DSIP
  '28': 'cognitive',    // Cerebrolysin
  '29': 'cognitive',    // Pinealon
  '30': 'growth',       // Tesa
  '31': 'glp1',         // Cagrilintide
  '32': 'metabolic',    // 5 Amino 1 MQ
  '33': 'supplies',     // B12
  '34': 'metabolic',    // LIPO C
  '35': 'supplies',     // Bac Water 10mL
  '36': 'supplies',     // Bac Water 30mL
  '37': 'kits',         // EVO Alpha Stack
  '38': 'kits',         // EVO Cognitive Stack
  '39': 'kits',         // EVO Elite Stack
  '40': 'kits',         // EVO Endurance Stack
  '41': 'kits',         // EVO Longevity Stack
  '42': 'kits',         // EVO Metabolic Stack
  '43': 'kits',         // EVO Muscle & Repair
  '44': 'glp1',         // EVO GLP-2 (T) 5 Vial
  '45': 'glp1',         // EVO GLP-2 (T) 10 Vial
  '46': 'glp1',         // EVO GLP-3 (R) 5 Vial
  '47': 'glp1',         // EVO GLP-3 (R) 10 Vial
  '48': 'growth',       // EVO HGH 5 Vial Set
};

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h, s, l];
}

const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
console.log(`Processing ${files.length} images for cap tinting...\n`);

let done = 0, skipped = 0, failed = 0;

for (const file of files) {
  const id = file.slice(0, 2); // first two chars = product id
  const catKey = ID_TO_CAT[id];
  if (!catKey) { skipped++; continue; }

  const accent = CAT_ACCENT[catKey];
  const fp = path.join(dir, file);
  const tmp = fp.replace('.png', '_captmp.png');

  try {
    const { data, info } = await sharp(fp)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;
    const capZoneBottom = Math.floor(height * 0.42); // top 42% = cap region
    const blend = 0.45; // how strongly to tint (0=none, 1=full replace)

    for (let y = 0; y < capZoneBottom; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * channels;
        const a = data[i + 3];
        if (a < 30) continue; // skip fully transparent

        const pr = data[i], pg = data[i + 1], pb = data[i + 2];
        const [, sat, light] = rgbToHsl(pr, pg, pb);

        // Target: low saturation (silver/gray cap) with reasonable brightness
        if (sat < 0.15 && light > 0.40 && light < 0.88) {
          // Blend pixel toward accent color
          data[i]     = Math.round(pr * (1 - blend) + accent.r * blend);
          data[i + 1] = Math.round(pg * (1 - blend) + accent.g * blend);
          data[i + 2] = Math.round(pb * (1 - blend) + accent.b * blend);
        }
      }
    }

    await sharp(data, { raw: { width, height, channels } })
      .png({ compressionLevel: 8, effort: 8 })
      .toFile(tmp);

    fs.renameSync(tmp, fp);
    done++;
    process.stdout.write(`\r  ${done + failed} / ${files.length - skipped}  ${file.slice(0, 50)}`);
  } catch (e) {
    failed++;
    console.error(`\n  FAIL ${file}: ${e.message}`);
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  }
}

console.log(`\n\nDone! ${done} tinted, ${failed} failed, ${skipped} skipped (no id match).`);
