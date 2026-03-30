import Link from 'next/link';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { products, getCategoryConfig } from '../lib/data';

// Pull the actual EVO Stack products from the Research Kits category + visual metadata
const EVO_STACK_META = {
  'evo-alpha-research-stack':    { color: '#E8F5EE', accentColor: '#14532D', icon: '⚗️',  tagline: 'Growth, recovery & metabolic performance' },
  'evo-cognitive-research-stack':{ color: '#E8EFF9', accentColor: '#1E3A5F', icon: '🧠',  tagline: 'Neuroplasticity, focus & neuroprotection' },
  'evo-elite-research-stack':    { color: '#f0f0ff', accentColor: '#3730a3', icon: '⭐',  tagline: 'Premium multi-pathway research bundle' },
  'evo-endurance-research-stack':{ color: '#FFF7ED', accentColor: '#92400E', icon: '⚡',  tagline: 'Cardiovascular & mitochondrial efficiency' },
  'evo-longevity-research-stack':{ color: '#FEF3C7', accentColor: '#78350F', icon: '🌿',  tagline: 'Telomere, anti-aging & cellular health' },
  'evo-metabolic-research-stack':{ color: '#EEE8FA', accentColor: '#4C1D95', icon: '💊',  tagline: 'GLP-class metabolic optimization protocol' },
  'evo-muscle-repair-stack':     { color: '#E8F5EE', accentColor: '#14532D', icon: '💪',  tagline: 'Growth hormone & connective tissue repair' },
};
const EVO_STACKS = products.filter(p => p.category === 'Research Kits' && EVO_STACK_META[p.slug]);

// Curated research stacks — each has slugs + per-item dosage for cart
const STACKS = [
  {
    id: 'recovery-healing',
    name: 'Recovery & Regeneration Stack',
    tagline: 'The most studied healing combination',
    description: 'BPC-157, TB-500, GHK-CU, and KPV work synergistically across connective tissue, skin, and systemic inflammation. The foundational healing protocol for preclinical researchers.',
    color: '#E8F5EE',
    accentColor: '#14532D',
    badge: 'Best Seller',
    icon: '🔬',
    slugs: ['bpc-157-tb-500', 'ghk-cu', 'kpv', 'bac-water-10-ml'],
    dosages: ['5mg', '5mg', '5mg', ''],
    individualTotal: 79.99 + 39.99 + 59.99 + 12.99,
    bundlePrice: 169.99,
  },
  {
    id: 'gh-optimization',
    name: 'Growth Hormone Optimization Stack',
    tagline: 'GH pulse + downstream anabolic signaling',
    description: 'CJC-1295/Ipamorelin combined peptide drives GH pulse, while IGF-1 LR3 amplifies downstream anabolic signaling. NAD+ supports cellular energy throughout the protocol.',
    color: '#E8F3FF',
    accentColor: '#1E3A8A',
    badge: 'Popular',
    icon: '⚗️',
    slugs: ['cjc-1295-w-o-dac-ipamorelin', 'igf-1lr3', 'nad', 'bac-water-10-ml'],
    dosages: ['10mg', '10mg', '', ''],
    individualTotal: 69.99 + 69.99 + 69.99 + 12.99,
    bundlePrice: 189.99,
  },
  {
    id: 'metabolic-glp',
    name: 'Metabolic GLP Research Stack',
    tagline: 'Triple-receptor GLP approach with amylin synergy',
    description: 'GLP-3(R) alongside Cagrilintide provides complementary receptor targeting studied in advanced metabolic protocols. BAC Water included for immediate reconstitution.',
    color: '#EEE8FA',
    accentColor: '#4C1D95',
    badge: 'New',
    icon: '💊',
    slugs: ['glp-3-r', 'cagrilintide', 'mots-c', 'bac-water-10-ml'],
    dosages: ['5mg', '5mg', '5mg', ''],
    individualTotal: 49.99 + 69.99 + 49.99 + 12.99,
    bundlePrice: 159.99,
  },
  {
    id: 'longevity',
    name: 'Longevity & Cellular Health Stack',
    tagline: 'NAD+, telomere support, and mitochondrial power',
    description: 'NAD+ restores cellular energy, Epithalon supports telomere maintenance, MOTS-C activates mitochondrial AMPK pathways, and Glutathione provides master antioxidant protection.',
    color: '#FFF7ED',
    accentColor: '#92400E',
    badge: null,
    icon: '⚡',
    slugs: ['nad', 'epithalon', 'mots-c', 'glutathione'],
    dosages: ['', '', '5mg', ''],
    individualTotal: 69.99 + 39.99 + 49.99 + 69.99,
    bundlePrice: 199.99,
  },
  {
    id: 'cognitive',
    name: 'Cognitive & Neurological Stack',
    tagline: 'Neuroprotection and focus optimization',
    description: 'Semax and Selank together cover both cognitive enhancement and anxiolytic effects through complementary mechanisms. Cerebrolysin supports neuroplasticity and neuroprotection.',
    color: '#E8EFF9',
    accentColor: '#1E3A5F',
    badge: null,
    icon: '🧠',
    slugs: ['semax', 'selank', 'cerebrolysin', 'bac-water-10-ml'],
    dosages: ['5mg', '5mg', '5mg', ''],
    individualTotal: 39.99 + 39.99 + 99.99 + 12.99,
    bundlePrice: 169.99,
  },
  {
    id: 'skin-antiaging',
    name: 'Skin & Anti-Aging Stack',
    tagline: 'Dermal regeneration + antioxidant defense',
    description: 'GLOW combines GHK-CU, BPC-157, and TB-500 for comprehensive skin research. SNAP-8 addresses expression lines. Glutathione amplifies systemic antioxidant protection.',
    color: '#FEF3C7',
    accentColor: '#78350F',
    badge: null,
    icon: '✨',
    slugs: ['glow', 'snap-8', 'glutathione', 'bac-water-10-ml'],
    dosages: ['', '5mg', '', ''],
    individualTotal: 109.99 + 39.99 + 69.99 + 12.99,
    bundlePrice: 209.99,
  },
];

function savings(stack) {
  return Math.round(stack.individualTotal - stack.bundlePrice);
}

function savingsPct(stack) {
  return Math.round((savings(stack) / stack.individualTotal) * 100);
}

function StackCard({ stack }) {
  const { addItem } = useCart();

  const stackProducts = stack.slugs
    .map(s => products.find(p => p.slug === s))
    .filter(Boolean);

  function addStackToCart() {
    stackProducts.forEach((p, i) => {
      addItem(p, { dosage: stack.dosages[i] || '', bundleCount: 1 });
    });
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 24, border: '1.5px solid #e5e7eb',
      overflow: 'hidden', transition: 'box-shadow 0.25s ease',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Header */}
      <div style={{ background: stack.color, padding: '32px 28px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            {stack.badge && (
              <span style={{
                display: 'inline-block', background: stack.accentColor, color: '#fff',
                fontSize: 9, fontWeight: 700, padding: '3px 9px', borderRadius: 9999,
                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10,
                fontFamily: "'Poppins', sans-serif",
              }}>{stack.badge}</span>
            )}
            <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: 4, lineHeight: 1.2 }}>
              {stack.name}
            </h3>
            <p style={{ fontSize: 13, color: stack.accentColor, fontWeight: 600 }}>{stack.tagline}</p>
          </div>
          <span style={{ fontSize: 32, flexShrink: 0, marginLeft: 12 }}>{stack.icon}</span>
        </div>
        <p style={{ fontSize: 13, color: '#4b5563', marginTop: 12, lineHeight: 1.6 }}>
          {stack.description}
        </p>
      </div>

      {/* Products */}
      <div style={{ padding: '20px 28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {stackProducts.map((p) => {
            const cat = getCategoryConfig(p.category);
            const displayPrice = p.salePrice || p.price;
            return (
              <Link key={p.slug} href={`/products/${p.slug}`}
                style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: `radial-gradient(ellipse at 50% 60%, ${cat.color} 0%, #f5f5f5 80%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img src={p.image} alt={p.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111', fontFamily: "'Poppins', sans-serif" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{p.category}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', fontFamily: "'Poppins', sans-serif", flexShrink: 0 }}>
                  {displayPrice}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Pricing */}
        <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>Individual total</span>
            <span style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'line-through' }}>
              ${stack.individualTotal.toFixed(2)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1B4D3E' }}>
              Bundle price — save {savingsPct(stack)}%
            </span>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#1B4D3E', fontFamily: "'Poppins', sans-serif" }}>
              ${stack.bundlePrice.toFixed(2)}
            </span>
          </div>
        </div>

        <button
          onClick={addStackToCart}
          style={{
            width: '100%', padding: '14px 0', background: '#131315', color: '#fff',
            border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
            letterSpacing: '0.02em', transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#1B4D3E'}
          onMouseLeave={e => e.currentTarget.style.background = '#131315'}
        >
          Add Full Stack to Cart — ${stack.bundlePrice.toFixed(2)}
        </button>

        <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>
          Save ${savings(stack)} vs individual purchase
        </p>
      </div>
    </div>
  );
}

export default function StacksPage() {
  return (
    <Layout
      title="Research Stacks & Bundles | EVO Labs Research"
      description="Curated peptide research stacks with bundle pricing. Save up to 25% vs individual purchase. Recovery, GH, metabolic, longevity, cognitive, and anti-aging protocols."
    >
      {/* Page Header */}
      <div style={{ background: '#0a0a0a', padding: '64px 0 56px' }}>
        <div className="container">
          <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
            Curated Protocols
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 16 }}>
            Research Stacks
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', maxWidth: 520 }}>
            Compound combinations studied in preclinical research. Each stack is curated for synergistic activity — add the entire protocol to your cart in one click.
          </p>
          <div style={{ display: 'flex', gap: 32, marginTop: 32, flexWrap: 'wrap' }}>
            {[
              { label: '13 research stacks', icon: '📋' },
              { label: 'Save up to 25% vs individual', icon: '💰' },
              { label: 'COA on every compound', icon: '🔬' },
            ].map(b => (
              <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{b.icon}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── EVO Research Stack Products ── */}
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1B4D3E', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, fontFamily: "'Poppins', sans-serif" }}>
              EVO Research Stacks
            </div>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', marginBottom: 8 }}>
              Pre-Built Research Bundles
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 540 }}>
              Curated multi-compound kits formulated for specific research pathways. Each bundle includes verified compounds at a discounted bundle price.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="evo-stacks-grid">
            {EVO_STACKS.map(p => {
              const meta = EVO_STACK_META[p.slug];
              const regPriceNum = p.salePrice ? parseFloat(p.price.replace(/[^0-9.]/g, '')) : null;
              const salePriceNum = p.salePrice ? parseFloat(p.salePrice.replace(/[^0-9.]/g, '')) : null;
              const savePct = regPriceNum && salePriceNum ? Math.round((1 - salePriceNum / regPriceNum) * 100) : null;
              const saveAmt = regPriceNum && salePriceNum ? (regPriceNum - salePriceNum).toFixed(0) : null;
              return (
                <div key={p.slug}
                  style={{ background: '#fff', borderRadius: 24, border: '1.5px solid #e5e7eb', overflow: 'hidden', transition: 'box-shadow 0.25s ease' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div style={{ background: meta.color, padding: '32px 28px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        {p.badge && (
                          <span style={{ display: 'inline-block', background: meta.accentColor, color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 9px', borderRadius: 9999, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, fontFamily: "'Poppins', sans-serif" }}>
                            {p.badge}
                          </span>
                        )}
                        <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: 4, lineHeight: 1.2 }}>{p.name}</h3>
                        <p style={{ fontSize: 13, color: meta.accentColor, fontWeight: 600 }}>{meta.tagline}</p>
                      </div>
                      <span style={{ fontSize: 32, flexShrink: 0, marginLeft: 12 }}>{meta.icon}</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#4b5563', marginTop: 12, lineHeight: 1.6 }}>{p.description}</p>
                  </div>
                  <div style={{ padding: '20px 28px' }}>
                    <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                      {p.salePrice ? (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: '#9ca3af' }}>Regular price</span>
                            <span style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'line-through' }}>{p.price}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#1B4D3E' }}>Kit price — save {savePct}%</span>
                            <span style={{ fontSize: 18, fontWeight: 900, color: '#1B4D3E', fontFamily: "'Poppins', sans-serif" }}>{p.salePrice}</span>
                          </div>
                        </>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#1B4D3E' }}>Research kit price</span>
                          <span style={{ fontSize: 18, fontWeight: 900, color: '#1B4D3E', fontFamily: "'Poppins', sans-serif" }}>{p.price}</span>
                        </div>
                      )}
                    </div>
                    <Link href={`/products/${p.slug}`}
                      style={{ display: 'block', width: '100%', padding: '14px 0', background: '#131315', color: '#fff', borderRadius: 12, fontSize: 14, fontWeight: 700, textAlign: 'center', fontFamily: "'Poppins', sans-serif", letterSpacing: '0.02em', textDecoration: 'none', transition: 'background 0.15s ease' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1B4D3E'}
                      onMouseLeave={e => e.currentTarget.style.background = '#131315'}
                    >
                      View Stack Details →
                    </Link>
                    {saveAmt && (
                      <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>Save ${saveAmt} vs individual purchase</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Custom Protocol Stacks ── */}
      <section className="section">
        <div className="container">
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1B4D3E', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, fontFamily: "'Poppins', sans-serif" }}>
              Custom Protocols
            </div>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', marginBottom: 8 }}>
              Build-Your-Own Protocol Stacks
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 540 }}>
              Mix individual compounds into a complete research protocol. Add the entire combination to your cart in one click.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="stacks-grid">
            {STACKS.map(stack => (
              <StackCard key={stack.id} stack={stack} />
            ))}
          </div>
        </div>
      </section>

      {/* Info strip */}
      <section style={{ background: '#f8fafc', borderTop: '1px solid #f0f0f0', padding: '48px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }} className="info-grid">
            {[
              {
                icon: '🔬',
                title: 'For Research Use Only',
                body: 'All compounds are intended for laboratory and preclinical research purposes only. Not for human consumption.',
              },
              {
                icon: '📋',
                title: 'COA With Every Order',
                body: 'Third-party test certificates of analysis are included with every shipment. 99%+ purity guaranteed.',
              },
              {
                icon: '🚚',
                title: 'Free Shipping on $250+',
                body: 'Research stacks qualify for free standard shipping. Orders ship from the USA within 1-2 business days.',
              },
            ].map(item => (
              <div key={item.title} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{item.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 6 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) {
          .stacks-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .evo-stacks-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .info-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .stacks-grid { grid-template-columns: 1fr !important; }
          .evo-stacks-grid { grid-template-columns: 1fr !important; }
          .info-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  );
}

export async function getServerSideProps(ctx) {
  const { getCatalogMode, isProductsPublic } = await import('../lib/catalogMode');
  const mode = await getCatalogMode();
  const { getServerSession } = await import('next-auth/next');
  const { authOptions } = await import('./api/auth/[...nextauth]');
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const isAdmin = ctx.req.cookies?.evo_admin === '1';
  const isLoggedIn = !!session || isAdmin;
  if (!isProductsPublic(mode) && !isLoggedIn) return { redirect: { destination: '/account/login?redirect=/stacks', permanent: false } };
  return { props: { catalogMode: mode, isGuest: !isLoggedIn } };
}
