import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { CONTACT, products } from '../lib/data';
import { useCart } from '../context/CartContext';
import NewsletterPopup from './NewsletterPopup';
import ChatWidget from './ChatWidget';
import MiniCart from './MiniCart';
import CompareDrawer from './CompareDrawer';
import AdminEditBar from './AdminEditBar';
import CookieConsent from './CookieConsent';

const DEFAULT_ANNOUNCEMENT_MESSAGES = [
  { text: 'Free Shipping on Orders $300+ CAD · Shipped via Canada Post', highlight: true, icon: '🚚' },
  { text: '99%+ Purity Guaranteed · Third-Party Tested Every Batch', highlight: false, icon: '🔬' },
  { text: 'COA Available Before You Buy · Download Any Batch Report', highlight: false, icon: '📋' },
  { text: 'Save Up to 25% With Research Stacks', highlight: true, icon: '⚗️', href: '/stacks' },
  { text: 'Subscribe for 10% Off Your First Order', highlight: true, icon: '✉️' },
];

const NAV_LINKS = [
  { href: '/products',  label: 'Products' },
  { href: '/stacks',    label: 'Stacks' },
  { href: '/research',  label: 'Research' },
  { href: '/coa',       label: 'COA Library' },
  { href: '/about',     label: 'About & FAQ' },
  { href: '/contact',   label: 'Contact' },
  { href: '/account',   label: 'Account' },
];

const CART_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

const SEARCH_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function Layout({ children, title, description, ogImage, structuredData }) {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [annoIdx, setAnnoIdx] = useState(0);
  const [annoFade, setAnnoFade] = useState(true);
  const [annoMessages, setAnnoMessages] = useState(DEFAULT_ANNOUNCEMENT_MESSAGES);
  const searchInputRef = useRef(null);
  const router = useRouter();
  const { data: session } = useSession();
  const { itemCount, setMiniCartOpen } = useCart();

  // Fetch dynamic announcement bar text from Supabase
  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(data => {
      const ab = data?.announcement_bar;
      if (ab && ab.enabled && ab.text) {
        // Replace first message with Supabase text, keep the rest as rotating defaults
        setAnnoMessages([{ text: ab.text, highlight: true, icon: '🚚' }, ...DEFAULT_ANNOUNCEMENT_MESSAGES.slice(1)]);
      }
    }).catch(() => {});
  }, []);

  // Rotate announcement bar messages
  useEffect(() => {
    const iv = setInterval(() => {
      setAnnoFade(false);
      setTimeout(() => { setAnnoIdx(prev => (prev + 1) % annoMessages.length); setAnnoFade(true); }, 300);
    }, 4000);
    return () => clearInterval(iv);
  }, [annoMessages]);

  // Close search on navigation
  useEffect(() => { setSearchOpen(false); setSearchQuery(''); }, [router.pathname]);

  // Apply saved content overrides from Supabase (for all visitors)
  useEffect(() => {
    const path = router.pathname;
    fetch(`/api/admin/content?page=${encodeURIComponent(path)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        // Apply text/image overrides
        Object.entries(data.selectors || {}).forEach(([sel, edit]) => {
          try {
            const el = document.querySelector(sel);
            if (!el) return;
            if (edit.type === 'text') el.innerHTML = edit.value;
            else if (edit.type === 'img' && el.tagName === 'IMG') el.src = edit.value;
          } catch {}
        });
        // Apply color overrides
        Object.entries(data.colors || {}).forEach(([sel, props]) => {
          try {
            const el = document.querySelector(sel);
            if (!el) return;
            if (props.text)       el.style.color = props.text;
            if (props.background) el.style.backgroundColor = props.background;
            if (props.border)     el.style.borderColor = props.border;
          } catch {}
        });
      })
      .catch(() => {});
  }, [router.pathname]);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Keyboard shortcut: Cmd+K / Ctrl+K to open search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const searchResults = searchQuery.length >= 2
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 6)
    : [];

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [router.pathname]);

  const isActive = (href) => router.pathname === href || router.pathname.startsWith(href + '/');

  return (
    <>
      <Head>
        <title>{title || 'EVO Labs Research Canada | Buy Research Peptides Canada — 99%+ Purity'}</title>
        <meta name="description" content={description || 'Buy research-grade peptides in Canada with 99%+ verified purity. Third-party tested every batch. Certificate of Analysis included. Ships across Canada via Canada Post.'} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1B4D3E" />
        <link rel="canonical" href={`https://evolabsresearch.ca${router.asPath.split('?')[0]}`} />
        {/* Favicon */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="apple-touch-icon" href="/images/evo-logo.png" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="EVO Labs Research Canada" />
        <meta property="og:title" content={title || 'EVO Labs Research Canada | Buy Research Peptides Canada'} />
        <meta property="og:description" content={description || 'Buy research-grade peptides in Canada with 99%+ verified purity. Third-party tested every batch.'} />
        <meta property="og:image" content={ogImage || `https://evolabsresearch.ca/api/og?title=${encodeURIComponent(title || 'EVO Labs Research Canada')}&sub=${encodeURIComponent(description || 'Research-Grade Peptides. Zero Compromise.')}`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={`https://evolabsresearch.ca${router.asPath.split('?')[0]}`} />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@evolabsresearch" />
        <meta name="twitter:title" content={title || 'EVO Labs Research Canada | Buy Research Peptides Canada'} />
        <meta name="twitter:description" content={description || 'Buy research-grade peptides in Canada with 99%+ verified purity. Third-party tested every batch.'} />
        <meta name="twitter:image" content={ogImage || `https://evolabsresearch.ca/api/og?title=${encodeURIComponent(title || 'EVO Labs Research Canada')}&sub=${encodeURIComponent(description || 'Research-Grade Peptides. Zero Compromise.')}`} />
        {/* Structured Data - Organization */}
        {structuredData && (Array.isArray(structuredData) ? structuredData : [structuredData]).map((sd, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(sd) }}
          />
        ))}
        {/* Fonts loaded globally via _document.tsx */}
      </Head>

      {/* ── Edge glow ring ── */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99999,
        boxShadow: 'inset 0 0 0 1.5px rgba(74,222,128,0.70), inset 0 0 40px 4px rgba(74,222,128,0.38), inset 0 0 90px 8px rgba(74,222,128,0.16)',
      }} />

      {/* Skip to content — accessibility */}
      <a href="#main-content" style={{
        position: 'absolute', top: -40, left: 16, zIndex: 9999,
        background: '#1B4D3E', color: '#fff', padding: '8px 16px', borderRadius: 4,
        fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'top 0.2s',
      }}
        onFocus={e => e.target.style.top = '8px'}
        onBlur={e => e.target.style.top = '-40px'}
      >
        Skip to main content
      </a>

      {/* ── Announcement Bar (rotating) ── */}
      {(() => {
        const msg = annoMessages[annoIdx] || annoMessages[0];
        const inner = (
          <span style={{ transition: 'opacity 0.3s ease', opacity: annoFade ? 1 : 0, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span>{msg.icon}</span>
            {msg.highlight ? <strong style={{ fontWeight: 700 }}>{msg.text}</strong> : <span>{msg.text}</span>}
          </span>
        );
        return (
          <div style={{ background: '#1B4D3E', color: '#fff', textAlign: 'center', fontSize: 12, fontWeight: 500, padding: '10px 16px', letterSpacing: '0.04em', fontFamily: "'Anek Telugu', sans-serif", minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {msg.href ? <Link href={msg.href} style={{ color: '#fff', textDecoration: 'none' }}>{inner}</Link> : inner}
          </div>
        );
      })()}

      {/* ── Sticky Nav ── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: '#fff',
        borderBottom: `1px solid ${scrolled ? '#e5e7eb' : 'transparent'}`,
        boxShadow: scrolled ? '0 1px 24px rgba(0,0,0,0.07)' : 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        fontFamily: "'Anek Telugu', sans-serif",
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', height: 72, gap: 40 }}>

          {/* Logo */}
          <Link href="/" style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <img
              src="/images/evo-logo.png"
              alt="EVO Labs Research"
              style={{ height: 38, display: 'block' }}
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav aria-label="Main navigation" className="hide-tablet" style={{ display: 'flex', gap: 32, alignItems: 'center', flex: 1 }} suppressHydrationWarning>
            {NAV_LINKS.map(({ href, label }) => {
              const resolvedHref = (href === '/products' && !session) ? '/account/login' : href;
              return (
                <Link
                  key={href}
                  href={resolvedHref}
                  aria-current={isActive(href) ? 'page' : undefined}
                  className={`nav-link${isActive(href) ? ' active' : ''}`}
                  suppressHydrationWarning
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hide-tablet" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Search button */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
              title="Search (⌘K)"
              style={{ color: '#374151', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              {SEARCH_ICON}
            </button>
            <button
              onClick={() => setMiniCartOpen(true)}
              aria-label={itemCount > 0 ? `Cart — ${itemCount} item${itemCount !== 1 ? 's' : ''}` : 'Cart'}
              style={{ color: '#374151', display: 'flex', alignItems: 'center', position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              {CART_ICON}
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -8,
                  background: '#1B4D3E', color: '#fff',
                  fontSize: 10, fontWeight: 700, fontFamily: "'Poppins', sans-serif",
                  width: 18, height: 18, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1,
                }}>{itemCount}</span>
              )}
            </button>
            <Link href={session ? '/products' : '/account/login'} className="btn-primary">
              Shop Now →
            </Link>
          </div>

          {/* Mobile: Cart + Hamburger */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }} className="show-mobile">
            <button
              onClick={() => setMiniCartOpen(true)}
              aria-label={itemCount > 0 ? `Cart — ${itemCount} item${itemCount !== 1 ? 's' : ''}` : 'Cart'}
              style={{ color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 10, minWidth: 44, minHeight: 44 }}
            >
              {CART_ICON}
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: 2,
                  background: '#1B4D3E', color: '#fff',
                  fontSize: 10, fontWeight: 700, fontFamily: "'Poppins', sans-serif",
                  width: 18, height: 18, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1,
                }}>{itemCount}</span>
              )}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 10, minWidth: 44, minHeight: 44 }}
              aria-label="Toggle menu"
            >
              <span style={{ width: 22, height: 2, background: '#111827', display: 'block', borderRadius: 2, transition: 'transform 0.2s', transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none' }} />
              <span style={{ width: 22, height: 2, background: '#111827', display: 'block', borderRadius: 2, transition: 'opacity 0.2s', opacity: menuOpen ? 0 : 1 }} />
              <span style={{ width: 22, height: 2, background: '#111827', display: 'block', borderRadius: 2, transition: 'transform 0.2s', transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div style={{ background: '#fff', borderTop: '1px solid #f3f4f6', padding: '8px 20px 28px', fontFamily: "'Anek Telugu', sans-serif" }}>
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'block',
                  fontSize: 16,
                  fontWeight: 500,
                  color: isActive(href) ? '#1B4D3E' : '#111827',
                  padding: '16px 0',
                  borderBottom: '1px solid #f3f4f6',
                }}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/cart"
              style={{ display: 'block', fontSize: 16, fontWeight: 500, color: '#111827', padding: '16px 0', borderBottom: '1px solid #f3f4f6' }}
            >
              Cart
            </Link>
            <Link href="/products" className="btn-primary" style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}>
              Shop Now →
            </Link>
          </div>
        )}
      </header>

      {/* ── Page Content ── */}
      <main id="main-content" style={{ fontFamily: "'Anek Telugu', sans-serif", minHeight: '60vh' }}>
        {children}
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: '#0d0d0d', color: '#fff', padding: '72px 0 0', fontFamily: "'Anek Telugu', sans-serif" }}>
        <div className="container">

          {/* Top: brand + nav columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr', gap: 56, paddingBottom: 56, borderBottom: '1px solid rgba(255,255,255,0.08)' }} className="footer-grid">

            {/* Brand */}
            <div>
              <img
                src="/images/evo-logo.png"
                alt="EVO Labs Research"
                style={{ height: 36, filter: 'brightness(0) invert(1)', marginBottom: 20 }}
              />
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.85, maxWidth: 270, marginBottom: 28 }}>
                Research-grade peptides engineered for precision. 99%+ purity guaranteed — independently tested, every batch, no exceptions.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a href={`mailto:${CONTACT.email}`} style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.target.style.color = '#4ade80'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}>
                  ✉ {CONTACT.email}
                </a>
                <a href={`tel:+16475550199`} style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.target.style.color = '#4ade80'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}>
                  ☎ {CONTACT.phone}
                </a>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.7, marginTop: 4 }}>
                  {CONTACT.address}<br />{CONTACT.city}, {CONTACT.country}
                </p>
              </div>
            </div>

            {/* Shop */}
            <div>
              <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 22 }}>Shop</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  ['/products?category=Growth+Hormone+Peptides',    'Growth Hormone'],
                  ['/products?category=GLP-1+Research+Peptides',    'GLP-1 Peptides'],
                  ['/products?category=Healing+%26+Regeneration',   'Healing & Regeneration'],
                  ['/products?category=Mitochondrial+Peptides',     'Mitochondrial'],
                  ['/products?category=Cognitive+%26+Neuro+Peptides','Cognitive & Neuro'],
                  ['/products?category=Metabolic+Peptides',         'Metabolic Peptides'],
                  ['/products?category=Reconstitution+Supplies',    'Reconstitution'],
                  ['/products?category=Research+Kits',              'Research Kits'],
                ].map(([href, label]) => (
                  <Link key={label} href={href}
                    style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.target.style.color = '#fff'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 22 }}>Company</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  '/about', '/stacks', '/research', '/coa', '/research-use',
                ].map((href) => {
                  const labels = { '/about': 'About & FAQ', '/stacks': 'Research Stacks', '/research': 'Research Library', '/coa': 'COA Library', '/research-use': 'Research Use Policy' };
                  return (
                    <Link key={href} href={href}
                      style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', transition: 'color 0.15s' }}
                      onMouseEnter={e => e.target.style.color = '#fff'}
                      onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
                      {labels[href]}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 22 }}>Support</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  ['/contact', 'Contact Us'],
                  ['/about', 'About & FAQ'],
                  ['/track', 'Track Order'],
                  ['/payment-instructions', 'Payment Instructions'],
                  ['/wholesale', 'Wholesale'],
                ].map(([href, label]) => (
                  <Link key={label} href={href}
                    style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.target.style.color = '#fff'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ padding: '24px 0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }} className="footer-bottom">
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
              © 2026 EVO Labs Research Canada. All rights reserved. For Research Use Only — Not for Human Consumption.
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', opacity: 0.4 }}>
              {/* Visa */}
              <svg height="22" viewBox="0 0 50 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="50" height="16" rx="3" fill="white"/><text x="5" y="12" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="10" fill="#1A1F71">VISA</text></svg>
              {/* Mastercard */}
              <svg height="22" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="38" height="24" rx="3" fill="white"/><circle cx="15" cy="12" r="7" fill="#EB001B"/><circle cx="23" cy="12" r="7" fill="#F79E1B"/><path d="M19 6.8a7 7 0 010 10.4A7 7 0 0119 6.8z" fill="#FF5F00"/></svg>
              {/* Amex */}
              <svg height="22" viewBox="0 0 50 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="50" height="16" rx="3" fill="#2E77BC"/><text x="6" y="12" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="9" fill="white">AMEX</text></svg>
              {/* PayPal */}
              <svg height="22" viewBox="0 0 60 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="16" rx="3" fill="white"/><text x="6" y="12" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="9" fill="#003087">Pay</text><text x="23" y="12" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="9" fill="#009CDE">Pal</text></svg>
              {/* SSL lock */}
              <svg height="22" viewBox="0 0 52 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="52" height="16" rx="3" fill="white"/><text x="6" y="12" fontFamily="Arial,sans-serif" fontWeight="600" fontSize="8" fill="#22c55e">🔒 SSL</text></svg>
            </div>
          </div>
        </div>
      </footer>

      <MiniCart />
      <NewsletterPopup />
      <ChatWidget />
      <CompareDrawer />
      <AdminEditBar />

      {/* ── Search Overlay ── */}
      {searchOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(10,10,10,0.65)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            paddingTop: 80,
          }}
        >
          <div style={{
            background: '#fff', borderRadius: 20, width: '100%', maxWidth: 600,
            margin: '0 20px', boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
            overflow: 'hidden',
          }}>
            {/* Search input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ color: '#9ca3af', flexShrink: 0 }}>{SEARCH_ICON}</span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search peptides, compounds, categories..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  flex: 1, border: 'none', outline: 'none', fontSize: 16,
                  fontFamily: "'Poppins', sans-serif", color: '#111',
                  background: 'transparent',
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 18, padding: '0 4px' }}>✕</button>
              )}
              <kbd style={{ fontSize: 10, color: '#9ca3af', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 4, padding: '2px 6px', fontFamily: 'monospace', flexShrink: 0 }}>ESC</kbd>
            </div>
            {/* Results */}
            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              {searchQuery.length >= 2 ? (
                searchResults.length > 0 ? (
                  <>
                    <div style={{ padding: '10px 20px 6px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                    </div>
                    {searchResults.map(p => (
                      <Link
                        key={p.slug}
                        href={`/products/${p.slug}`}
                        onClick={() => setSearchOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14,
                          padding: '12px 20px', textDecoration: 'none',
                          borderBottom: '1px solid #f9fafb',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <img src={p.image} alt={p.name} style={{ width: 36, height: 36, objectFit: 'contain' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#111', fontFamily: "'Poppins', sans-serif" }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{p.category}</div>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1B4D3E', fontFamily: "'Poppins', sans-serif", flexShrink: 0 }}>
                          {p.outOfStock ? 'OOS' : p.salePrice || p.price}
                        </div>
                      </Link>
                    ))}
                    {searchResults.length === 6 && (
                      <Link
                        href={`/products?search=${encodeURIComponent(searchQuery)}`}
                        onClick={() => setSearchOpen(false)}
                        style={{ display: 'block', padding: '14px 20px', textAlign: 'center', fontSize: 13, color: '#1B4D3E', fontWeight: 600, textDecoration: 'none', borderTop: '1px solid #f0f0f0' }}
                      >
                        View all results →
                      </Link>
                    )}
                  </>
                ) : (
                  <div style={{ padding: '32px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                    No products found for &ldquo;{searchQuery}&rdquo;
                  </div>
                )
              ) : (
                <div style={{ padding: '20px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Popular</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {['BPC-157', 'GLP-3 (R)', 'HGH 191aa', 'Semaglutide', 'Epithalon', 'NAD+'].map(term => (
                      <button
                        key={term}
                        onClick={() => setSearchQuery(term)}
                        style={{
                          background: '#f3f4f6', border: 'none', borderRadius: 9999,
                          padding: '6px 14px', fontSize: 12, fontWeight: 600,
                          color: '#374151', cursor: 'pointer',
                          fontFamily: "'Poppins', sans-serif",
                        }}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav aria-label="Mobile navigation" className="mobile-bottom-nav" style={{
        display: 'none',
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', borderTop: '1px solid #e5e7eb',
        zIndex: 900, padding: '8px 0 env(safe-area-inset-bottom, 8px)',
        fontFamily: "'Anek Telugu', sans-serif",
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            {
              href: '/products', label: 'Shop',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
              ),
            },
            {
              href: '/research', label: 'Research',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18"/>
                </svg>
              ),
            },
            {
              href: '/cart', label: 'Cart', badge: itemCount,
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.66a2 2 0 001.99-1.61L23 6H6"/>
                </svg>
              ),
            },
            {
              href: '/account', label: 'Account',
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              ),
            },
          ].map(({ href, label, icon, badge }) => {
            const active = router.pathname === href || router.pathname.startsWith(href + '/');
            const resolvedHref = (href === '/products' && !session) ? '/account/login' : href;
            return (
              <Link key={href} href={resolvedHref} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 3, padding: '8px 0 6px', textDecoration: 'none',
                color: active ? '#1B4D3E' : '#9ca3af', position: 'relative',
                transition: 'color 0.15s',
              }}>
                <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {icon}
                  {badge > 0 && (
                    <span style={{
                      position: 'absolute', top: -5, right: -7,
                      background: '#1B4D3E', color: '#fff',
                      fontSize: 9, fontWeight: 700,
                      width: 16, height: 16, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      lineHeight: 1,
                    }}>{badge}</span>
                  )}
                </span>
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: '0.01em' }}>{label}</span>
                {active && (
                  <span style={{
                    position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                    width: 20, height: 2, background: '#1B4D3E', borderRadius: 1,
                  }} />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <style>{`
        @media (max-width: 1024px) {
          .hide-tablet { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 1025px) {
          .show-mobile { display: none !important; }
        }
        @media (max-width: 768px) {
          .mobile-bottom-nav { display: block !important; }
          main { padding-bottom: 68px; }
        }
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 36px !important; }
        }
        @media (max-width: 560px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .footer-bottom { flex-direction: column !important; align-items: flex-start !important; }
        }
        /* Skip link focus */
        a[href="#main-content"]:focus { top: 8px !important; }
        /* Global focus indicators — visible for keyboard users */
        :focus-visible {
          outline: 2px solid #1B4D3E;
          outline-offset: 3px;
          border-radius: 4px;
        }
        button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible {
          outline: 2px solid #1B4D3E;
          outline-offset: 3px;
        }
        /* Reduce motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <CookieConsent />
    </>
  );
}
