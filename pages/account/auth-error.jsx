import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

const ERROR_MESSAGES = {
  Configuration: 'There is a server configuration problem. Please contact support.',
  AccessDenied:  'Access denied. You do not have permission to sign in.',
  Verification:  'The sign-in link has expired or has already been used. Please request a new one.',
  Default:       'An unexpected authentication error occurred. Please try again.',
};

export default function AuthErrorPage() {
  const router = useRouter();
  const { error } = router.query;
  const message = ERROR_MESSAGES[error] || ERROR_MESSAGES.Default;

  return (
    <>
      <Head><title>Sign-In Error | EVO Labs Research</title></Head>
      <div style={{
        minHeight: '100vh',
        background: '#0f0f0f',
        fontFamily: "'DM Sans', sans-serif",
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
            background: 'rgba(220,38,38,0.08)',
            border: '1px solid rgba(220,38,38,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 24px',
          }}>
            ⚠️
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 10 }}>
            Sign-in failed
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 28 }}>
            {message}
          </p>

          {error === 'Verification' && (
            <div style={{
              background: 'rgba(250,204,21,0.05)',
              border: '1px solid rgba(250,204,21,0.15)',
              borderRadius: 10, padding: '14px 18px', marginBottom: 24,
              fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6,
            }}>
              Magic links can only be used once and expire after 24 hours.
              Request a new one from the login page.
            </div>
          )}

          <Link
            href="/account/login"
            style={{
              display: 'inline-block',
              background: '#06b6d4', color: '#0a0a0a',
              borderRadius: 10, padding: '12px 28px',
              fontSize: 13, fontWeight: 700, textDecoration: 'none',
              marginBottom: 16,
            }}
          >
            Try Again
          </Link>

          <div>
            <Link
              href="/"
              style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
