/**
 * blue-powder.mjs
 * Adds a blue lyophilized powder appearance to the bottom of GHK-CU, GLOW, and KLOW vials.
 * Creates a soft blue elliptical glow in the lower vial body to simulate blue powder.
 * Run: node scripts/blue-powder.mjs
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '..', 'public', 'images', 'products');

// Target files by id prefix
const TARGETS = ['07', '15', '26']; // 07=KLOW, 15=GHK-CU, 26=GLOW

const files = fs.readdirSync(dir).filter(f => {
  const id = f.slice(0, 2);
  return TARGETS.includes(id) && f.endsWith('.png');
});

if (files.length === 0) {
  console.error('No matching files found. Check filenames start with 07, 15, or 26.');
  process.exit(1);
}

console.log(`Adding blue powder to ${files.length} vials: ${files.join(', ')}\n`);

// Blue powder color: rich cornflower / icy blue
const POWDER_R = 70, POWDER_G = 130, POWDER_B = 230;

for (const file of files) {
  const fp = path.join(dir, file);
  const tmp = fp.replace('.png', '_powdertmp.png');

  try {
    const { data, info } = await sharp(fp)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;

    // Powder zone: bottom 30% of image, centered ellipse
    // Inside the vial glass = roughly center 60% width, y from 68% to 95%
    const powderTop    = Math.floor(height * 0.68);
    const powderBottom = Math.floor(height * 0.95);
    const ellipseW     = width  * 0.28; // half-width of ellipse
    const ellipseH     = (powderBottom - powderTop) * 0.5;
    const cx = width / 2;
    const cy = (powderTop + powderBottom) / 2;

    for (let y = powderTop; y < powderBottom; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * channels;
        const a = data[i + 3];
        if (a < 30) continue; // skip transparent bg

        // Ellipse distance (0 = center, 1 = edge)
        const dx = (x - cx) / ellipseW;
        const dy = (y - cy) / ellipseH;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1.0) continue;

        // Smooth falloff: strongest at center, fades at edge
        // Use 0.82 to overpower even heavily hue-rotated (purple) backgrounds
        const strength = Math.max(0, 1 - dist) * 0.82;

        const pr = data[i], pg = data[i + 1], pb = data[i + 2];
        data[i]     = Math.round(pr * (1 - strength) + POWDER_R * strength);
        data[i + 1] = Math.round(pg * (1 - strength) + POWDER_G * strength);
        data[i + 2] = Math.round(pb * (1 - strength) + POWDER_B * strength);
      }
    }

    await sharp(data, { raw: { width, height, channels } })
      .png({ compressionLevel: 8, effort: 8 })
      .toFile(tmp);

    fs.renameSync(tmp, fp);
    console.log(`  ✓  ${file}`);
  } catch (e) {
    console.error(`  ✗  ${file}: ${e.message}`);
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  }
}

console.log('\nDone! GHK-CU, GLOW, and KLOW now show blue powder.');
