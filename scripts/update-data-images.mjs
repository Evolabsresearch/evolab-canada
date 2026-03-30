/**
 * Reads scripts/image-map.json and patches lib/data.js so every
 * rawProducts entry uses the local /images/products/ path.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mapPath = path.join(__dirname, 'image-map.json');
const dataPath = path.join(__dirname, '..', 'lib', 'data.js');

const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
let src = fs.readFileSync(dataPath, 'utf8');

// Replace each image: 'https://...' with image: '/images/products/...'
// We match lines like:  image: 'https://evolabsresearch.ca/wp-content/...'
const replaced = src.replace(
  /image:\s*'(https:\/\/evolabsresearch\.com\/wp-content\/uploads\/[^']+)'/g,
  (match, url) => {
    // Find which product id owns this URL
    const entry = Object.entries(map).find(([, lp]) => {
      // The local filename is: <id>-<original-filename>
      const origFilename = path.basename(new URL(url).pathname);
      return lp.endsWith(origFilename) || lp.includes(origFilename);
    });
    if (entry) {
      return `image: '${entry[1]}'`;
    }
    return match; // leave unchanged if not found
  }
);

if (replaced === src) {
  console.log('No changes made — URLs may already be local or pattern mismatch.');
} else {
  fs.writeFileSync(dataPath, replaced, 'utf8');
  const count = (src.match(/evolabsresearch\.com\/wp-content/g) || []).length;
  console.log(`Patched ${count} image URLs in lib/data.js`);
}
