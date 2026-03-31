import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { products, getCategoryConfig } from '../../lib/data';

const LOGO = 'https://evolabsresearch.ca/wp-content/uploads/2021/06/EVO-LABS-RESEARCH-1.png';

const STATUS_COLORS = {
  pending:    { bg: 'rgba(251,191,36,0.15)',  text: '#fbbf24', label: 'Pending' },
  processing: { bg: 'rgba(56,189,248,0.15)',  text: '#38bdf8', label: 'Processing' },
  'on-hold':  { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af', label: 'On Hold' },
  completed:  { bg: 'rgba(74,222,128,0.15)',  text: '#4ade80', label: 'Delivered' },
  shipped:    { bg: 'rgba(99,179,237,0.15)',  text: '#63b3ed', label: 'Shipped' },
  cancelled:  { bg: 'rgba(248,113,113,0.15)', text: '#f87171', label: 'Cancelled' },
  refunded:   { bg: 'rgba(167,139,250,0.15)', text: '#a78bfa', label: 'Refunded' },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af', label: status };
  return (
    <span style={{
      background: s.bg, color: s.text,
      fontSize: 10, fontWeight: 700,
      padding: '3px 10px', borderRadius: 9999,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      fontFamily: "'Poppins', sans-serif",
      border: `1px solid ${s.text}30`,
    }}>
      {s.label}
    </span>
  );
}

const FLOATING_VIALS = [
  { src: 'https://lh3.googleusercontent.com/d/1Z_Syqo2Mcw0Sr2Rn-yu3nPWfq_JMivXp',   style: { bottom: -30, right: '5%',  width: 220, transform: 'rotate(8deg)',   opacity: 0.18 }, anim: 'acctVialFloat1', dur: '6s' },
  { src: 'https://lh3.googleusercontent.com/d/18kaeTUJb9UE8HhMtYtim3aOtq5gCjAcK', style: { top: 20,     right: '22%', width: 140, transform: 'rotate(-12deg)', opacity: 0.12 }, anim: 'acctVialFloat2', dur: '7.5s' },
  { src: 'https://lh3.googleusercontent.com/d/1ivebNlvWFkerHxlXVHoVYj9a0AnWHpLs', style: { bottom: 10,  right: '30%', width: 110, transform: 'rotate(5deg)',   opacity: 0.10 }, anim: 'acctVialFloat3', dur: '5.5s' },
  { src: 'https://lh3.googleusercontent.com/d/10_QeXyWlLoOpAAogqDOdAxtzBG39-i34',    style: { top: -10,    right: '42%', width: 90,  transform: 'rotate(-20deg)', opacity: 0.08 }, anim: 'acctVialFloat4', dur: '8s' },
];

const TIERS = [
  { name: 'Bronze',   min: 0,    max: 500,  color: '#cd7f32', icon: '🥉' },
  { name: 'Silver',   min: 500,  max: 1500, color: '#94a3b8', icon: '🥈' },
  { name: 'Gold',     min: 1500, max: 3000, color: '#f59e0b', icon: '🥇' },
  { name: 'Platinum', min: 3000, max: null, color: '#a78bfa', icon: '💎' },
];

function getTier(pts) {
  return TIERS.slice().reverse().find(t => pts >= t.min) || TIERS[0];
}

function LoyaltyTab({ orders }) {
  const totalSpent = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
  const points = Math.floor(totalSpent);
  const tier = getTier(points);
  const nextTier = TIERS[TIERS.indexOf(tier) + 1] || null;
  const progress = nextTier ? Math.min(100, ((points - tier.min) / (nextTier.min - tier.min)) * 100) : 100;
  const discountCode = typeof window !== 'undefined' ? localStorage.getItem('evo_discount_code') : null;

  const HOW_TO_EARN = [
    { icon: '🛒', label: 'Every purchase', value: '1 pt / $1' },
    { icon: '📧', label: 'Newsletter signup', value: '50 pts' },
    { icon: '🤝', label: 'Refer a friend', value: '200 pts' },
    { icon: '⭐', label: 'Leave a review', value: '100 pts' },
  ];

  const REDEMPTION = [
    { pts: 500,  label: '$5 off next order' },
    { pts: 1000, label: '$10 off next order' },
    { pts: 2500, label: '$25 off next order' },
  ];

  return (
    <div className="acct-loyalty-grid">
      {/* Left column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Points card */}
        <div className="acct-pts-card" style={{
          background: `linear-gradient(135deg, rgba(27,77,62,0.4) 0%, rgba(10,10,10,0.6) 100%)`,
          border: `1px solid ${tier.color}30`,
          borderRadius: 20,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -60, right: -60,
            width: 200, height: 200,
            background: `radial-gradient(circle, ${tier.color}18 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                EVO Points Balance
              </div>
              <div className="acct-pts-num" style={{ fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>
                {points.toLocaleString()}
              </div>
            </div>
            <div style={{
              background: `${tier.color}18`,
              border: `1px solid ${tier.color}40`,
              borderRadius: 12, padding: '10px 16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 22 }}>{tier.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: tier.color, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{tier.name}</div>
            </div>
          </div>

          {nextTier && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Progress to {nextTier.icon} {nextTier.name}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{nextTier.min - points} pts to go</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 9999 }}>
                <div style={{
                  height: '100%', borderRadius: 9999,
                  background: `linear-gradient(90deg, ${tier.color}, ${nextTier.color})`,
                  width: `${progress}%`,
                  transition: 'width 1s ease',
                }} />
              </div>
            </div>
          )}
          {!nextTier && (
            <div style={{ fontSize: 13, color: tier.color, fontWeight: 700 }}>
              {tier.icon} You&apos;ve reached the highest tier!
            </div>
          )}
        </div>

        {/* How to earn */}
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16, padding: '24px',
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>How to Earn Points</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {HOW_TO_EARN.map(h => (
              <div key={h.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{h.icon}</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{h.label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#4ade80' }}>{h.value}</span>
              </div>
            ))}
          </div>
        </div>

        {discountCode && (
          <div style={{
            background: 'rgba(74,222,128,0.05)',
            border: '1.5px dashed rgba(74,222,128,0.25)',
            borderRadius: 14, padding: '18px 24px',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Your Discount Code
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#4ade80', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
              {discountCode}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>One-time use · 10% off first order</div>
          </div>
        )}
      </div>

      {/* Right column — redemption */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16, padding: '24px',
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Redeem Points</h3>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>Apply at checkout</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {REDEMPTION.map(r => (
              <div key={r.pts} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: points >= r.pts ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${points >= r.pts ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.04)'}`,
                borderRadius: 10, padding: '12px 14px',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: points >= r.pts ? '#fff' : 'rgba(255,255,255,0.3)' }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: points >= r.pts ? 'rgba(74,222,128,0.7)' : 'rgba(255,255,255,0.2)', marginTop: 2 }}>{r.pts.toLocaleString()} pts</div>
                </div>
                <button
                  disabled={points < r.pts}
                  style={{
                    background: points >= r.pts ? '#1B4D3E' : 'rgba(255,255,255,0.04)',
                    color: points >= r.pts ? '#fff' : 'rgba(255,255,255,0.2)',
                    border: 'none', borderRadius: 8,
                    fontSize: 11, fontWeight: 700, padding: '8px 12px',
                    cursor: points >= r.pts ? 'pointer' : 'default',
                    minHeight: 36,
                  }}
                >
                  {points >= r.pts ? 'Redeem' : 'Locked'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: 'rgba(167,139,250,0.04)',
          border: '1px solid rgba(167,139,250,0.1)',
          borderRadius: 14, padding: '16px 18px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 18, marginBottom: 6 }}>🎁</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>More rewards coming soon</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>Free products, exclusive access &amp; more</div>
        </div>
      </div>
    </div>
  );
}

function ReferTab({ email }) {
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  const baseCode = email
    ? email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8)
    : 'FRIEND';
  const refCode = `${baseCode}10`;
  const refLink = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${refCode}`
    : `https://evolabsresearch.ca/?ref=${refCode}`;

  const shareText = `Hey! I've been researching with EVO Labs — 99%+ purity peptides, COA on every batch. Use my link to get 10% off your first order: ${refLink}`;

  function copyLink() {
    navigator.clipboard.writeText(refLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function copyEmail() {
    navigator.clipboard.writeText(shareText).then(() => {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2500);
    });
  }

  return (
    <div style={{ maxWidth: 620 }}>
      <div className="acct-refer-hero" style={{ background: 'linear-gradient(135deg, #1B4D3E 0%, #2d7a5e 100%)', borderRadius: 16, marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -20, fontSize: 80, opacity: 0.12, userSelect: 'none' }}>🎁</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Refer a Friend</div>
        <h2 className="acct-refer-heading" style={{ fontWeight: 800, color: '#fff', margin: '0 0 8px', fontFamily: "'Anek Telugu', sans-serif" }}>Give 10% Off. Get Rewarded.</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>
          Share your link. When a friend places their first order, they save 10% — and you earn 200 reward points ($2 value).
        </p>
      </div>
      <div className="acct-refer-card" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Your Referral Link</div>
        <div className="acct-refer-link-row">
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{refLink}</div>
          <button onClick={copyLink} style={{ background: copied ? '#16a34a' : '#1B4D3E', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s', fontFamily: "'Poppins', sans-serif", minHeight: 44 }}>
            {copied ? '✓ Copied!' : 'Copy Link'}
          </button>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          Your code: <span style={{ color: '#4ade80', fontWeight: 700, fontFamily: 'monospace' }}>{refCode}</span> — works in the discount field at checkout too
        </div>
      </div>
      <div className="acct-refer-card" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Share Message</div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 10 }}>{shareText}</div>
        <button onClick={copyEmail} className="acct-copy-email-btn" style={{ background: 'rgba(255,255,255,0.06)', color: emailCopied ? '#4ade80' : 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 16px', fontWeight: 600, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'Poppins', sans-serif", minHeight: 44 }}>
          {emailCopied ? '✓ Copied message!' : 'Copy message'}
        </button>
      </div>
      <div className="acct-refer-card" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>How It Works</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { step: '1', text: 'Share your referral link with a friend' },
            { step: '2', text: 'They visit EVO Labs and place their first order with your code' },
            { step: '3', text: 'They automatically get 10% off — you earn 200 reward points' },
            { step: '4', text: 'Redeem 500 pts for $5 off, 1000 pts for $10 off your next order' },
          ].map(({ step, text }) => (
            <div key={step} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1B4D3E', color: '#4ade80', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{step}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, paddingTop: 5 }}>{text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


const EMPTY_PROFILE = {
  first_name: '', last_name: '', email: '', phone: '',
  billing_address_1: '', billing_address_2: '', billing_city: '', billing_state: '', billing_postcode: '', billing_country: 'US',
  shipping_first_name: '', shipping_last_name: '', shipping_address_1: '', shipping_address_2: '', shipping_city: '', shipping_state: '', shipping_postcode: '', shipping_country: 'US',
};

function SettingsTab({ session, isPhoneUser, displayIdentifier }) {
  const [form, setForm] = useState(EMPTY_PROFILE);
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [autofilled, setAutofilled] = useState(false);
  const [birthdayMonth, setBirthdayMonth] = useState('');
  const [birthdayDay, setBirthdayDay] = useState('');

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(({ profile }) => {
        if (profile) {
          setForm({ ...EMPTY_PROFILE, ...profile });
          if (profile._autofilled) setAutofilled(true);
          if (profile.birthday_month) setBirthdayMonth(String(profile.birthday_month));
          if (profile.birthday_day) setBirthdayDay(String(profile.birthday_day));
        } else {
          setForm(prev => ({
            ...prev,
            email: isPhoneUser ? '' : (session.user.email || ''),
            phone: isPhoneUser ? displayIdentifier : '',
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, []);

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
    setSaved(false);
  }

  function applyBillingToShipping() {
    setForm(prev => ({
      ...prev,
      shipping_first_name: prev.first_name,
      shipping_last_name: prev.last_name,
      shipping_address_1: prev.billing_address_1,
      shipping_address_2: prev.billing_address_2,
      shipping_city: prev.billing_city,
      shipping_state: prev.billing_state,
      shipping_postcode: prev.billing_postcode,
      shipping_country: prev.billing_country,
    }));
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          birthday_month: birthdayMonth ? parseInt(birthdayMonth) : null,
          birthday_day: birthdayDay ? parseInt(birthdayDay) : null,
        }),
      });
      if (r.ok) { setSaved(true); setAutofilled(false); }
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
    padding: '12px', fontSize: 14, color: '#fff',
    outline: 'none', boxSizing: 'border-box',
    fontFamily: "'Poppins', sans-serif",
    minHeight: 44,
  };
  const labelStyle = {
    fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6,
  };
  const sectionHead = {
    fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.6)',
    marginBottom: 16, marginTop: 28, paddingBottom: 10,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  };
  const field = { marginBottom: 14 };

  if (loadingProfile) {
    return <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, padding: '48px 0', textAlign: 'center' }}>Loading profile…</div>;
  }

  return (
    <form onSubmit={save} style={{ maxWidth: 640 }}>
      {autofilled && (
        <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#4ade80' }}>
          ✓ We pre-filled your details from your most recent order. Review and save to confirm.
        </div>
      )}

      <div className="acct-settings-card" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>

        {/* Personal */}
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 20 }}>Personal Info</h2>
        <div className="acct-row2">
          <div>
            <label style={labelStyle}>First Name</label>
            <input style={inputStyle} value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="John" />
          </div>
          <div>
            <label style={labelStyle}>Last Name</label>
            <input style={inputStyle} value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Doe" />
          </div>
        </div>
        <div className="acct-row2">
          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              style={{ ...inputStyle, opacity: isPhoneUser ? 0.5 : 1 }}
              value={isPhoneUser ? '' : form.email}
              onChange={e => !isPhoneUser && set('email', e.target.value)}
              placeholder={isPhoneUser ? '(logged in via phone)' : 'you@example.com'}
              readOnly={isPhoneUser}
            />
          </div>
          <div>
            <label style={labelStyle}>Phone Number</label>
            <input
              style={{ ...inputStyle, opacity: !isPhoneUser ? 0.5 : 1 }}
              value={isPhoneUser ? displayIdentifier : form.phone}
              onChange={e => isPhoneUser ? null : set('phone', e.target.value)}
              placeholder="+1 (555) 000-0000"
              readOnly={isPhoneUser}
            />
          </div>
        </div>

        {/* Billing */}
        <div style={sectionHead}>Billing Address</div>
        <div style={field}>
          <label style={labelStyle}>Address Line 1</label>
          <input style={inputStyle} value={form.billing_address_1} onChange={e => set('billing_address_1', e.target.value)} placeholder="123 Main St" />
        </div>
        <div style={field}>
          <label style={labelStyle}>Address Line 2 (optional)</label>
          <input style={inputStyle} value={form.billing_address_2} onChange={e => set('billing_address_2', e.target.value)} placeholder="Apt, Suite, Unit…" />
        </div>
        <div className="acct-row3">
          <div>
            <label style={labelStyle}>City</label>
            <input style={inputStyle} value={form.billing_city} onChange={e => set('billing_city', e.target.value)} placeholder="Toronto" />
          </div>
          <div>
            <label style={labelStyle}>State</label>
            <input style={inputStyle} value={form.billing_state} onChange={e => set('billing_state', e.target.value)} placeholder="FL" maxLength={2} />
          </div>
          <div className="acct-zip-span">
            <label style={labelStyle}>ZIP Code</label>
            <input style={inputStyle} value={form.billing_postcode} onChange={e => set('billing_postcode', e.target.value)} placeholder="33601" />
          </div>
        </div>

        {/* Shipping */}
        <div style={{ ...sectionHead, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span>Shipping Address</span>
          <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', textTransform: 'none', letterSpacing: 0 }}>
            <input
              type="checkbox"
              checked={sameAsBilling}
              onChange={e => {
                setSameAsBilling(e.target.checked);
                if (e.target.checked) applyBillingToShipping();
              }}
              style={{ accentColor: '#4ade80' }}
            />
            Same as billing
          </label>
        </div>
        {!sameAsBilling && (
          <>
            <div className="acct-row2">
              <div>
                <label style={labelStyle}>First Name</label>
                <input style={inputStyle} value={form.shipping_first_name} onChange={e => set('shipping_first_name', e.target.value)} placeholder="John" />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input style={inputStyle} value={form.shipping_last_name} onChange={e => set('shipping_last_name', e.target.value)} placeholder="Doe" />
              </div>
            </div>
            <div style={field}>
              <label style={labelStyle}>Address Line 1</label>
              <input style={inputStyle} value={form.shipping_address_1} onChange={e => set('shipping_address_1', e.target.value)} placeholder="123 Main St" />
            </div>
            <div style={field}>
              <label style={labelStyle}>Address Line 2 (optional)</label>
              <input style={inputStyle} value={form.shipping_address_2} onChange={e => set('shipping_address_2', e.target.value)} placeholder="Apt, Suite, Unit…" />
            </div>
            <div className="acct-row3">
              <div>
                <label style={labelStyle}>City</label>
                <input style={inputStyle} value={form.shipping_city} onChange={e => set('shipping_city', e.target.value)} placeholder="Toronto" />
              </div>
              <div>
                <label style={labelStyle}>State</label>
                <input style={inputStyle} value={form.shipping_state} onChange={e => set('shipping_state', e.target.value)} placeholder="FL" maxLength={2} />
              </div>
              <div className="acct-zip-span">
                <label style={labelStyle}>ZIP Code</label>
                <input style={inputStyle} value={form.shipping_postcode} onChange={e => set('shipping_postcode', e.target.value)} placeholder="33601" />
              </div>
            </div>
          </>
        )}

        {/* Birthday */}
        <div style={{ ...sectionHead }}>Birthday</div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Birthday (Month / Day)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={birthdayMonth}
              onChange={e => { setBirthdayMonth(e.target.value); setSaved(false); }}
              style={{ ...inputStyle, flex: 1 }}
            >
              <option value="">Month</option>
              {['January','February','March','April','May','June','July','August','September','October','November','December']
                .map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select
              value={birthdayDay}
              onChange={e => { setBirthdayDay(e.target.value); setSaved(false); }}
              style={{ ...inputStyle, flex: '0 0 110px' }}
            >
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 6 }}>
            We&apos;ll send you a special birthday discount 🎂
          </div>
        </div>

        {/* Sign-in info (read-only) */}
        <div style={{ ...sectionHead }}>Account</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>
            {isPhoneUser ? 'Phone number' : 'Email address'}
          </span>
          {displayIdentifier}
          <span style={{ marginLeft: 10, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
            · {isPhoneUser ? 'SMS code' : 'Magic link'} sign-in
          </span>
        </div>

        <div className="acct-form-actions">
          <button
            type="submit"
            disabled={saving}
            style={{
              background: saved ? '#16a34a' : 'linear-gradient(135deg, #1B4D3E, #2d7a5e)',
              color: '#fff', border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 700, padding: '13px 28px',
              cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1,
              transition: 'all 0.2s', fontFamily: "'Poppins', sans-serif",
              minHeight: 48,
            }}
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', fontSize: 14, fontWeight: 600,
              padding: '12px 20px', borderRadius: 8, cursor: 'pointer',
              transition: 'all 0.2s', fontFamily: "'Poppins', sans-serif",
              minHeight: 48,
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </form>
  );
}

function WishlistTab() {
  const { wishlist, toggle } = useWishlist();
  const { addItem } = useCart();
  const wishlisted = products.filter(p => wishlist.includes(p.slug));

  if (wishlisted.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.35)' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🤍</div>
        <p style={{ fontSize: 15, fontWeight: 600 }}>Your wishlist is empty</p>
        <p style={{ fontSize: 13, marginTop: 8, color: 'rgba(255,255,255,0.25)' }}>Tap the heart icon on any product to save it here.</p>
        <Link href="/products" style={{ display: 'inline-block', marginTop: 20, background: '#1B4D3E', color: '#fff', padding: '12px 24px', borderRadius: 9999, fontSize: 13, fontWeight: 700, textDecoration: 'none', minHeight: 44 }}>
          Browse Products →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>{wishlisted.length} saved item{wishlisted.length !== 1 ? 's' : ''}</p>

      {/* Desktop grid */}
      <div className="acct-wishlist-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {wishlisted.map(p => {
          const cat = getCategoryConfig(p.category);
          return (
            <div key={p.slug} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '16px', position: 'relative' }}>
              <button
                onClick={() => toggle(p.slug)}
                style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
                title="Remove from wishlist"
              >❤️</button>
              <Link href={`/products/${p.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ width: 64, height: 64, background: `radial-gradient(ellipse at 50% 60%, ${cat.color} 0%, #1a1a1a 80%)`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <img src={p.image} alt={p.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4, fontFamily: "'Poppins', sans-serif" }}>{p.name}</div>
                <div style={{ fontSize: 12, color: '#4ade80', fontWeight: 700, marginBottom: 10 }}>{p.salePrice || p.price}</div>
              </Link>
              <button
                onClick={() => addItem(p, { dosage: '', bundleCount: 1 })}
                style={{
                  width: '100%', padding: '10px 0',
                  background: '#1B4D3E', color: '#fff', border: 'none',
                  borderRadius: 8, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
                  marginBottom: 4, minHeight: 44,
                }}
              >
                + Add to Cart
              </button>
            </div>
          );
        })}
      </div>

      {/* Mobile list */}
      <div className="acct-wishlist-list" style={{ flexDirection: 'column', gap: 12 }}>
        {wishlisted.map(p => {
          const cat = getCategoryConfig(p.category);
          return (
            <div key={p.slug} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <Link href={`/products/${p.slug}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                <div style={{ width: 52, height: 52, flexShrink: 0, background: `radial-gradient(ellipse at 50% 60%, ${cat.color} 0%, #1a1a1a 80%)`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={p.image} alt={p.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: "'Poppins', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#4ade80', fontWeight: 700, marginTop: 2 }}>{p.salePrice || p.price}</div>
                </div>
              </Link>
              <button
                onClick={() => addItem(p, { dosage: '', bundleCount: 1 })}
                style={{
                  flexShrink: 0, padding: '0 12px',
                  background: '#1B4D3E', color: '#fff', border: 'none',
                  borderRadius: 8, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
                  height: 44, whiteSpace: 'nowrap',
                }}
              >
                + Cart
              </button>
              <button
                onClick={() => toggle(p.slug)}
                style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4, minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Remove from wishlist"
              >❤️</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('orders');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/account/login');
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch('/api/orders')
        .then(r => r.json())
        .then(d => setOrders(d.orders || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (status === 'loading' || !session) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <img src={LOGO} alt="EVO Labs Research" style={{ height: 36, filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading your account…</div>
      </div>
    );
  }

  const isPhoneUser = session.user.email?.endsWith('@phone.evolabsresearch.ca');
  const displayIdentifier = isPhoneUser
    ? (() => {
        const digits = session.user.email.replace('@phone.evolabsresearch.ca', '');
        // Format: digits stored as E.164 without '+', e.g. "12345678901" → "+1 (234) 567-8901"
        if (digits.length === 11 && digits.startsWith('1')) {
          return `+1 (${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
        }
        if (digits.length === 10) {
          return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
        }
        return `+${digits}`;
      })()
    : session.user.email;
  const firstName = !isPhoneUser && session.user.name ? session.user.name.split(' ')[0] : null;

  const TABS = [
    { id: 'orders',        label: 'Orders',        icon: '📦' },
    { id: 'loyalty',       label: 'Rewards',        icon: '⭐' },
    { id: 'refer',         label: 'Refer',          icon: '🎁' },
    { id: 'wishlist',      label: 'Wishlist',       icon: '🤍' },
    { id: 'settings',      label: 'Settings',       icon: '⚙️' },
    ...(session.user.isPartner ? [{ id: 'partner', label: 'Partner', icon: '🤝' }] : []),
  ];

  return (
    <>
      <Head><title>My Account | EVO Labs Research</title></Head>

      <style>{`
        @keyframes acctVialFloat1 { 0%,100% { transform: translateY(0px) rotate(8deg); } 50% { transform: translateY(-18px) rotate(10deg); } }
        @keyframes acctVialFloat2 { 0%,100% { transform: translateY(0px) rotate(-12deg); } 50% { transform: translateY(-22px) rotate(-10deg); } }
        @keyframes acctVialFloat3 { 0%,100% { transform: translateY(0px) rotate(5deg); } 50% { transform: translateY(-14px) rotate(7deg); } }
        @keyframes acctVialFloat4 { 0%,100% { transform: translateY(0px) rotate(-20deg); } 50% { transform: translateY(-20px) rotate(-18deg); } }
        .order-card:hover { border-color: rgba(74,222,128,0.2) !important; background: rgba(74,222,128,0.03) !important; }
        .tab-btn { background: none; border: none; cursor: pointer; transition: all 0.15s; font-family: 'Poppins', sans-serif; }
        .tab-btn:hover { color: rgba(255,255,255,0.8) !important; }
        .acct-tab-bar::-webkit-scrollbar { display: none; }
        .acct-tab-bar { -ms-overflow-style: none; scrollbar-width: none; }

        /* ── Responsive layout classes ── */

        /* Nav */
        .acct-nav { padding: 0 32px; }
        .acct-nav-desktop-only { display: flex; }
        .acct-logo { height: 34px; }
        .acct-signout-btn { padding: 7px 16px; }

        /* Hero */
        .acct-hero { padding: 52px 32px 44px; }
        .acct-hero-heading { font-size: clamp(28px, 4vw, 44px); }
        .acct-hero-subtitle { font-size: 14px; margin-bottom: 32px; }
        .acct-hero-stats { grid-template-columns: repeat(4, auto); gap: 0 32px; }
        .acct-hero-stat-label { font-size: 15px; }
        .acct-vials-desktop { display: block; }

        /* Tab bars */
        .acct-tabs-desktop { display: flex; }
        .acct-tabs-mobile-wrap { display: none; }

        /* Main content */
        .acct-content { padding: 36px 32px; }
        .acct-tab-content { padding: 0; }

        /* Orders */
        .order-card { padding: 20px 24px; }
        .order-total { font-size: 16px; }

        /* Settings */
        .acct-settings-card { padding: 28px; }
        .acct-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .acct-row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-bottom: 14px; }
        .acct-zip-span { }
        .acct-form-actions { display: flex; flex-direction: row; align-items: center; gap: 12px; margin-top: 8px; }

        /* Loyalty */
        .acct-loyalty-grid { display: grid; grid-template-columns: 1fr 300px; gap: 24px; align-items: start; }
        .acct-pts-card { padding: 28px 32px; }
        .acct-pts-num { font-size: 52px; }

        /* Refer */
        .acct-refer-card { padding: 22px 24px; }
        .acct-refer-heading { font-size: 22px; }
        .acct-refer-hero { padding: 28px 32px; }
        .acct-refer-link-row { display: flex; flex-direction: row; gap: 8px; align-items: center; }
        .acct-copy-email-btn { width: auto; }

        /* Wishlist */
        .acct-wishlist-grid { display: grid; }
        .acct-wishlist-list { display: none; }

        /* ── Mobile overrides ── */
        @media (max-width: 767px) {
          .acct-nav { padding: 0 16px; }
          .acct-nav-desktop-only { display: none; }
          .acct-logo { height: 28px; }
          .acct-signout-btn { padding: 8px 12px; }

          .acct-hero { padding: 24px 16px 20px; }
          .acct-hero-heading { font-size: 22px; }
          .acct-hero-subtitle { font-size: 13px; margin-bottom: 18px; }
          .acct-hero-stats { grid-template-columns: 1fr 1fr; gap: 10px 20px; }
          .acct-hero-stat-label { font-size: 13px; }
          .acct-vials-desktop { display: none; }

          .acct-tabs-desktop { display: none; }
          .acct-tabs-mobile-wrap { display: block; }

          .acct-content { padding: 0 0 32px; }
          .acct-tab-content { padding: 0 16px; }

          .order-card { padding: 16px; }
          .order-total { font-size: 15px; }

          .acct-settings-card { padding: 20px 16px; }
          .acct-row2 { grid-template-columns: 1fr; }
          .acct-row3 { grid-template-columns: 1fr 1fr; }
          .acct-zip-span { grid-column: 1 / -1; }
          .acct-form-actions { flex-direction: column; align-items: stretch; }

          .acct-loyalty-grid { grid-template-columns: 1fr; }
          .acct-pts-card { padding: 20px 18px; }
          .acct-pts-num { font-size: 40px; }

          .acct-refer-card { padding: 18px 16px; }
          .acct-refer-heading { font-size: 18px; }
          .acct-refer-hero { padding: 20px 18px; }
          .acct-refer-link-row { flex-direction: column; align-items: stretch; }
          .acct-copy-email-btn { width: 100%; }

          .acct-wishlist-grid { display: none; }
          .acct-wishlist-list { display: flex; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: "'Poppins', sans-serif" }}>

        {/* ── Top nav bar ── */}
        <div style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 50 }}>
          <div className="acct-nav" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <img src={LOGO} alt="EVO Labs Research" className="acct-logo" style={{ filter: 'brightness(0) invert(1)', display: 'block' }} />
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="acct-nav-desktop-only" style={{ alignItems: 'center', gap: 16 }}>
                <Link href="/products" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                >
                  Shop →
                </Link>
                <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{displayIdentifier}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="acct-signout-btn"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: 12, borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s', minHeight: 36 }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* ── Hero header ── */}
        <div className="acct-hero" style={{
          position: 'relative',
          background: 'linear-gradient(160deg, #071a12 0%, #0a0a0a 55%, #0d1a0f 100%)',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          {/* Grid texture */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(74,222,128,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }} />
          {/* Radial glow */}
          <div style={{
            position: 'absolute', top: -80, left: -80,
            width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(27,77,62,0.35) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Right glow — desktop only */}
          <div className="acct-vials-desktop" style={{
            position: 'absolute', bottom: -60, right: '15%',
            width: 300, height: 300,
            background: 'radial-gradient(circle, rgba(74,222,128,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Floating vials — desktop only */}
          <div className="acct-vials-desktop">
            {FLOATING_VIALS.map((v, i) => (
              <img
                key={i}
                src={v.src}
                alt=""
                draggable={false}
                style={{
                  position: 'absolute',
                  ...v.style,
                  filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.6))',
                  animation: `${v.anim} ${v.dur} ease-in-out infinite`,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              />
            ))}
          </div>

          <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            {/* Eyebrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Researcher Portal
              </span>
            </div>

            <h1 className="acct-hero-heading" style={{ fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 6, lineHeight: 1.1 }}>
              {firstName ? `Welcome back, ${firstName}` : 'Welcome back, Researcher'}
              <span style={{ color: '#4ade80' }}>.</span>
            </h1>
            <p className="acct-hero-subtitle" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Manage your orders, track shipments, and access your research account.
            </p>

            {/* Stats row — 2 col on mobile, 4 col on desktop */}
            <div className="acct-hero-stats" style={{ display: 'grid', justifyContent: 'start' }}>
              {[
                { label: '99%+', sub: 'Purity guaranteed' },
                { label: '3rd Party', sub: 'Lab tested' },
                { label: '48+', sub: 'Compounds' },
                { label: 'Same Day', sub: 'Fulfillment' },
              ].map(s => (
                <div key={s.label}>
                  <div className="acct-hero-stat-label" style={{ fontWeight: 800, color: '#fff' }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="acct-content" style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* ── Desktop tab bar ── */}
          <div className="acct-tabs-desktop" style={{ gap: 2, marginBottom: 32, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {TABS.map(t => (
              <button
                key={t.id}
                className="tab-btn"
                onClick={() => setTab(t.id)}
                style={{
                  color: tab === t.id ? '#4ade80' : 'rgba(255,255,255,0.35)',
                  fontSize: 13, fontWeight: 600,
                  padding: '12px 18px',
                  borderBottom: tab === t.id ? '2px solid #4ade80' : '2px solid transparent',
                  marginBottom: -1,
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
            {!session.user.isPartner && (
              <Link
                href="/account/partner"
                style={{
                  marginLeft: 'auto', alignSelf: 'center',
                  fontSize: 12, color: '#4ade80', textDecoration: 'none',
                  padding: '8px 14px',
                  border: '1px solid rgba(74,222,128,0.25)',
                  borderRadius: 8,
                  background: 'rgba(74,222,128,0.05)',
                  transition: 'all 0.2s',
                  fontWeight: 600,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.1)'; e.currentTarget.style.borderColor = 'rgba(74,222,128,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.05)'; e.currentTarget.style.borderColor = 'rgba(74,222,128,0.25)'; }}
              >
                + Become a Partner
              </Link>
            )}
          </div>

          {/* ── Mobile tab bar (horizontal scroll) ── */}
          <div className="acct-tabs-mobile-wrap" style={{ marginBottom: 20 }}>
            <div
              className="acct-tab-bar"
              style={{
                display: 'flex',
                overflowX: 'auto',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                paddingLeft: 16,
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {TABS.map(t => (
                <button
                  key={t.id}
                  className="tab-btn"
                  onClick={() => setTab(t.id)}
                  style={{
                    color: tab === t.id ? '#4ade80' : 'rgba(255,255,255,0.4)',
                    fontSize: 13, fontWeight: 600,
                    padding: '0 14px',
                    height: 48,
                    borderBottom: tab === t.id ? '2px solid #4ade80' : '2px solid transparent',
                    marginBottom: -1,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
              {!session.user.isPartner && (
                <Link
                  href="/account/partner"
                  style={{
                    marginLeft: 8, alignSelf: 'center', flexShrink: 0,
                    fontSize: 12, color: '#4ade80', textDecoration: 'none',
                    padding: '8px 12px',
                    border: '1px solid rgba(74,222,128,0.25)',
                    borderRadius: 8,
                    background: 'rgba(74,222,128,0.05)',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    marginRight: 16,
                  }}
                >
                  + Partner
                </Link>
              )}
            </div>
          </div>

          {/* Tab content — padded on mobile */}
          <div className="acct-tab-content">

            {/* ── Orders tab ── */}
            {tab === 'orders' && (
              <div>
                {loading ? (
                  <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 14, padding: '48px 0', textAlign: 'center' }}>
                    <div style={{ fontSize: 28, marginBottom: 12 }}>🔬</div>
                    Loading orders…
                  </div>
                ) : orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '64px 0' }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%',
                      background: 'rgba(74,222,128,0.08)',
                      border: '1px solid rgba(74,222,128,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 20px', fontSize: 28,
                    }}>📭</div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
                      No orders yet
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
                      Orders placed with this account will appear here.
                    </p>
                    <Link
                      href="/products"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        marginTop: 20,
                        background: 'linear-gradient(135deg, #1B4D3E, #2d7a5e)',
                        color: '#fff', padding: '12px 24px',
                        borderRadius: 10, fontSize: 13, textDecoration: 'none',
                        fontWeight: 700, boxShadow: '0 4px 20px rgba(27,77,62,0.4)',
                        minHeight: 48,
                      }}
                    >
                      Browse Research Compounds →
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {orders.map(order => (
                      <div
                        key={order.id}
                        className="order-card"
                        style={{
                          background: 'rgba(255,255,255,0.025)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: 16,
                          transition: 'border-color 0.2s, background 0.2s',
                        }}
                      >
                        {/* Order header */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                              <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Order #{order.number}</span>
                              <StatusBadge status={order.status} />
                            </div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                              {new Date(order.dateCreated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>
                          <span className="order-total" style={{ fontWeight: 800, color: '#fff', flexShrink: 0 }}>${order.total}</span>
                        </div>

                        {/* Line items */}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                          {order.lineItems.map(item => (
                            <div key={item.id} style={{
                              fontSize: 11, color: 'rgba(255,255,255,0.45)',
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              padding: '4px 10px', borderRadius: 6,
                            }}>
                              {item.quantity}× {item.name}
                            </div>
                          ))}
                        </div>

                        {/* Tracking */}
                        {order.tracking?.trackingNumber ? (
                          <Link
                            href={`/account/tracking/${order.tracking.trackingNumber}?carrier=${order.tracking.carrier || 'usps'}`}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 8,
                              fontSize: 12, color: '#4ade80', textDecoration: 'none',
                              fontWeight: 600, padding: '10px 16px',
                              background: 'rgba(74,222,128,0.07)',
                              borderRadius: 8, border: '1px solid rgba(74,222,128,0.2)',
                              transition: 'background 0.2s',
                              minHeight: 44,
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,222,128,0.14)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(74,222,128,0.07)'}
                          >
                            🗺️ Track — {order.tracking.trackingNumber}
                          </Link>
                        ) : (
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Tracking not yet available</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Loyalty tab ── */}
            {tab === 'loyalty' && !loading && <LoyaltyTab orders={orders} />}

            {/* ── Refer tab ── */}
            {tab === 'refer' && <ReferTab email={session?.user?.email} />}

            {/* ── Wishlist tab ── */}
            {tab === 'wishlist' && <WishlistTab />}

            {/* ── Settings tab ── */}
            {tab === 'settings' && (
              <SettingsTab session={session} isPhoneUser={isPhoneUser} displayIdentifier={displayIdentifier} />
            )}

            {/* ── Partner tab ── */}
            {tab === 'partner' && session.user.isPartner && (
              <Link
                href="/account/partner"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  background: 'linear-gradient(135deg, #1B4D3E, #2d7a5e)',
                  color: '#fff', padding: '14px 28px',
                  borderRadius: 12, fontSize: 14, fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 20px rgba(27,77,62,0.4)',
                  minHeight: 48,
                }}
              >
                Open Partner Dashboard →
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(ctx) {
  const { getServerSession } = await import('next-auth/next');
  const { authOptions } = await import('../api/auth/[...nextauth]');
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const isAdmin = ctx.req.cookies?.evo_admin === '1';
  if (!session && !isAdmin) return { redirect: { destination: '/account/login', permanent: false } };
  return { props: {} };
}
