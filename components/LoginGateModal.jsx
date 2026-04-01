import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const BENEFITS = [
  { icon: '📋', text: 'Order history & COA access' },
  { icon: '🔬', text: 'Exclusive research discounts' },
  { icon: '⚡', text: 'Same-day fulfillment tracking' },
  { icon: '🔒', text: 'Secure, gated research portal' },
];

async function getRecaptchaToken() {
  if (!RECAPTCHA_SITE_KEY || typeof window === 'undefined' || !window.grecaptcha) return null;
  try { return await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'login' }); }
  catch { return null; }
}

export default function LoginGateModal({ open, onClose }) {
  const [method, setMethod] = useState('email'); // 'email' | 'phone'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) { setSent(false); setEmail(''); setPhone(''); setError(''); setAgeConfirmed(false); setMethod('email'); }
  }, [open]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!ageConfirmed) return;
    if (method === 'email' && !email) return;
    if (method === 'phone' && !phone) return;
    setLoading(true);
    setError('');
    try {
      const captchaToken = await getRecaptchaToken();
      if (method === 'email') {
        const result = await signIn('email', {
          email,
          redirect: false,
          callbackUrl: typeof window !== 'undefined' ? window.location.href : '/',
          captchaToken,
        });
        if (result?.error) throw new Error(result.error);
      } else {
        const res = await fetch('/api/auth/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, captchaToken }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send SMS');
      }
      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const canSubmit = ageConfirmed && (method === 'email' ? !!email : !!phone) && !loading;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px 16px', fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480, borderRadius: 24,
          background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden', position: 'relative',
        }}
      >
        <div style={{ height: 3, background: 'linear-gradient(90deg, #0F2A4A, #06b6d4)' }} />

        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '50%',
            width: 32, height: 32, cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
            fontSize: 18, lineHeight: '32px', textAlign: 'center',
          }}
        >×</button>

        <div style={{ padding: '32px 32px 36px' }}>
          {!sent ? (
            <>
              {/* Header */}
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)',
                  borderRadius: 100, padding: '4px 12px', marginBottom: 14,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#06b6d4', display: 'inline-block' }} />
                  <span style={{ fontSize: 11, color: '#06b6d4', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Research Portal Access
                  </span>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.02em' }}>
                  Create your free research account
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                  EVO Labs is a gated research platform. Choose how you&apos;d like to receive your instant access link.
                </p>
              </div>

              {/* Benefits */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24,
                background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '16px',
              }}>
                {BENEFITS.map(b => (
                  <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14 }}>{b.icon}</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>{b.text}</span>
                  </div>
                ))}
              </div>

              {/* Method toggle */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6,
                background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 4, marginBottom: 18,
              }}>
                {[
                  { key: 'email', label: '✉️  Email link' },
                  { key: 'phone', label: '📱  SMS link' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setMethod(key); setError(''); }}
                    style={{
                      padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: method === key ? '#0F2A4A' : 'transparent',
                      color: method === key ? '#06b6d4' : 'rgba(255,255,255,0.4)',
                      fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
                    }}
                  >{label}</button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {method === 'email' ? (
                  <>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoFocus
                      style={{
                        width: '100%', padding: '13px 16px', borderRadius: 10, boxSizing: 'border-box',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                        color: '#fff', fontSize: 14, outline: 'none', marginBottom: 14,
                      }}
                    />
                  </>
                ) : (
                  <>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      Phone number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="(555) 000-0000"
                      required
                      autoFocus
                      style={{
                        width: '100%', padding: '13px 16px', borderRadius: 10, boxSizing: 'border-box',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                        color: '#fff', fontSize: 14, outline: 'none', marginBottom: 14,
                      }}
                    />
                  </>
                )}

                {/* Age verification */}
                <label style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px', marginBottom: 16,
                  border: ageConfirmed ? '1px solid rgba(6,182,212,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  transition: 'border-color 0.15s',
                }}>
                  <input
                    type="checkbox"
                    checked={ageConfirmed}
                    onChange={e => setAgeConfirmed(e.target.checked)}
                    required
                    style={{ marginTop: 2, accentColor: '#06b6d4', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>
                    I confirm I am <strong style={{ color: '#fff' }}>18 years or older</strong> and am
                    accessing this platform for <strong style={{ color: '#fff' }}>research purposes only</strong>.
                  </span>
                </label>

                {error && <p style={{ color: '#f87171', fontSize: 12, marginBottom: 12 }}>{error}</p>}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                    background: canSubmit ? '#0F2A4A' : '#1a2a24',
                    color: canSubmit ? '#06b6d4' : 'rgba(6,182,212,0.35)',
                    fontSize: 14, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s', letterSpacing: '0.03em',
                  }}
                >
                  {loading
                    ? 'Sending access link…'
                    : method === 'email' ? 'Send email access link →' : 'Send SMS access link →'}
                </button>

                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
                  Protected by reCAPTCHA.{' '}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.3)' }}>Privacy</a>
                  {' '}·{' '}
                  <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.3)' }}>Terms</a>
                </p>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>{method === 'phone' ? '📱' : '📬'}</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 10 }}>
                {method === 'phone' ? 'Check your texts' : 'Check your inbox'}
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 24 }}>
                We sent a secure access link to{' '}
                <strong style={{ color: '#fff' }}>{method === 'phone' ? phone : email}</strong>.
                <br />Click it to instantly access the research portal.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); setPhone(''); }}
                style={{ background: 'none', border: 'none', color: '#06b6d4', fontSize: 13, cursor: 'pointer' }}
              >
                ← Try a different {method === 'phone' ? 'number' : 'email'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
