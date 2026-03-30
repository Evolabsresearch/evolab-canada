import { useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { CONTACT } from '../lib/data';

const STEPS = [
  { num: '01', title: 'Apply', desc: 'Submit your application with research credentials. We review every applicant to ensure RUO compliance.', icon: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  )},
  { num: '02', title: 'Get Approved', desc: 'Approved partners receive a unique referral code, marketing guidelines, and access to the partner dashboard.', icon: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  )},
  { num: '03', title: 'Refer & Earn', desc: 'Share your code with qualified researchers. Earn commission on every verified research purchase.', icon: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  )},
  { num: '04', title: 'Get Paid', desc: 'Monthly payouts via PayPal or bank transfer. No minimum threshold. Full transparency in your dashboard.', icon: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
  )},
];

const BENEFITS = [
  { title: '20% First Order', desc: 'Earn 20% commission on every new customer\'s first research purchase through your referral code.', accent: '#1B4D3E' },
  { title: '10% Lifetime Recurring', desc: 'Continue earning 10% on all subsequent orders from your referrals — for life. No cap, no expiration.', accent: '#1B4D3E' },
  { title: '99%+ Verified Purity', desc: 'Promote with confidence. Every product is third-party tested with publicly accessible COAs for full transparency.', accent: '#14532D' },
  { title: '30-Day Cookie Window', desc: 'Your referrals are tracked for 30 days. If they purchase within that window, you earn the commission.', accent: '#1E3A8A' },
  { title: 'RUO-Compliant Marketing', desc: 'We provide approved marketing materials that maintain strict Research Use Only compliance standards.', accent: '#4C1D95' },
  { title: 'Dedicated Partner Support', desc: 'Direct access to our partner team for questions, custom assets, and strategic collaboration.', accent: '#9A3412' },
];

const REQUIREMENTS = [
  'Active presence in scientific research, academic, or laboratory communities',
  'Commitment to Research Use Only (RUO) compliance in all promotional materials',
  'No medical claims, dosing advice, or human consumption language — ever',
  'Minimum audience of 500+ in relevant research or science channels',
  'Agreement to EVO Labs Partner Code of Conduct and Terms',
  'Willingness to use only approved marketing language and disclaimers',
];

const PARTNER_FAQS = [
  { q: 'What commission do partners earn?', a: '20% on every new customer\'s first order and 10% on all recurring orders from that customer — for life. There is no earnings cap and no time limit on recurring commissions.' },
  { q: 'How and when do I get paid?', a: 'Commissions are paid monthly via PayPal or direct bank transfer (Canadian partners). There is no minimum payout threshold. You\'ll receive a detailed earnings report with each payment.' },
  { q: 'Who can apply to the partner program?', a: 'We accept researchers, laboratory professionals, science educators, academic institutions, research-focused content creators, and organizations in the life sciences space. All applicants must demonstrate commitment to RUO compliance.' },
  { q: 'What is RUO compliance and why does it matter?', a: 'Research Use Only (RUO) means our products are sold exclusively for in-vitro research and laboratory use — not for human consumption, medical treatment, or veterinary use. Partners must never make health claims, suggest dosing, or imply personal use in any promotional content.' },
  { q: 'Can I use my own referral code for personal orders?', a: 'No. Self-referral is not permitted. Partner codes are strictly for referring other qualified researchers. Violations will result in account termination.' },
  { q: 'What marketing materials are provided?', a: 'Approved partners receive RUO-compliant banners, product images, approved copy templates, and access to our brand asset library. All materials include required disclaimers and comply with advertising regulations.' },
  { q: 'How are referrals tracked?', a: 'Each partner receives a unique referral code and tracking link. A 30-day cookie tracks referral attribution. You can monitor clicks, conversions, and earnings in real-time through your partner dashboard.' },
  { q: 'What will get my partner account terminated?', a: 'Making health claims, suggesting human consumption or dosing, using unapproved marketing language, self-referral fraud, or any promotion that violates RUO compliance. We take compliance seriously to protect the research community.' },
];

function PartnerApplicationForm() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', organization: '', role: '', website: '', audience: '', channels: '', address: '', city: '', state: '', zip: '', reason: '', agree: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'partner_application', ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h3 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Application Received</h3>
        <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 400, margin: '0 auto' }}>
          Thank you for applying. Our partner team will review your application and respond within 2–3 business days at the email you provided.
        </p>
      </div>
    );
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    border: '1.5px solid #e5e7eb', fontSize: 14, color: '#111827',
    background: '#fff', outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const labelStyle = {
    fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block',
    fontFamily: "'Poppins', sans-serif",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="form-grid">
        <div>
          <label style={labelStyle}>Full Name *</label>
          <input name="name" value={form.name} onChange={handleChange} required style={inputStyle} placeholder="Dr. Jane Smith"
            onFocus={e => { e.target.style.borderColor = '#1B4D3E'; e.target.style.boxShadow = '0 0 0 3px rgba(27,77,62,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        <div>
          <label style={labelStyle}>Email Address *</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required style={inputStyle} placeholder="jane@university.edu"
            onFocus={e => { e.target.style.borderColor = '#1B4D3E'; e.target.style.boxShadow = '0 0 0 3px rgba(27,77,62,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Phone Number *</label>
        <input name="phone" type="tel" value={form.phone} onChange={handleChange} required style={inputStyle} placeholder="(555) 123-4567"
          onFocus={e => { e.target.style.borderColor = '#1B4D3E'; e.target.style.boxShadow = '0 0 0 3px rgba(27,77,62,0.08)'; }}
          onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="form-grid">
        <div>
          <label style={labelStyle}>Organization / Institution *</label>
          <input name="organization" value={form.organization} onChange={handleChange} required style={inputStyle} placeholder="University of Toronto, Research Lab Inc."
            onFocus={e => { e.target.style.borderColor = '#1B4D3E'; e.target.style.boxShadow = '0 0 0 3px rgba(27,77,62,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        <div>
          <label style={labelStyle}>Your Role *</label>
          <select name="role" value={form.role} onChange={handleChange} required style={{ ...inputStyle, cursor: 'pointer' }}
            onFocus={e => { e.target.style.borderColor = '#1B4D3E'; e.target.style.boxShadow = '0 0 0 3px rgba(27,77,62,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
          >
            <option value="">Select your role...</option>
            <option value="researcher">Research Scientist</option>
            <option value="academic">Academic / Professor</option>
            <option value="lab_director">Laboratory Director</option>
            <option value="phd_student">PhD Student / Postdoc</option>
            <option value="content_creator">Science Content Creator</option>
            <option value="institution">Research Institution</option>
            <option value="distributor">Authorized Distributor</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div>
        <label style={labelStyle}>Website or Social Media URL *</label>
        <input name="website" value={form.website} onChange={handleChange} required style={inputStyle} placeholder="https://yourlab.edu or @handle"
          onFocus={e => { e.target.style.borderColor = '#1B4D3E'; e.target.style.boxShadow = '0 0 0 3px rgba(27,77,62,0.08)'; }}
          onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
        />
      </div>
      {/* Shipping Address */}
      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 20, marginTop: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 14, fontFamily: "'Poppins', sans-serif" }}>Shipping Address</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>Street Address *</label>
            <input name="address" value={form.address} onChange={handleChange} required style={inputStyle} placeholder="123 Research Blvd, Suite 100"
              onFocus={e => { e.target.style.borderColor = '#1B4D3E'; e.target.style.boxShadow = '0 0 0 3px rgba(27,77,62,0.08)'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }} className="address-grid">
            <div>
              <label style={labelStyle}>City *</label>
              <input name="city" value={form.city} onChange={handleChange} required style={inputStyle} placeholder="Toronto"
                onFocus={e => { e.target.style.borderColor = '#1B4D3E'; e.target.style.boxShadow = '0 0 0 3px rgba(27,77,62,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label style={labelStyle}>State *</label>
              <input name="state" value={form.state} onChange={handleChange} required style={inputStyle} placeholder="FL"
                onFocus={e => { e.target.style.borderColor = '#1B4D3E'; e.target.style.boxShadow = '0 0 0 3px rgba(27,77,62,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label style={labelStyle}>ZIP *</label>
              <input name="zip" value={form.zip} onChange={handleChange} required style={inputStyle} placeholder="33614"
                onFocus={e => { e.target.style.borderColor = '#1B4D3E'; e.target.style.boxShadow = '0 0 0 3px rgba(27,77,62,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="form-grid">
        <div>
          <label style={labelStyle}>Audience Size (approx.)</label>
          <select name="audience" value={form.audience} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}
            onFocus={e => { e.target.style.borderColor = '#1B4D3E'; e.target.style.boxShadow = '0 0 0 3px rgba(27,77,62,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
          >
            <option value="">Select range...</option>
            <option value="500-1000">500 – 1,000</option>
            <option value="1000-5000">1,000 – 5,000</option>
            <option value="5000-25000">5,000 – 25,000</option>
            <option value="25000-100000">25,000 – 100,000</option>
            <option value="100000+">100,000+</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Primary Channels</label>
          <input name="channels" value={form.channels} onChange={handleChange} style={inputStyle} placeholder="YouTube, Twitter, Blog, Lab Network"
            onFocus={e => { e.target.style.borderColor = '#1B4D3E'; e.target.style.boxShadow = '0 0 0 3px rgba(27,77,62,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Why do you want to partner with EVO Labs? *</label>
        <textarea name="reason" value={form.reason} onChange={handleChange} required rows={4} style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }} placeholder="Tell us about your research focus, audience, and how you'd promote EVO Labs products in an RUO-compliant manner..."
          onFocus={e => { e.target.style.borderColor = '#1B4D3E'; e.target.style.boxShadow = '0 0 0 3px rgba(27,77,62,0.08)'; }}
          onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
        />
      </div>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
        <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} required style={{ marginTop: 3, width: 18, height: 18, accentColor: '#1B4D3E' }} />
        <span style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
          I confirm that I will adhere to EVO Labs' Research Use Only (RUO) compliance standards. I understand that all promotional content must include required disclaimers and must never suggest human consumption, medical use, or provide dosing guidance. Violations will result in immediate account termination. *
        </span>
      </label>
      {submitError && (
        <p style={{ color: '#ef4444', fontSize: 13, textAlign: 'center' }}>{submitError}</p>
      )}
      <button type="submit" disabled={submitting} className="btn-green" style={{ width: '100%', justifyContent: 'center', padding: '15px 32px', fontSize: 16, opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
        {submitting ? 'Submitting…' : 'Submit Partner Application →'}
      </button>
    </form>
  );
}

export default function PartnersPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <Layout title="Research Partners Program | EVO Labs Research Canada" description="Partner with EVO Labs Research Canada. Earn 20% first-order and 10% lifetime recurring commission promoting 99%+ purity research peptides. Strict RUO compliance required.">

      {/* ── Hero ── */}
      <section style={{ background: '#0a0a0a', padding: '80px 0 72px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(27,77,62,0.15) 0%, transparent 60%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 64, alignItems: 'center' }} className="hero-grid">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 9999, padding: '6px 16px', marginBottom: 24 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#4ade80', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: "'Poppins', sans-serif" }}>Partner Program</span>
              </div>
              <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20 }}>
                Partner with<br />
                <span style={{ color: '#4ade80' }}>Premium Research</span><br />
                Peptides
              </h1>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 460, marginBottom: 36 }}>
                Join the EVO Labs Research Canada Partner Program. Earn industry-leading commissions while promoting the highest quality research compounds — with strict RUO compliance standards that protect you and the research community.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
                <a href="#apply" className="btn-green" style={{ fontSize: 16, padding: '15px 36px' }}>
                  Apply Now →
                </a>
                <a href="#how-it-works" className="btn-secondary" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
                  Learn More
                </a>
              </div>
              {/* Key stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 28 }} className="stats-grid">
                {[
                  { value: '20%', label: 'First Order' },
                  { value: '10%', label: 'Recurring' },
                  { value: '30', label: 'Day Cookie' },
                  { value: 'CAD$0', label: 'Min. Payout' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500, fontFamily: "'Poppins', sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Right side — earnings preview */}
            <div className="hide-mobile" style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 32, maxWidth: 360, width: '100%' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20, fontFamily: "'Poppins', sans-serif" }}>Earnings Example</div>
                {[
                  { label: '10 new referrals/mo', calc: '10 × CAD$250 avg × 20%', result: 'CAD$500' },
                  { label: '40 recurring orders', calc: '40 × CAD$150 avg × 10%', result: 'CAD$600' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{r.label}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: "'Poppins', sans-serif" }}>{r.calc}</div>
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#4ade80', fontFamily: "'Poppins', sans-serif" }}>{r.result}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, marginTop: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Estimated Monthly</span>
                  <span style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>CAD$1,100</span>
                </div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 16, lineHeight: 1.5, fontFamily: "'Poppins', sans-serif" }}>
                  Example only. Actual earnings vary based on referral volume, order size, and retention.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RUO Compliance Banner ── */}
      <section style={{ background: '#fefce8', borderBottom: '1px solid #fde68a', padding: '20px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#92400E' }}>Strict RUO Compliance Required</p>
            <p style={{ fontSize: 13, color: '#A16207', lineHeight: 1.5 }}>
              All EVO Labs Research Canada partners must promote products exclusively as Research Use Only compounds. Making health claims, suggesting human consumption, or providing dosing guidance is prohibited and will result in immediate termination.
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1B4D3E', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, display: 'block', fontFamily: "'Poppins', sans-serif" }}>How It Works</span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em' }}>Four Steps to Earning</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }} className="steps-grid">
            {STEPS.map(s => (
              <div key={s.num} style={{
                background: '#fafafa', borderRadius: 20, padding: '32px 24px',
                border: '1px solid #f0f0f0', position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: '#E8F5EE', color: '#1B4D3E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {s.icon}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', fontFamily: "'Poppins', sans-serif" }}>{s.num}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="section" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1B4D3E', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, display: 'block', fontFamily: "'Poppins', sans-serif" }}>Partner Benefits</span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em' }}>Why Research Partners Choose EVO Labs</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="benefits-grid">
            {BENEFITS.map(b => (
              <div key={b.title} style={{
                background: '#fff', borderRadius: 20, padding: '28px 24px',
                border: '1px solid #e5e7eb',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ width: 4, height: 24, borderRadius: 4, background: b.accent, marginBottom: 16 }} />
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111827', marginBottom: 8 }}>{b.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Requirements ── */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1B4D3E', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, display: 'block', fontFamily: "'Poppins', sans-serif" }}>Requirements</span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: 12 }}>Partner Eligibility Standards</h2>
            <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 500, margin: '0 auto' }}>
              We maintain high standards to protect our partners, customers, and the integrity of research commerce.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {REQUIREMENTS.map((req, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: '#fafafa', borderRadius: 14, padding: '16px 20px', border: '1px solid #f0f0f0' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.55 }}>{req}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Application Form ── */}
      <section id="apply" className="section" style={{ background: '#f8fafc' }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1B4D3E', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, display: 'block', fontFamily: "'Poppins', sans-serif" }}>Apply</span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em', marginBottom: 12 }}>Partner Application</h2>
            <p style={{ fontSize: 15, color: '#6b7280' }}>
              Applications are reviewed within 2–3 business days. Approval is not guaranteed.
            </p>
          </div>
          <div style={{ background: '#fff', borderRadius: 24, padding: 'clamp(24px, 4vw, 40px)', border: '1px solid #e5e7eb', boxShadow: '0 4px 24px rgba(0,0,0,0.03)' }}>
            <PartnerApplicationForm />
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1B4D3E', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, display: 'block', fontFamily: "'Poppins', sans-serif" }}>FAQ</span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.02em' }}>Partner Program Questions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {PARTNER_FAQS.map((faq, i) => (
              <div key={i} className="faq-item" style={{ borderBottom: '1px solid #f0f0f0' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#111827', paddingRight: 24 }}>{faq.q}</span>
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%', background: '#f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    transition: 'transform 0.2s, background 0.2s',
                    transform: openFaq === i ? 'rotate(45deg)' : 'none',
                    ...(openFaq === i ? { background: '#1B4D3E', color: '#fff' } : { color: '#6b7280' }),
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </span>
                </button>
                {openFaq === i && (
                  <div style={{ paddingBottom: 20, fontSize: 14, color: '#6b7280', lineHeight: 1.7, animation: 'fadeUp 0.2s ease' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section style={{ background: '#0a0a0a', padding: '64px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#fff', marginBottom: 16, letterSpacing: '-0.02em' }}>
            Ready to Partner with EVO Labs?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Join a growing network of research professionals earning commission while maintaining the highest compliance standards.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#apply" className="btn-green" style={{ fontSize: 16, padding: '15px 36px' }}>
              Apply Now →
            </a>
            <a href={`mailto:${CONTACT.email}?subject=Partner Program Inquiry`} className="btn-secondary" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .steps-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .benefits-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 20px !important; }
        }
        @media (max-width: 600px) {
          .steps-grid { grid-template-columns: 1fr !important; }
          .benefits-grid { grid-template-columns: 1fr !important; }
          .form-grid { grid-template-columns: 1fr !important; }
          .address-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  );
}

export async function getServerSideProps(ctx) {
  const { getServerSession } = await import('next-auth/next');
  const { authOptions } = await import('./api/auth/[...nextauth]');
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const isAdmin = ctx.req.cookies?.evo_admin === '1';
  if (!session && !isAdmin) return { redirect: { destination: '/account/login', permanent: false } };
  return { props: {} };
}
