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
            letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif",
          }}>{product.badge}</span>
        )}
        {isOOS && (
          <span style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 9, fontWeight: 600, padding: '3px 9px', borderRadius: 9999, fontFamily: "'DM Sans', sans-serif" }}>Sold Out</span>
        )}
        {!isOOS && product.lowStock && (
          <span style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(220,38,38,0.85)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 9px', borderRadius: 9999, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.04em' }}>Low Stock</span>
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
      <div style={{ padding: '18px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 9, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>{product.category}</span>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#131315', marginBottom: 6, lineHeight: 1.3 }}>{product.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 'auto' }}>
          <div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#131315', fontFamily: "'DM Sans', sans-serif" }}>
              {isOOS ? 'Sold Out' : product.salePrice || product.price}
            </span>
            {product.salePrice && !isOOS && (
              <span style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through', marginLeft: 5, fontFamily: "'DM Sans', sans-serif" }}>{product.price}</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); addToCompare(product.slug); }}
              title={inCompare ? 'Added to compare' : 'Compare'}
              style={{
                background: inCompare ? '#dbeafe' : 'rgba(0,0,0,0.04)',
                border: `1.5px solid ${inCompare ? '#06b6d4' : '#e5e7eb'}`,
                borderRadius: 9999, width: 30, height: 30,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: inCompare ? 'default' : 'pointer', fontSize: 13, lineHeight: 1,
                transition: 'all 0.15s ease', flexShrink: 0,
              }}
            >
              {inCompare ? '✓' : '⇄'}
            </button>
            {!isOOS && (
              <span style={{ background: '#131315', color: '#fff', fontSize: 11, fontWeight: 500, padding: '7px 14px', borderRadius: 9999, fontFamily: "'DM Sans', sans-serif" }}>
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
      {/* Page Header — Split Layout */}
      <div style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #fff 100%)', padding: '48px 0 40px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
            {/* Left: Title & Subtitle */}
            <div style={{ flex: 1, minWidth: 300 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0ea5e9', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                Research Compounds
              </div>
              <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: 12 }}>
                Research Peptides
              </h1>
              <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 400 }}>
                Browse 48+ compounds. Every batch independently tested.
              </p>
            </div>

            {/* Right: Product Count & Sort */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start', gap: 12, minWidth: 250 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>Results:</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#0a0a0a' }}>{products.length}</span>
              </div>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                style={{ fontSize: 13, fontWeight: 500, color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', background: '#fff', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}
              >
                <option value="default">Sort: Featured</option>
                <option value="name">Sort: A–Z</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
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

      {/* Sticky Filter Bar */}
      <div style={{ position: 'sticky', top: 68, zIndex: 50, background: '#fff', paddingTop: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }} className="sticky-filter-bar">
        <div className="container">
          {/* Search Input — Full Width Row */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14 }}>🔍</span>
              <input
                className="input"
                placeholder="Search peptides..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
              />
            </div>
          </div>

          {/* Category Pills Row — Scrollable */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="pills-row">
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>{filtered.length} results</span>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <section className="section">
        <div className="container">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '120px 32px', color: '#9ca3af' }}>
              <div style={{ fontSize: 80, marginBottom: 24, opacity: 0.6 }}>🔬</div>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#374151', marginBottom: 12 }}>No products found</p>
              <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 32, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
                We couldn't find any compounds matching your search. Try adjusting your filters or browsing all categories.
              </p>
              <button onClick={() => { setSearch(''); setActiveCategory('All'); }} className="btn-green" style={{ marginTop: 0 }}>
                Browse All Compounds
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }} className="products-grid">
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
        /* Pills row scrolling behavior */
        .pills-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          -webkit-overflow-scrolling: touch;
        }

        .pills-row::-webkit-scrollbar {
          display: none;
        }

        /* Tablet: 2 columns */
        @media (max-width: 1024px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 24px !important;
          }
          .sticky-filter-bar { top: 56px !important; }
        }

        /* Mobile: 1 column, adjust spacing */
        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .sticky-filter-bar {
            top: 56px !important;
            padding-top: 12px;
            padding-bottom: 12px;
          }
          .pills-row {
            flex-wrap: nowrap;
            overflow-x: auto;
          }
          .pills-row .filter-pill { flex-shrink: 0; }
          .container { padding: 0 16px !important; }
        }

        @media (max-width: 480px) {
          .products-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
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
