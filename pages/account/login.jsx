import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';

export default function LoginPage() {
  const [tab, setTab] = useState('phone'); // 'email' | 'phone'
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  // Email state
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // Phone state
  const [phone, setPhone] = useState('');
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [codeInputs, setCodeInputs] = useState(['', '', '', '', '', '']);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Email submit ──────────────────────────────────────────────────────────
  async function handleEmailSubmit(e) {
    e.preventDefault();
    if (!email || !ageConfirmed) return;
    setLoading(true);
    setError('');
    try {
      const result = await signIn('email', { email, redirect: false, callbackUrl: '/account' });
      if (result?.error) throw new Error(result.error);
      // Omnisend: identify contact and fire userLoggedIn event (fire-and-forget)
      fetch('/api/omnisend/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).catch(() => {});
      fetch('/api/omnisend/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, eventName: 'userLoggedIn', fields: { method: 'email' } }),
      }).catch(() => {});
      setEmailSent(true);
    } catch {
      setError('Failed to send link. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Phone: send OTP ───────────────────────────────────────────────────────
  async function handleSendOtp(e) {
    e.preventDefault();
    if (!phone || !ageConfirmed) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send code');
      setNormalizedPhone(data.phone);
      setCodeSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Phone: verify OTP ─────────────────────────────────────────────────────
  async function handleVerifyOtp(e) {
    e.preventDefault();
    const fullCode = codeInputs.join('');
    if (fullCode.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      const result = await signIn('phone-otp', {
        phone: normalizedPhone,
        code: fullCode,
        redirect: false,
        callbackUrl: '/account',
      });
      if (result?.error) {
        setError('Invalid or expired code. Please try again.');
        setCodeInputs(['', '', '', '', '', '']);
      } else if (result?.url) {
        // Omnisend: fire userLoggedIn event (fire-and-forget, non-blocking)
        fetch('/api/omnisend/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedPhone, eventName: 'userLoggedIn', fields: { method: 'phone' } }),
        }).catch(() => {});
        fetch('/api/omnisend/identify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: normalizedPhone }),
        }).catch(() => {});
        window.location.href = result.url;
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── OTP digit input handler ───────────────────────────────────────────────
  function handleCodeDigit(i, val) {
    const cleaned = val.replace(/\D/g, '').slice(-1);
    const next = [...codeInputs];
    next[i] = cleaned;
    setCodeInputs(next);
    if (cleaned && i < 5) {
      document.getElementById(`otp-${i + 1}`)?.focus();
    }
  }

  function handleCodeKeyDown(i, e) {
    if (e.key === 'Backspace' && !codeInputs[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus();
    }
  }

  function handleCodePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCodeInputs(pasted.split(''));
      document.getElementById('otp-5')?.focus();
    }
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const inputStyle = {
    width: '100%', padding: '13px 16px', borderRadius: 10,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
    marginBottom: 16,
  };

  const labelStyle = {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: 'rgba(255,255,255,0.5)', marginBottom: 8,
    letterSpacing: '0.06em', textTransform: 'uppercase',
  };

  const btnDisabled = loading || !ageConfirmed;

  return (
    <>
      <Head>
        <title>Sign In | EVO Labs Research</title>
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
                src="/images/evo-logo.png"
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
            borderRadius: 20, padding: '36px 32px',
          }}>
            {/* ── Tab switcher ────────────────────────────────────────── */}
            {!emailSent && !codeSent && (
              <div style={{
                display: 'flex', background: 'rgba(255,255,255,0.05)',
                borderRadius: 10, padding: 4, marginBottom: 28,
              }}>
                {['phone', 'email'].map(t => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setError(''); }}
                    style={{
                      flex: 1, padding: '9px 0', borderRadius: 7, border: 'none',
                      background: tab === t ? 'rgba(27,77,62,0.8)' : 'transparent',
                      color: tab === t ? '#4ade80' : 'rgba(255,255,255,0.4)',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {t === 'phone' ? '📱 Phone' : '✉ Email'}
                  </button>
                ))}
              </div>
            )}

            {/* ── Age confirmation (shared) ────────────────────────────── */}
            {!emailSent && !codeSent && (
              <label style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
                background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px', marginBottom: 20,
                border: ageConfirmed ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(255,255,255,0.08)',
                transition: 'border-color 0.15s',
              }}>
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={e => setAgeConfirmed(e.target.checked)}
                  style={{ marginTop: 2, accentColor: '#4ade80', flexShrink: 0 }}
                />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>
                  I confirm I am <strong style={{ color: '#fff' }}>18 years or older</strong> and am
                  accessing this platform for <strong style={{ color: '#fff' }}>research purposes only</strong>.
                </span>
              </label>
            )}

            {/* ══ EMAIL TAB ══════════════════════════════════════════════ */}
            {tab === 'email' && !emailSent && (
              <form onSubmit={handleEmailSubmit}>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Sign in with email</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
                  We&apos;ll send you a magic link — no password needed.
                </p>

                <label style={labelStyle}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={inputStyle}
                />

                {error && <p style={{ color: '#f87171', fontSize: 12, marginBottom: 12 }}>{error}</p>}

                <button
                  type="submit"
                  disabled={btnDisabled || !email}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                    background: (btnDisabled || !email) ? '#1a2a24' : '#1B4D3E',
                    color: (btnDisabled || !email) ? 'rgba(74,222,128,0.35)' : '#4ade80',
                    fontSize: 14, fontWeight: 700,
                    cursor: (btnDisabled || !email) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {loading ? 'Sending…' : 'Send magic link →'}
                </button>
              </form>
            )}

            {tab === 'email' && emailSent && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 10 }}>Check your inbox</h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                  We sent a sign-in link to <strong style={{ color: '#fff' }}>{email}</strong>.
                  <br />Click it to instantly access the research portal.
                </p>
                <button
                  onClick={() => { setEmailSent(false); setEmail(''); }}
                  style={{ background: 'none', border: 'none', color: '#4ade80', fontSize: 13, cursor: 'pointer', marginTop: 20 }}
                >
                  ← Use a different email
                </button>
              </div>
            )}

            {/* ══ PHONE TAB ══════════════════════════════════════════════ */}
            {tab === 'phone' && !codeSent && (
              <form onSubmit={handleSendOtp}>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Sign in with phone</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
                  We&apos;ll text you a 6-digit code.
                </p>

                <label style={labelStyle}>Phone number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  required
                  style={inputStyle}
                />

                {error && <p style={{ color: '#f87171', fontSize: 12, marginBottom: 12 }}>{error}</p>}

                <button
                  type="submit"
                  disabled={btnDisabled || !phone}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                    background: (btnDisabled || !phone) ? '#1a2a24' : '#1B4D3E',
                    color: (btnDisabled || !phone) ? 'rgba(74,222,128,0.35)' : '#4ade80',
                    fontSize: 14, fontWeight: 700,
                    cursor: (btnDisabled || !phone) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {loading ? 'Sending…' : 'Send code →'}
                </button>
              </form>
            )}

            {tab === 'phone' && codeSent && (
              <form onSubmit={handleVerifyOtp}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📱</div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Enter your code</h2>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                    Sent to <strong style={{ color: '#fff' }}>{normalizedPhone}</strong>
                  </p>
                </div>

                {/* 6-digit OTP boxes */}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }} onPaste={handleCodePaste}>
                  {codeInputs.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleCodeDigit(i, e.target.value)}
                      onKeyDown={e => handleCodeKeyDown(i, e)}
                      autoFocus={i === 0}
                      style={{
                        width: 48, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 700,
                        borderRadius: 10, border: digit ? '2px solid #4ade80' : '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.06)', color: '#fff', outline: 'none',
                        transition: 'border-color 0.15s',
                      }}
                    />
                  ))}
                </div>

                {error && <p style={{ color: '#f87171', fontSize: 12, textAlign: 'center', marginBottom: 12 }}>{error}</p>}

                <button
                  type="submit"
                  disabled={loading || codeInputs.join('').length !== 6}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                    background: (loading || codeInputs.join('').length !== 6) ? '#1a2a24' : '#1B4D3E',
                    color: (loading || codeInputs.join('').length !== 6) ? 'rgba(74,222,128,0.35)' : '#4ade80',
                    fontSize: 14, fontWeight: 700,
                    cursor: (loading || codeInputs.join('').length !== 6) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {loading ? 'Verifying…' : 'Verify & sign in →'}
                </button>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <button
                    type="button"
                    onClick={() => { setCodeSent(false); setCodeInputs(['', '', '', '', '', '']); setError(''); }}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer' }}
                  >
                    ← Wrong number?
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Trust chips */}
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
            {['No credit card required', 'We never sell your data', 'Cancel anytime'].map(t => (
              <span key={t} style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: "'Poppins', sans-serif" }}>
                <span style={{ color: '#4ade80', fontWeight: 700 }}>✓</span> {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(ctx) {
  const session = await getSession(ctx);
  if (session) return { redirect: { destination: '/account', permanent: false } };
  return { props: {} };
}
