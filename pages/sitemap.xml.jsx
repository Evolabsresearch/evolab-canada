// This page generates a dynamic sitemap at /sitemap.xml
import { products } from '../lib/data';

const SITE_URL = 'https://evolabsresearch.ca';

const STATIC_PAGES = [
  { url: '/', changefreq: 'daily', priority: '1.0' },
  { url: '/products', changefreq: 'daily', priority: '0.9' },
  { url: '/research', changefreq: 'weekly', priority: '0.8' },
  { url: '/coa', changefreq: 'weekly', priority: '0.8' },
  { url: '/partners', changefreq: 'monthly', priority: '0.7' },
  { url: '/about', changefreq: 'monthly', priority: '0.6' },
  { url: '/faq', changefreq: 'monthly', priority: '0.7' },
  { url: '/contact', changefreq: 'monthly', priority: '0.5' },
  { url: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { url: '/terms', changefreq: 'yearly', priority: '0.3' },
  { url: '/disclaimer', changefreq: 'yearly', priority: '0.3' },
  { url: '/returns', changefreq: 'yearly', priority: '0.3' },
  { url: '/stacks', changefreq: 'weekly', priority: '0.8' },
  { url: '/bundle', changefreq: 'weekly', priority: '0.7' },
  { url: '/track', changefreq: 'yearly', priority: '0.4' },
  { url: '/wholesale', changefreq: 'monthly', priority: '0.6' },
  { url: '/payment-instructions', changefreq: 'monthly', priority: '0.5' },
  { url: '/research-use', changefreq: 'yearly', priority: '0.4' },
];

const CATEGORY_PAGES = [
  'growth-hormone-peptides',
  'glp-1-research-peptides',
  'healing-regeneration',
  'mitochondrial-peptides',
  'cognitive-neuro',
  'metabolic-peptides',
  'reconstitution-supplies',
  'research-kits',
];

function generateSiteMap(productList) {
  const today = new Date().toISOString().split('T')[0];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${STATIC_PAGES.map(({ url, changefreq, priority }) => `
  <url>
    <loc>${SITE_URL}${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('')}
  ${CATEGORY_PAGES.map(cat => `
  <url>
    <loc>${SITE_URL}/products?category=${cat}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
  ${productList.map(product => `
  <url>
    <loc>${SITE_URL}/products/${product.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  const sitemap = generateSiteMap(products);
  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();
  return { props: {} };
}

export default function Sitemap() {
  return null;
}
