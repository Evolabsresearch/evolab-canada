/**
 * sharpen-vials.mjs
 * Upscales all product images in public/images/products/ from 315×315 → 630×630
 * using high-quality Lanczos3 interpolation, then applies adaptive sharpening.
 * Run once after recolor-vials.mjs: node scripts/sharpen-vials.mjs
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '..', 'public', 'images', 'products');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
console.log(`Found ${files.length} images to sharpen → 630×630`);

let done = 0;
let failed = 0;

for (const file of files) {
  const fp = path.join(dir, file);
  const tmp = fp.replace('.png', '_sharp_tmp.png');
  try {
    await sharp(fp)
      .resize(630, 630, {
        kernel: sharp.kernel.lanczos3,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .sharpen({ sigma: 1.0, m1: 1.5, m2: 0.5 })
      .png({ compressionLevel: 8, effort: 8 })
      .toFile(tmp);

    fs.renameSync(tmp, fp);
    done++;
    process.stdout.write(`\r  ${done}/${files.length} — ${file.slice(0, 40)}`);
  } catch (e) {
    failed++;
    console.error(`\n  FAIL ${file}: ${e.message}`);
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  }
}

console.log(`\n\nDone! ${done} sharpened, ${failed} failed.`);
console.log('Images are now 630×630 px — crisp at all display sizes.');
