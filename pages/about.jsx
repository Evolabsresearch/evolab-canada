import { useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { CONTACT, FAQS } from '../lib/data';

/* ── FAQ data ── */
const EXTRA_FAQS = [
  { q: 'What payment methods do you accept?', a: 'We accept major credit cards, debit cards, and other secure payment methods at checkout. All transactions are processed through a secure, encrypted payment gateway.' },
  { q: 'Do you ship internationally?', a: 'EVO Labs Research Canada ships domestically across all Canadian provinces and territories via Canada Post from our Toronto, Ontario facility. We also offer shipping to the United States with estimated delivery of 1–2 weeks.' },
  { q: 'How do I track my order?', a: 'Once your order ships, you will receive a tracking number by email. You can also use our Track Order page to check your shipment status at any time.' },
  { q: 'Can I return a product?', a: 'Due to the nature of research compounds, we cannot accept returns on opened products unless there is a verified quality issue. Contact support@evolabsresearch.ca within 7 days of delivery if you receive a damaged or incorrect item.' },
  { q: 'Are your peptides lyophilized?', a: 'Yes. All EVO Labs peptides are provided in lyophilized (freeze-dried) form for maximum stability and shelf life. They must be reconstituted with bacteriostatic water before use.' },
  { q: 'What is the shelf life of your peptides?', a: 'Lyophilized peptides stored properly at -20°C have a shelf life of 24+ months. Once reconstituted with bacteriostatic water, use within 28 days and store at 2-8°C.' },
  { q: 'How much bacteriostatic water do I need?', a: 'The volume of BAC water depends on the desired concentration for your research protocol. As a general starting point, 1-2mL of BAC water per vial is common, but this varies by compound and application. We offer BAC water in 10mL and 30mL sizes.' },
  { q: 'Do you offer bulk pricing?', a: 'Yes. We offer vial sets and research stacks at bundle pricing. For institutional or large-volume orders, contact our support team at support@evolabsresearch.ca to discuss pricing.' },
];

const ALL_FAQS = [...FAQS, ...EXTRA_FAQS];

const FAQ_CATEGORIES = [
  { label: 'All', faqs: ALL_FAQS },
  { label: 'Quality & Testing', faqs: ALL_FAQS.filter((_, i) => i < 4) },
  { label: 'Storage & Use', faqs: ALL_FAQS.filter((_, i) => i >= 3 && i < 6) },
  { label: 'Ordering & Shipping', faqs: ALL_FAQS.filter((_, i) => i >= 5) },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: ALL_FAQS.map(faq => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
};

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item" style={{ borderRadius: open ? 16 : 0 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', textAlign: 'left', padding: '22px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: 16, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: '#111827', lineHeight: 1.4 }}>{item.q}</span>
        <span style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: open ? '#0F2A4A' : '#f3f4f6',
          color: open ? '#fff' : '#6b7280',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 400, lineHeight: 1,
          transition: 'background 0.2s, color 0.2s',
        }}>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 24px 24px', maxWidth: 720 }}>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.85 }}>{item.a}</p>
        </div>
      )}
    </div>
  );
}

export default function AboutPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const active = FAQ_CATEGORIES.find(c => c.label === activeCategory) || FAQ_CATEGORIES[0];

  return (
    <Layout
      title="About & FAQ | EVO Labs Research Canada"
      description="Learn about EVO Labs Research Canada — our mission, standards, and commitment to research-grade peptides with 99%+ purity and full COA transparency."
      structuredData={faqSchema}
    >
      {/* ── About Hero ── */}
      <div style={{ background: '#0a0a0a', padding: '80px 0 72px' }}>
        <div className="container">
          <div style={{ maxWidth: 640 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#06b6d4', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
              Our Story
            </div>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.0, marginBottom: 24 }}>
              Built on One Standard:<br />
              <span style={{ color: '#06b6d4' }}>Purity First.</span>
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.85 }}>
              EVO Labs Research was founded on the belief that researchers deserve better. Better transparency, better testing, better compounds. We built the company we wished existed.
            </p>
          </div>
        </div>
      </div>

      {/* ── Mission ── */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }} className="about-split">
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0F2A4A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
                Our Mission
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 24 }}>
                Advancing Research Through Uncompromising Quality
              </h2>
              <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.85, marginBottom: 20 }}>
                EVO Labs Research exists to provide scientists, researchers, and institutions with the highest quality research-grade peptides available — backed by full analytical data, every time.
              </p>
              <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.85, marginBottom: 20 }}>
                We never release a compound without an independent Certificate of Analysis. We never self-certify. And we make every COA publicly available before you place your order — because trust is earned through proof, not promises.
              </p>
              <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.85 }}>
                Headquartered in Toronto, Ontario, all of our products are stored and shipped across Canada. No overseas supply chain. No compromises on the cold chain. Your research deserves better.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { val: '99%+', label: 'Guaranteed Purity', bg: '#f0fdf4', color: '#0F2A4A' },
                { val: '33+',  label: 'COAs Published',    bg: '#eff6ff', color: '#1d4ed8' },
                { val: '48+',  label: 'Active Compounds',  bg: '#fdf4ff', color: '#7c3aed' },
                { val: '100%', label: 'Batches 3rd-Party Tested', bg: '#fff7ed', color: '#c2410c' },
              ].map(s => (
                <div key={s.val} style={{ background: s.bg, borderRadius: 20, padding: '32px 24px' }}>
                  <div style={{ fontSize: 40, fontWeight: 900, color: s.color, letterSpacing: '-0.02em', marginBottom: 10 }}>{s.val}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', lineHeight: 1.4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="section" style={{ background: '#fafafa' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0F2A4A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Core Values
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em' }}>
              The EVO Standard
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="values-grid">
            {[
              { icon: '🔬', title: 'Radical Transparency', desc: 'Every COA is publicly available before purchase. We publish full HPLC chromatograms and mass spec data — not just a number. You can verify everything.', color: '#f0fdf4' },
              { icon: '⚗️', title: 'Independent Verification', desc: 'We never self-certify. Every compound is tested by Janoshik Analytical (Prague, est. 2013) — an independent laboratory with no financial relationship to EVO Labs. We are also adding Kovera Labs (Illinois, USA) for dual-lab verification.', color: '#eff6ff' },
              { icon: '📦', title: 'Canadian Supply Chain', desc: 'All products are stored and shipped from our Toronto, Ontario facility. We do not source from overseas manufacturers. 100% Canadian supply chain, 100% of the time.', color: '#fdf4ff' },
              { icon: '🧪', title: 'Research-Grade Standards', desc: 'Our compounds meet research-grade specifications for purity, identity, and stability. Lyophilized and sealed for maximum shelf life under proper storage conditions.', color: '#fff7ed' },
              { icon: '🤝', title: 'Researcher-First Approach', desc: 'We built EVO Labs for researchers, not profit. Our pricing is fair, our support is real, and our standards are non-negotiable. We exist to advance your research.', color: '#f0fdf4' },
              { icon: '⚡', title: 'No Compromises', desc: 'We turn away product that does not meet our purity standards. No exceptions. If a batch does not pass independent testing, it does not get listed — period.', color: '#eff6ff' },
            ].map((v, i) => (
              <div key={i} style={{ background: v.color, borderRadius: 20, padding: '32px 28px', border: '1px solid rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{v.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0a0a0a', marginBottom: 12 }}>{v.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.8 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Location ── */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }} className="location-split">
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0F2A4A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
                Where We Are
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: 24 }}>
                Proudly Based in Toronto, Canada
              </h2>
              <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.85, marginBottom: 28 }}>
                EVO Labs Research Canada operates from Toronto, Ontario. All storage, fulfillment, and quality control takes place in our Canadian facility. We ship to researchers across Canada.
              </p>
              <div style={{ background: '#f9fafb', borderRadius: 20, padding: '28px', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { icon: '📍', label: 'Address', val: `${CONTACT.address}, ${CONTACT.city}` },
                  { icon: '📞', label: 'Phone', val: CONTACT.phone },
                  { icon: '✉️', label: 'Email', val: CONTACT.email },
                  { icon: '🕐', label: 'Hours', val: CONTACT.hours },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 18, marginTop: 1 }}>{item.icon}</span>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>{item.label}</p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#0F2A4A', borderRadius: 32, padding: '56px 40px', color: '#fff' }}>
              <div style={{ fontSize: 48, marginBottom: 24 }}>🇨🇦</div>
              <h3 style={{ fontSize: 28, fontWeight: 900, marginBottom: 16, lineHeight: 1.1 }}>100% Canadian<br />Supply Chain</h3>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: 32 }}>
                Every compound stored, tested, and shipped from within Canada. No overseas manufacturing. No unknown handling. Complete chain of custody from our facility to your lab.
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Link href="/products" className="btn-primary" style={{ background: '#fff', color: '#0F2A4A' }}>
                  Shop All Products
                </Link>
                <Link href="/contact" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Contact Us →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <div id="faq" style={{ background: '#0a0a0a', padding: '72px 0 60px' }}>
        <div className="container">
          <div style={{ fontSize: 12, fontWeight: 700, color: '#06b6d4', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
            Help Center
          </div>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 16 }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', maxWidth: 480 }}>
            Everything you need to know about our peptides, testing, storage, and ordering process.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 56, alignItems: 'start' }} className="faq-layout">
            {/* Sidebar */}
            <div style={{ position: 'sticky', top: 100 }} className="faq-sidebar">
              <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Filter by Topic</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {FAQ_CATEGORIES.map(cat => (
                  <button
                    key={cat.label}
                    onClick={() => setActiveCategory(cat.label)}
                    style={{
                      textAlign: 'left', padding: '10px 14px', borderRadius: 12, border: 'none',
                      background: activeCategory === cat.label ? '#f0fdf4' : 'transparent',
                      color: activeCategory === cat.label ? '#0F2A4A' : '#6b7280',
                      fontWeight: activeCategory === cat.label ? 700 : 500,
                      fontSize: 14, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                    }}
                  >
                    {cat.label}
                    <span style={{ fontSize: 12, marginLeft: 6, opacity: 0.5 }}>({cat.faqs.length})</span>
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 40, background: '#f9fafb', borderRadius: 20, padding: '24px', border: '1px solid #f0f0f0' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Still have questions?</p>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 1.6 }}>Our team is happy to help with any research-related questions.</p>
                <Link href="/contact" className="btn-green" style={{ fontSize: 13, padding: '10px 20px' }}>Contact Us</Link>
              </div>
            </div>
            {/* FAQ list */}
            <div>
              <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 20, overflow: 'hidden' }}>
                {active.faqs.map((item, i) => (
                  <FAQItem key={i} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: '#0F2A4A', padding: '64px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>
            Ready to Start Your Research?
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 32 }}>
            Browse our full catalog of 99%+ pure, independently tested research peptides.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/products" style={{ background: '#fff', color: '#0F2A4A', padding: '14px 32px', borderRadius: 100, fontSize: 15, fontWeight: 700 }}>
              Browse Products →
            </Link>
            <Link href="/coa" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', padding: '14px 32px', borderRadius: 100, fontSize: 15, fontWeight: 600, border: '1.5px solid rgba(255,255,255,0.25)' }}>
              View COA Library
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .about-split { grid-template-columns: 1fr !important; gap: 40px !important; }
          .values-grid { grid-template-columns: 1fr !important; }
          .location-split { grid-template-columns: 1fr !important; gap: 36px !important; }
          .faq-layout { grid-template-columns: 1fr !important; gap: 32px !important; }
          .faq-sidebar { position: static !important; }
        }
        @media (max-width: 1024px) {
          .values-grid { grid-template-columns: 1fr 1fr !important; }
        }
        .faq-item { border-bottom: 1px solid #f0f0f0; }
        .faq-item:last-child { border-bottom: none; }
      `}</style>
    </Layout>
  );
}
