import Head from 'next/head';
import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <>
      <Head><title>Check Your Email | EVO Labs Research</title></Head>
      <div style={{
        minHeight: '100vh',
        background: '#0f0f0f',
        fontFamily: "'Poppins', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
      }}>
        <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>

          {/* Logo */}
          <Link href="/">
            <img src="/images/evo-logo.png" alt="EVO Labs" style={{ height: 36, marginBottom: 36, opacity: 0.9 }} />
          </Link>

          {/* Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'rgba(74,222,128,0.08)',
            border: '1px solid rgba(74,222,128,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 24px',
          }}>
            📬
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 10 }}>
            Check your inbox
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 28 }}>
            We sent a magic link to your email address.
            Click the link to sign in — no password needed.
          </p>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 28,
            textAlign: 'left',
          }}>
            {[
              'Check your spam folder if you don\'t see it.',
              'The link expires in 24 hours.',
              'You can close this tab and use the link from any device.',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < 2 ? 10 : 0 }}>
                <span style={{ fontSize: 12, color: '#4ade80', flexShrink: 0 }}>·</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{tip}</span>
              </div>
            ))}
          </div>

          <Link
            href="/account/login"
            style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </>
  );
}
