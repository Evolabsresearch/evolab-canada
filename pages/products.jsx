import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { CATEGORIES, getCategoryConfig } from '../lib/data';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';

function Stars({ n = 5, size = 12 }) {
  return <span style={{ color: '#f59e0b', fontSize: size }}>{'★'.repeat(Math.floor(n))}{'☆'.repeat(5 - Math.floor(n))}</span>;
}

function ProductCard({ product }) {
  const isOOS = product.outOfStock;
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.slug);
  const { addToCompare, isInCompare } = useCompare();
  const inCompare = isInCompare(product.slug);
  return (
    <Link href={`/products/${product.slug}`} style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', background: '#fff', borderRadius: 20, border: '1.5px solid #e5e7eb', overflow: 'hidden', transition: 'transform 0.25s ease, box-shadow 0.25s ease' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.10)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{
        background: '#ffffff',
        padding: 0, position: 'relative', aspectRatio: '1/1',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }}>
        {product.badge && (
          <span style={{
            position: 'absolute', top: 10, left: 10, zIndex: 2,
            background: '#131315', color: '#fff',
            fontSize: 9, fontWeight: 600, padding: '3px 9px', borderRadius: 9999,
            letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: "'Poppins', sans-serif",
          }}>{product.badge}</span>
        )}
        {isOOS && (
          <span style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 9, fontWeight: 600, padding: '3px 9px', borderRadius: 9999, fontFamily: "'Poppins', sans-serif" }}>Sold Out</span>
        )}
        {!isOOS && product.lowStock && (
          <span style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(220,38,38,0.85)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 9px', borderRadius: 9999, fontFamily: "'Poppins', sans-serif", letterSpacing: '0.04em' }}>Low Stock</span>
        )}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(product.slug); }}
          title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          style={{
            position: 'absolute', top: (isOOS || product.lowStock) ? 36 : 10, right: 10, zIndex: 3,
            background: wishlisted ? '#fff0f3' : 'rgba(255,255,255,0.85)',
            border: 'none', borderRadius: '50%', width: 30, height: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 14, lineHeight: 1,
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
            transition: 'background 0.15s ease',
          }}
        >
          {wishlisted ? '❤️' : '🤍'}
        </button>
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: '90%', height: '90%', objectFit: 'contain',
            transition: 'transform 0.3s ease',
          }}
          loading="lazy"
        />
      </div>
      {/* Info panel */}
      <div style={{ padding: '14px 16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 9, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, fontFamily: "'Poppins', sans-serif" }}>{product.category}</span>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#131315', marginBottom: 6, lineHeight: 1.3 }}>{product.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 'auto' }}>
          <div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#131315', fontFamily: "'Poppins', sans-serif" }}>
              {isOOS ? 'Sold Out' : product.salePrice || product.price}
            </span>
            {product.salePrice && !isOOS && (
              <span style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through', marginLeft: 5, fontFamily: "'Poppins', sans-serif" }}>{product.price}</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); addToCompare(product.slug); }}
              title={inCompare ? 'Added to compare' : 'Compare'}
              style={{
                background: inCompare ? '#e8f5e9' : 'rgba(0,0,0,0.04)',
                border: `1.5px solid ${inCompare ? '#4ade80' : '#e5e7eb'}`,
                borderRadius: 9999, width: 30, height: 30,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: inCompare ? 'default' : 'pointer', fontSize: 13, lineHeight: 1,
                transition: 'all 0.15s ease', flexShrink: 0,
              }}
            >
              {inCompare ? '✓' : '⇄'}
            </button>
            {!isOOS && (
              <span style={{ background: '#131315', color: '#fff', fontSize: 11, fontWeight: 500, padding: '7px 14px', borderRadius: 9999, fontFamily: "'Poppins', sans-serif" }}>
                View →
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ProductsPage({ products, catalogMode = 'gated', isGuest = false }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [adminBypass, setAdminBypass] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sort, setSort] = useState('default');
  const [search, setSearch] = useState('');
  const productsPublic = catalogMode === 'open_catalog' || catalogMode === 'full_open';

  // Admin bypass
  useEffect(() => {
    setAdminBypass(!!localStorage.getItem('evo_admin_pw') && !sessionStorage.getItem('evo_preview_guest'));
  }, []);

  // Auth gate — redirect unauthenticated users to login (only in gated mode)
  useEffect(() => {
    if (!productsPublic && status === 'unauthenticated' && !adminBypass) router.push('/account/login');
  }, [status, adminBypass, router, productsPublic]);

  // Sync category and search from query params
  useEffect(() => {
    if (router.query.category) setActiveCategory(router.query.category);
    if (router.query.search) setSearch(router.query.search);
  }, [router.query.category, router.query.search]);

  if (!productsPublic && (status === 'loading' || (!session && !adminBypass))) return null;

  const categoryNames = ['All', ...CATEGORIES.map(c => c.name)];

  let filtered = products.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (sort === 'price-asc') {
    filtered = [...filtered].sort((a, b) => parseFloat((a.salePrice || a.price).replace(/[^0-9.]/g, '')) - parseFloat((b.salePrice || b.price).replace(/[^0-9.]/g, '')));
  } else if (sort === 'price-desc') {
    filtered = [...filtered].sort((a, b) => parseFloat((b.salePrice || b.price).replace(/[^0-9.]/g, '')) - parseFloat((a.salePrice || a.price).replace(/[^0-9.]/g, '')));
  } else if (sort === 'name') {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <Layout title="Buy Research Peptides Canada | EVO Labs Research Canada" description="Browse all 48+ research-grade peptides from EVO Labs Research Canada. 99%+ purity guaranteed. Filter by category, sort by price. COA available for every batch. Ships across Canada via Canada Post.">
      {/* Page Header */}
      <div style={{ background: '#0a0a0a', padding: '64px 0 56px' }}>
        <div className="container">
          <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
            Research Compounds
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 16 }}>
            All Peptides & Compounds
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', maxWidth: 500 }}>
            {products.length} compounds. Every one independently tested. COA available before you buy.
          </p>
        </div>
      </div>

      {/* Guest banner */}
      {isGuest && catalogMode === 'open_catalog' && (
        <div style={{ background: '#C9A96E', color: '#1A1A1A', textAlign: 'center', padding: '12px 16px', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span>Sign in or create a free account to place orders</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/account/login" style={{ background: '#1A1A1A', color: '#fff', padding: '6px 16px', borderRadius: 9999, fontSize: 12, fontWeight: 700 }}>Sign In</Link>
            <Link href="/account/login?tab=register" style={{ background: 'transparent', color: '#1A1A1A', padding: '6px 16px', borderRadius: 9999, fontSize: 12, fontWeight: 700, border: '1.5px solid #1A1A1A' }}>Create Account</Link>
          </div>
        </div>
      )}
      {isGuest && catalogMode === 'full_open' && (
        <div style={{ background: '#2A5C45', color: '#FFFFFF', textAlign: 'center', padding: '12px 16px', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span>Add to cart and checkout without an account</span>
          <Link href="#products" style={{ background: '#fff', color: '#2A5C45', padding: '6px 16px', borderRadius: 9999, fontSize: 12, fontWeight: 700 }}>Shop Now</Link>
        </div>
      )}

      {/* Filters */}
      <div style={{ borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 72, zIndex: 100, background: '#fff' }} className="filter-bar">
        <div className="container" style={{ padding: '0 32px' }}>
          {/* Category pills */}
          <div className="pills-row">
            {categoryNames.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`filter-pill${activeCategory === cat ? ' active' : ''}`}
              >
                {cat === 'All' ? `All (${products.length})` : `${cat} (${products.filter(p => p.category === cat).length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Controls bar */}
      <div style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0', padding: '14px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 300, flex: 1 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14 }}>🔍</span>
            <input
              className="input"
              placeholder="Search peptides..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 40, padding: '10px 16px 10px 40px', borderRadius: 100 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13, color: '#9ca3af' }}>{filtered.length} results</span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{ fontSize: 13, fontWeight: 500, color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: 100, padding: '8px 16px', background: '#fff', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}
            >
              <option value="default">Sort: Featured</option>
              <option value="name">Sort: A–Z</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <section className="section">
        <div className="container">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔬</div>
              <p style={{ fontSize: 18, fontWeight: 600, color: '#374151' }}>No products found</p>
              <p style={{ fontSize: 14, marginTop: 8 }}>Try adjusting your search or category filter.</p>
              <button onClick={() => { setSearch(''); setActiveCategory('All'); }} className="btn-green" style={{ marginTop: 24 }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }} className="products-grid">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ background: '#f8fafc', padding: '56px 0', borderTop: '1px solid #f0f0f0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: '#0a0a0a', marginBottom: 8 }}>Need a COA for your research?</h3>
            <p style={{ fontSize: 14, color: '#6b7280' }}>Every batch independently tested. Download any COA from our public library.</p>
          </div>
          <Link href="/coa" className="btn-green">View COA Library →</Link>
        </div>
      </section>

      <style>{`
        /* Desktop: pills wrap to multiple rows */
        .pills-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 16px 0;
        }
        /* Mobile: single scrollable row — no overlap with products */
        @media (max-width: 768px) {
          .filter-bar { top: 56px !important; }
          .pills-row {
            flex-wrap: nowrap;
            overflow-x: auto;
            padding: 12px 0;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .pills-row::-webkit-scrollbar { display: none; }
          .pills-row .filter-pill { flex-shrink: 0; }
          .container { padding: 0 16px !important; }
        }
        @media (max-width: 1024px) {
          .products-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .products-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
        }
        @media (max-width: 480px) {
          .products-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  );
}

function normalizeProduct(row, validCats, staticCatByName, staticBySlug) {
  const fmt = (v) => {
    if (v == null) return null;
    if (typeof v === 'number') return `$${v.toFixed(2)}`;
    const s = String(v);
    return /^\d+(\.\d+)?$/.test(s) ? `$${s}` : s;
  };
  // If Supabase has a WooCommerce category name that doesn't match our filter tabs,
  // look it up by product name in the static data to get the correct category.
  let category = row.category || '';
  if (validCats && staticCatByName && !validCats.has(category)) {
    category = staticCatByName[row.name?.toLowerCase()] || category;
  }
  const stat = (staticBySlug && row.slug) ? (staticBySlug[row.slug] || {}) : {};
  return {
    id: row.id,
    name: row.name || stat.name || '',
    slug: row.slug || '',
    price: fmt(row.price) || stat.price || '',
    salePrice: (() => {
      const sp = row.sale_price ? fmt(row.sale_price) : (stat.salePrice || null);
      const pr = fmt(row.price) || stat.price || '';
      // Don't show strikethrough if sale price equals regular price
      return (sp && sp !== pr) ? sp : null;
    })(),
    category,
    description: row.description || '',
    image: row.image || stat.image || '',
    gallery: row.gallery || [],
    sizes: row.sizes || [],
    badge: row.badge || null,
    shopUrl: row.shop_url || '',
    outOfStock: row.out_of_stock || false,
    lowStock: row.low_stock || false,
    stock: row.stock || 0,
    rating: row.rating || 4.9,
    reviewCount: row.review_count || 100,
  };
}

export async function getServerSideProps(ctx) {
  const { getCatalogMode, isProductsPublic } = await import('../lib/catalogMode');
  const mode = await getCatalogMode();
  const { getServerSession } = await import('next-auth/next');
  const { authOptions } = await import('./api/auth/[...nextauth]');
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const isAdmin = ctx.req.cookies?.evo_admin === '1';
  const isLoggedIn = !!session || isAdmin;

  if (!isProductsPublic(mode) && !isLoggedIn) {
    return { redirect: { destination: '/account/login?redirect=/products', permanent: false } };
  }

  // Always load static products — used as category lookup source of truth
  const { products: staticProducts, CATEGORIES: STATIC_CATS } = await import('../lib/data');
  const validCats = new Set(STATIC_CATS.map(c => c.name));
  const staticCatByName = {};
  const staticBySlug = {};
  staticProducts.forEach(p => {
    staticCatByName[p.name.toLowerCase()] = p.category;
    if (p.slug) staticBySlug[p.slug] = p;
  });

  try {
    const { getSupabaseAdmin } = await import('../lib/supabase');
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from('products')
      .select('id, name, slug, price, sale_price, category, description, image, gallery, sizes, badge, shop_url, out_of_stock, low_stock, stock, rating, review_count')
      .order('id');
    if (!error && data && data.length > 0) {
      return { props: { products: data.map(row => normalizeProduct(row, validCats, staticCatByName, staticBySlug)), catalogMode: mode, isGuest: !isLoggedIn } };
    }
  } catch (e) {
    console.error('Supabase products fetch failed:', e.message);
  }
  // Fallback: static lib/data products (already have correct categories)
  return { props: { products: staticProducts, catalogMode: mode, isGuest: !isLoggedIn } };
}
