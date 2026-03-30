import { useState } from 'react';
import Layout from '../components/Layout';
import { CONTACT } from '../lib/data';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: 'contact' }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      setSubmitted(true);
    } catch {
      setSubmitError('Failed to send. Please email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout
      title="Contact Us | EVO Labs Research Canada"
      description="Contact EVO Labs Research Canada — support, ordering questions, bulk pricing, or general inquiries. Toronto, ON based research peptide supplier."
    >
      {/* Header */}
      <div style={{ background: '#0a0a0a', padding: '72px 0 60px' }}>
        <div className="container">
          <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
            Get in Touch
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 16 }}>
            Contact EVO Labs
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', maxWidth: 440 }}>
            Questions about an order, COA, compound availability, or bulk pricing? We're here.
          </p>
        </div>
      </div>

      {/* Contact section */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 72, alignItems: 'start' }} className="contact-layout">

            {/* Left: contact info cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                {
                  icon: '✉️',
                  title: 'Email Support',
                  primary: CONTACT.email,
                  secondary: 'Response within 24 hours',
                  href: `mailto:${CONTACT.email}`,
                  bg: '#f0fdf4',
                  accent: '#1B4D3E',
                },
                {
                  icon: '📞',
                  title: 'Phone',
                  primary: CONTACT.phone,
                  secondary: CONTACT.hours,
                  href: 'tel:+16475550199',
                  bg: '#eff6ff',
                  accent: '#1d4ed8',
                },
                {
                  icon: '📍',
                  title: 'Our Location',
                  primary: CONTACT.address,
                  secondary: `${CONTACT.city}, ${CONTACT.country}`,
                  href: `https://maps.google.com/?q=${encodeURIComponent(CONTACT.address + ', ' + CONTACT.city)}`,
                  bg: '#fdf4ff',
                  accent: '#7c3aed',
                },
                {
                  icon: '📦',
                  title: 'Track Your Order',
                  primary: 'Order Tracking',
                  secondary: 'Check your shipment status',
                  href: '/track',
                  bg: '#fff7ed',
                  accent: '#c2410c',
                },
              ].map(item => (
                <a
                  key={item.title}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  style={{
                    background: item.bg, borderRadius: 20, padding: '24px 24px',
                    border: '1px solid rgba(0,0,0,0.04)', display: 'flex', gap: 18, alignItems: 'flex-start',
                    transition: 'transform 0.2s, box-shadow 0.2s', textDecoration: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ fontSize: 24, lineHeight: 1, marginTop: 2 }}>{item.icon}</div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{item.title}</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 3 }}>{item.primary}</p>
                    <p style={{ fontSize: 12, color: '#6b7280' }}>{item.secondary}</p>
                  </div>
                  <span style={{ marginLeft: 'auto', color: item.accent, fontSize: 18, opacity: 0.6 }}>→</span>
                </a>
              ))}
            </div>

            {/* Right: contact form */}
            <div>
              {submitted ? (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 24, padding: '56px 40px', textAlign: 'center' }}>
                  <div style={{ fontSize: 56, marginBottom: 20 }}>✓</div>
                  <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0a0a0a', marginBottom: 12 }}>Message Received!</h2>
                  <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, maxWidth: 360, margin: '0 auto 28px' }}>
                    Thanks for reaching out. Our team will get back to you within 24 hours.
                  </p>
                  <button onClick={() => setSubmitted(false)} className="btn-green">Send Another Message</button>
                </div>
              ) : (
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 24, padding: '48px 40px', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                  <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0a0a0a', marginBottom: 8 }}>Send a Message</h2>
                  <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 32 }}>We typically respond within one business day.</p>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Full Name *</label>
                        <input
                          required
                          className="input"
                          placeholder="Dr. Jane Smith"
                          value={form.name}
                          onChange={e => setForm({...form, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Email *</label>
                        <input
                          required type="email"
                          className="input"
                          placeholder="you@institution.edu"
                          value={form.email}
                          onChange={e => setForm({...form, email: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Subject *</label>
                      <select
                        required
                        className="input"
                        value={form.subject}
                        onChange={e => setForm({...form, subject: e.target.value})}
                        style={{ cursor: 'pointer' }}
                      >
                        <option value="">Select a topic...</option>
                        <option>Order Support</option>
                        <option>Product / COA Question</option>
                        <option>Bulk / Institutional Pricing</option>
                        <option>Returns & Refunds</option>
                        <option>General Inquiry</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Message *</label>
                      <textarea
                        required
                        className="input"
                        placeholder="Tell us how we can help..."
                        rows={6}
                        value={form.message}
                        onChange={e => setForm({...form, message: e.target.value})}
                        style={{ resize: 'vertical', lineHeight: 1.6 }}
                      />
                    </div>

                    <div>
                      {submitError && (
                        <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 10 }}>{submitError}</p>
                      )}
                      <button type="submit" disabled={submitting} className="btn-green" style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '15px 24px', opacity: submitting ? 0.7 : 1 }}>
                        {submitting ? 'Sending…' : 'Send Message →'}
                      </button>
                      <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 12 }}>
                        Or email us directly at <a href={`mailto:${CONTACT.email}`} style={{ color: '#1B4D3E', fontWeight: 600 }}>{CONTACT.email}</a>
                      </p>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section style={{ background: '#fef9c3', padding: '32px 0', borderTop: '1px solid #fef08a' }}>
        <div className="container" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
          <p style={{ fontSize: 13, color: '#713f12', lineHeight: 1.7 }}>
            <strong>Research Use Only:</strong> EVO Labs Research Canada products are strictly for in vitro research and laboratory use. Not for human consumption, medical treatment, or veterinary use. All inquiries should be from verified researchers or licensed institutions. We reserve the right to decline orders at our discretion.
          </p>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .contact-layout { grid-template-columns: 1fr !important; gap: 36px !important; }
        }
      `}</style>
    </Layout>
  );
}
