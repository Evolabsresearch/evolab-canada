import { signOut } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function SignOutPage() {
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    // Clear admin session too if present
    if (typeof window !== 'undefined') {
      localStorage.removeItem('evo_admin_pw');
      localStorage.removeItem('evo_admin');
      document.cookie = 'evo_admin=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'evo_admin=; path=/; domain=evolabsresearch.ca; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    await signOut({ callbackUrl: '/account/login' });
  }

  return (
    <>
      <Head>
        <title>Sign Out | EVO Labs Research</title>
      </Head>
      <div style={{
        minHeight: '100vh', background: '#0a0a0a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 16px', fontFamily: "'Poppins', sans-serif",
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
              <img
                src="https://evolabsresearch.ca/wp-content/uploads/2021/06/EVO-LABS-RESEARCH-1.png"
                alt="EVO Labs Research"
                style={{ height: 40, filter: 'brightness(0) invert(1)', display: 'block', margin: '0 auto 8px' }}
              />
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Research Portal
              </div>
            </Link>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: '40px 32px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>👋</div>

            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 10 }}>
              Sign out?
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 32, lineHeight: 1.6 }}>
              You&apos;ll need a new magic link to access<br />the research portal next time.
            </p>

            <button
              onClick={handleSignOut}
              disabled={loading}
              style={{
                width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                background: '#1B4D3E', color: '#4ade80',
                fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: 12, transition: 'all 0.2s', letterSpacing: '0.03em',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Signing out…' : 'Yes, sign me out'}
            </button>

            <Link
              href="/account"
              style={{
                display: 'block', padding: '14px', borderRadius: 10,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.2s', letterSpacing: '0.03em',
              }}
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
