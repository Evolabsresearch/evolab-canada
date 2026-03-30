import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { signIn } from 'next-auth/react';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '⬡', exact: true },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/products', label: 'Products', icon: '🧬' },
  { href: '/admin/categories', label: 'Categories', icon: '🗂' },
  { href: '/admin/reviews', label: 'Reviews', icon: '⭐' },
  { href: '/admin/coa', label: 'COA', icon: '📋' },
  { href: '/admin/customers', label: 'Customers', icon: '👤' },
  { href: '/admin/inventory', label: 'Inventory', icon: '🗄' },
  { href: '/admin/affiliates', label: 'Affiliates', icon: '🔗' },
  { href: '/admin/discounts', label: 'Discounts', icon: '🏷' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📊' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙' },
];

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'evolabs13@gmail.com';
const ADMIN_PW = process.env.NEXT_PUBLIC_ADMIN_PW || 'Baseball@123';

const inputBase = {
  width: '100%', padding: '12px 16px', background: '#252836',
  borderRadius: 8, color: '#fff', fontSize: 15, outline: 'none',
  boxSizing: 'border-box',
};

export default function AdminLayout({ children, title = 'Admin' }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('evo_admin_pw');
    if (stored) setAuthed(true);
  }, []);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close sidebar on nav on mobile
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [router.pathname, isMobile]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && pw === ADMIN_PW) {
      localStorage.setItem('evo_admin_pw', pw);
      // Cookie readable by getServerSideProps — lets server-side gated pages bypass redirect
      document.cookie = 'evo_admin=1; path=/; max-age=86400; SameSite=Lax';
      setAuthed(true);
      setError('');
      // Also create a NextAuth session so "View Site" keeps the user logged in
      signIn('admin-credentials', { email: email.trim(), password: pw, redirect: false }).catch(() => {});
    } else {
      setError('Incorrect email or password');
    }
  };

  const isActive = (href, exact) =>
    exact ? router.pathname === href : router.pathname.startsWith(href);

  const isDashboard = router.pathname === '/admin';

  if (!authed) {
    return (
      <>
        <Head><title>Admin Login | EVO Labs Research</title></Head>
        <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Anek Telugu', sans-serif", padding: '16px' }}>
          <div style={{ background: '#1a1d27', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '48px 40px', width: '100%', maxWidth: 420 }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <img src="https://evolabsresearch.ca/wp-content/uploads/2021/06/EVO-LABS-RESEARCH-1.png" alt="EVO Labs" style={{ height: 32, filter: 'brightness(0) invert(1)', marginBottom: 16 }} />
              <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: 0 }}>Admin Portal</h1>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 6 }}>EVO Labs Research LLC</p>
            </div>
            <form onSubmit={handleLogin}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Email Address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@evolabsresearch.ca" autoComplete="email" required
                style={{ ...inputBase, border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, marginBottom: 16 }}
              />
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Password</label>
              <input
                type="password" value={pw} onChange={e => setPw(e.target.value)}
                placeholder="Enter admin password" autoComplete="current-password" required
                style={{ ...inputBase, border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, marginBottom: error ? 10 : 24 }}
              />
              {error && <p style={{ color: '#ef4444', fontSize: 12, margin: '0 0 20px' }}>{error}</p>}
              <button type="submit" style={{
                width: '100%', padding: '13px', background: '#1B4D3E', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}>
                Sign In →
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head><title>{title} | EVO Labs Admin</title></Head>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5', fontFamily: "'Anek Telugu', sans-serif" }}>

        {/* Mobile overlay backdrop */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              zIndex: 40, backdropFilter: 'blur(2px)',
            }}
          />
        )}

        {/* Sidebar */}
        <aside style={{
          width: 240,
          background: '#0f1117',
          display: 'flex', flexDirection: 'column', flexShrink: 0,
          transition: 'transform 0.25s ease',
          // Mobile: fixed overlay; Desktop: sticky
          position: isMobile ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: isMobile ? 50 : 'auto',
          transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
          overflowY: 'auto',
        }}>
          {/* Sidebar Header */}
          <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <img src="https://evolabsresearch.ca/wp-content/uploads/2021/06/EVO-LABS-RESEARCH-1.png" alt="EVO Labs" style={{ height: 24, filter: 'brightness(0) invert(1)' }} />
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 20, padding: 4, lineHeight: 1 }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Nav Items */}
          <nav style={{ flex: 1, padding: '12px 8px' }}>
            {NAV.map(({ href, label, icon, exact }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 14px', borderRadius: 8, marginBottom: 2,
                    background: active ? 'rgba(74, 222, 128, 0.12)' : 'transparent',
                    color: active ? '#4ade80' : 'rgba(255,255,255,0.65)',
                    textDecoration: 'none', fontSize: 14, fontWeight: active ? 600 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <Link href="/" style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
              borderRadius: 8, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 13,
            }}>
              <span style={{ fontSize: 16 }}>↗</span>
              <span>View Site</span>
            </Link>
            <button
              onClick={() => { localStorage.removeItem('evo_admin_pw'); localStorage.removeItem('evo_admin'); document.cookie = 'evo_admin=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT'; document.cookie = 'evo_admin=; path=/; domain=evolabsresearch.ca; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT'; setAuthed(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                borderRadius: 8, color: 'rgba(255,255,255,0.4)', background: 'none',
                border: 'none', fontSize: 13, cursor: 'pointer', width: '100%',
              }}
            >
              <span style={{ fontSize: 16 }}>⇐</span>
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Top Bar */}
          <div style={{
            background: '#fff', borderBottom: '1px solid #e5e7eb',
            padding: isMobile ? '0 16px' : '0 32px',
            height: 60, display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexShrink: 0, gap: 12,
            position: 'sticky', top: 0, zIndex: 30,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Hamburger on mobile */}
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 22, color: '#374151', padding: '4px 6px', lineHeight: 1, flexShrink: 0,
                  }}
                  aria-label="Open menu"
                >
                  ☰
                </button>
              )}
              {!isDashboard && !isMobile && (
                <button
                  onClick={() => router.back()}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 34, height: 34, borderRadius: 8,
                    background: '#f3f4f6', border: '1px solid #e5e7eb',
                    cursor: 'pointer', fontSize: 16, color: '#374151', flexShrink: 0,
                  }}
                >
                  ←
                </button>
              )}
              <h1 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: '#111', margin: 0 }}>{title}</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16 }}>
              <span style={{
                background: '#1B4D3E', color: '#fff', fontSize: 10, fontWeight: 700,
                padding: '3px 8px', borderRadius: 9999, letterSpacing: '0.06em', flexShrink: 0,
              }}>ADMIN</span>
              {!isMobile && <span style={{ fontSize: 13, color: '#6b7280' }}>EVO Labs Research</span>}
            </div>
          </div>

          {/* Page Body */}
          <div style={{ flex: 1, padding: isMobile ? 16 : 32, overflowY: 'auto' }}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
