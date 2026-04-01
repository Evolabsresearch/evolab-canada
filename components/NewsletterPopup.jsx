import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const LOGO = 'https://evolabsresearch.ca/wp-content/uploads/2021/06/EVO-LABS-RESEARCH-1.png';

const VIALS = [
  { src: 'https://lh3.googleusercontent.com/d/1Z_Syqo2Mcw0Sr2Rn-yu3nPWfq_JMivXp',    style: { top: -20, right: -24, width: 130, transform: 'rotate(12deg)', opacity: 0.9 } },
  { src: 'https://lh3.googleusercontent.com/d/17USTyXbdbJ9cmTh7i2CJPPg0JPcycuse',   style: { bottom: -10, right: 20, width: 90, transform: 'rotate(-8deg)', opacity: 0.7 } },
  { src: 'https://lh3.googleusercontent.com/d/1eIWeUL2FjCOuS_GcQ486QI1ah2dokAOF',  style: { top: 30, right: 80, width: 72, transform: 'rotate(20deg)', opacity: 0.5 } },
];

const KEY_SUBSCRIBED    = 'evo_newsletter_subscribed'; // email captured
const KEY_HAS_PHONE     = 'evo_newsletter_has_phone';  // phone also captured
const KEY_DISCOUNT_CODE = 'evo_discount_code';          // unique code for this device/email

export default function NewsletterPopup() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addPhone, setAddPhone] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [closing, setClosing] = useState(false);
  // phoneOnlyMode: user already gave email, just want phone for extra 5%
  const [phoneOnlyMode, setPhoneOnlyMode] = useState(false);
  // unique discount code returned from server
  const [discountCode, setDiscountCode] = useState('');
  // CASL consent checkbox
  const [caslConsent, setCaslConsent] = useState(false);

  // Auto-show after 12s — only for logged-in users who haven't subscribed yet
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isAuthenticated) return;
    const dismissed = sessionStorage.getItem('evo_newsletter_dismissed');
    const subscribed = localStorage.getItem(KEY_SUBSCRIBED);
    if (dismissed || subscribed) return;
    const timer = setTimeout(() => setShow(true), 12000);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  // Desktop exit-intent — only for logged-in users
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isAuthenticated) return;
    const dismissed = sessionStorage.getItem('evo_newsletter_dismissed');
    const subscribed = localStorage.getItem(KEY_SUBSCRIBED);
    // Only trigger once per session on desktop
    if (dismissed || subscribed) return;
    let triggered = false;
    const handler = (e) => {
      if (triggered) return;
      // Only on desktop (pointer device + wide viewport)
      if (window.innerWidth <= 768) return;
      // Mouse left through the top of the window (exit intent)
      if (e.clientY < 10) {
        triggered = true;
        setPhoneOnlyMode(false);
        setAddPhone(false);
        setSubmitted(false);
        setEmail('');
        setPhone('');
        setShow(true);
      }
    };
    document.addEventListener('mouseleave', handler);
    return () => document.removeEventListener('mouseleave', handler);
  }, [isAuthenticated]);

  // Load saved code from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(KEY_DISCOUNT_CODE);
    if (saved) setDiscountCode(saved);
  }, []);

  // Programmatic trigger from product page "Claim Discount" button
  useEffect(() => {
    const handler = () => {
      const hasPhone  = localStorage.getItem(KEY_HAS_PHONE);
      const subscribed = localStorage.getItem(KEY_SUBSCRIBED);
      if (hasPhone) return; // already have everything — do nothing
      if (subscribed) {
        // Email captured but no phone yet — show phone-only upsell
        setPhoneOnlyMode(true);
        setAddPhone(true);
        setSubmitted(false);
        setPhone('');
      } else {
        // Fresh visitor — show full form
        setPhoneOnlyMode(false);
        setAddPhone(false);
        setSubmitted(false);
        setEmail('');
        setPhone('');
      }
      setShow(true);
    };
    window.addEventListener('evo:show-popup', handler);
    return () => window.removeEventListener('evo:show-popup', handler);
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setShow(false);
      setClosing(false);
      sessionStorage.setItem('evo_newsletter_dismissed', '1');
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneOnlyMode && !email) return;
    if (phoneOnlyMode && !phone) return;

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: phoneOnlyMode ? undefined : email,
          phone: phone || undefined,
          phoneOnly: phoneOnlyMode,
          caslConsent: true,
          consentTimestamp: new Date().toISOString(),
        }),
      });
      const data = await res.json().catch(() => ({}));

      // Store unique code — either freshly generated or existing one from server
      if (data.code) {
        setDiscountCode(data.code);
        localStorage.setItem(KEY_DISCOUNT_CODE, data.code);
      }
    } catch (_) {}

    if (!phoneOnlyMode) localStorage.setItem(KEY_SUBSCRIBED, '1');
    if (phone) localStorage.setItem(KEY_HAS_PHONE, '1');
    setSubmitted(true);
    setTimeout(handleClose, 4000);
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(8px)',
          opacity: closing ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', zIndex: 9999,
        top: '50%', left: '50%',
        transform: closing
          ? 'translate(-50%, -52%) scale(0.96)'
          : 'translate(-50%, -50%) scale(1)',
        opacity: closing ? 0 : 1,
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease',
        width: '94%', maxWidth: 460,
        fontFamily: "'DM Sans', 'Anek Telugu', sans-serif",
      }}>
        <div style={{
          background: '#0f0f0f',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(6,182,212,0.15), 0 40px 100px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>

          {/* ── Hero header ── */}
          <div style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #071a12 0%, #0d2b1e 60%, #0f3325 100%)',
            padding: '36px 32px 28px',
            overflow: 'hidden',
            minHeight: 180,
          }}>
            {/* Grid texture */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              pointerEvents: 'none',
            }} />

            {/* Green glow blob */}
            <div style={{
              position: 'absolute', top: -40, right: -40,
              width: 200, height: 200,
              background: 'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            {/* Floating vials */}
            {VIALS.map((v, i) => (
              <img
                key={i}
                src={v.src}
                alt=""
                draggable={false}
                style={{
                  position: 'absolute',
                  ...v.style,
                  filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.5))',
                  animation: 'none',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              />
            ))}

            {/* Close button */}
            <button
              onClick={handleClose}
              style={{
                position: 'absolute', top: 12, right: 12,
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                zIndex: 10,
                lineHeight: 1,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.45)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
            >
              &times;
            </button>

            {/* Logo */}
            <div style={{ marginBottom: 20, position: 'relative', zIndex: 1 }}>
              <img src={LOGO} alt="EVO Labs Research" style={{ height: 32, filter: 'brightness(0) invert(1)', display: 'block' }} />
            </div>

            {/* Discount badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, position: 'relative', zIndex: 1 }}>
              <div style={{
                padding: '6px 16px',
                background: 'rgba(6,182,212,0.15)',
                border: '1px solid rgba(6,182,212,0.35)',
                borderRadius: 9999,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#06b6d4', lineHeight: 1 }}>10%</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 500, lineHeight: 1.3 }}>email<br/>discount</span>
              </div>
              <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.2)', fontWeight: 300 }}>+</span>
              <div style={{
                padding: '6px 16px',
                background: 'rgba(6,182,212,0.08)',
                border: '1px dashed rgba(6,182,212,0.25)',
                borderRadius: 9999,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#06b6d4', lineHeight: 1 }}>5%</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500, lineHeight: 1.3 }}>add<br/>your #</span>
              </div>
            </div>

            <h2 style={{
              fontSize: 24, fontWeight: 900, color: '#fff',
              letterSpacing: '-0.02em', lineHeight: 1.2,
              position: 'relative', zIndex: 1,
            }}>
              {phoneOnlyMode
                ? <>Add Your # for an Extra <span style={{ color: '#06b6d4' }}>5% Off</span></>
                : <>Unlock Up to <span style={{ color: '#06b6d4' }}>15% Off</span></>}
            </h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 6, position: 'relative', zIndex: 1 }}>
              {phoneOnlyMode
                ? 'You already unlocked 10% — add your phone for 15% total'
                : 'First order only \u2014 join 12,000+ researchers worldwide'}
            </p>
          </div>

          {/* ── Form body ── */}
          <div style={{ padding: '24px 28px 28px', background: '#0f0f0f' }}>
            {!submitted ? (
              <>
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Email — hidden in phone-only mode */}
                    {!phoneOnlyMode && (
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#06b6d4', fontSize: 15, pointerEvents: 'none' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/>
                        </svg>
                      </div>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        style={{
                          width: '100%', padding: '13px 14px 13px 42px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 12,
                          fontSize: 14, color: '#fff',
                          background: 'rgba(255,255,255,0.05)',
                          outline: 'none', fontFamily: 'inherit',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.2s, background 0.2s',
                        }}
                        onFocus={e => { e.target.style.borderColor = 'rgba(6,182,212,0.5)'; e.target.style.background = 'rgba(6,182,212,0.05)'; }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
                      />
                    </div>
                    )}

                    {/* Phone toggle */}
                    {!addPhone ? (
                      <button
                        type="button"
                        onClick={() => setAddPhone(true)}
                        style={{
                          width: '100%', padding: '12px 14px',
                          border: '1px dashed rgba(6,182,212,0.3)',
                          borderRadius: 12,
                          background: 'rgba(6,182,212,0.05)',
                          cursor: 'pointer',
                          fontSize: 13, fontWeight: 600, color: '#06b6d4',
                          fontFamily: 'inherit', textAlign: 'center',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.1)'; e.currentTarget.style.borderColor = 'rgba(6,182,212,0.5)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.05)'; e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'; }}
                      >
                        + Add phone number for an extra 5% off
                      </button>
                    ) : (
                      <div style={{ position: 'relative' }}>
                        <div style={{
                          position: 'absolute', top: -9, right: 10,
                          fontSize: 9, fontWeight: 800, color: '#0f0f0f',
                          background: '#06b6d4', padding: '2px 8px', borderRadius: 9999,
                          letterSpacing: '0.04em',
                        }}>
                          +5% OFF
                        </div>
                        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#06b6d4', pointerEvents: 'none' }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                          </svg>
                        </div>
                        <input
                          type="tel"
                          placeholder="(555) 123-4567"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          style={{
                            width: '100%', padding: '13px 14px 13px 42px',
                            border: '1px solid rgba(6,182,212,0.3)',
                            borderRadius: 12,
                            fontSize: 14, color: '#fff',
                            background: 'rgba(6,182,212,0.05)',
                            outline: 'none', fontFamily: 'inherit',
                            boxSizing: 'border-box',
                          }}
                          onFocus={e => e.target.style.borderColor = 'rgba(6,182,212,0.6)'}
                          onBlur={e => e.target.style.borderColor = 'rgba(6,182,212,0.3)'}
                        />
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4, marginLeft: 2 }}>
                          Order updates &amp; tracking only. No spam, ever.
                        </p>
                      </div>
                    )}

                    {/* CASL Consent */}
                    <label style={{ display: 'flex', gap: 8, cursor: 'pointer', alignItems: 'flex-start', marginTop: 4 }}>
                      <input
                        type="checkbox"
                        checked={caslConsent}
                        onChange={e => setCaslConsent(e.target.checked)}
                        style={{ marginTop: 2, accentColor: '#06b6d4', flexShrink: 0 }}
                      />
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                        I consent to receive promotional emails and SMS from EVO Labs Research Canada. You can unsubscribe at any time. View our{' '}
                        <a href="/privacy" style={{ color: '#06b6d4', textDecoration: 'underline' }}>Privacy Policy</a>.
                      </span>
                    </label>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={!caslConsent}
                      style={{
                        width: '100%', padding: '14px 24px',
                        background: 'linear-gradient(135deg, #0F2A4A 0%, #2d7a5e 100%)',
                        color: '#fff',
                        borderRadius: 12, border: '1px solid rgba(6,182,212,0.2)',
                        fontSize: 15, fontWeight: 700,
                        fontFamily: "'DM Sans', sans-serif",
                        cursor: !caslConsent ? 'not-allowed' : 'pointer',
                        opacity: !caslConsent ? 0.5 : 1,
                        transition: 'transform 0.15s, box-shadow 0.15s, opacity 0.15s',
                        marginTop: 2,
                        boxShadow: '0 4px 20px rgba(27,77,62,0.4)',
                      }}
                      onMouseEnter={e => { if (caslConsent) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(27,77,62,0.55)'; } }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(27,77,62,0.4)'; }}
                    >
                      {phoneOnlyMode ? 'Unlock My Extra 5% →' : (addPhone && phone ? 'Claim My 15% Discount →' : 'Claim My 10% Discount →')}
                    </button>
                  </div>
                </form>

                {/* Trust row */}
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
                  {['🔬 Research grade', '🔒 No spam, ever', '✓ Unsubscribe anytime'].map(item => (
                    <span key={item} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{item}</span>
                  ))}
                </div>
                <p style={{ fontSize: 10, color: '#ef4444', fontWeight: 600, textAlign: 'center', marginTop: 8 }}>
                  Limited time &mdash; first order only
                </p>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: 'rgba(6,182,212,0.1)',
                  border: '2px solid rgba(6,182,212,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 8 }}>
                  {phoneOnlyMode ? 'Extra 5% Unlocked!' : "You're In!"}
                </h3>

                {/* Unique discount code display */}
                {discountCode && (
                  <div style={{
                    margin: '12px auto 14px',
                    background: 'rgba(6,182,212,0.08)',
                    border: '1.5px dashed rgba(6,182,212,0.4)',
                    borderRadius: 12,
                    padding: '12px 20px',
                    maxWidth: 220,
                  }}>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Your code</p>
                    <p style={{ fontSize: 22, fontWeight: 900, color: '#06b6d4', letterSpacing: '0.08em', fontFamily: 'monospace' }}>
                      {discountCode}
                    </p>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>one-time use · expires 30 days</p>
                  </div>
                )}

                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                  {discountCode
                    ? <>Apply at checkout for <strong style={{ color: '#06b6d4' }}>{(phoneOnlyMode || phone) ? '15%' : '10%'} off</strong> your first order.</>
                    : <>Check your email for your <strong style={{ color: '#06b6d4' }}>{(phoneOnlyMode || phone) ? '15%' : '10%'} discount code</strong>.</>
                  }
                </p>
                {(phone || phoneOnlyMode) && (
                  <p style={{ fontSize: 11, color: '#06b6d4', fontWeight: 600, marginTop: 8 }}>
                    ✓ +5% phone bonus applied — 15% total
                  </p>
                )}
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 10 }}>
                  This code is unique to you and can only be used once.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
