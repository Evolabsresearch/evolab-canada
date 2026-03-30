import Layout from '../components/Layout';
import Link from 'next/link';

const STEPS = [
  {
    step: '01',
    title: 'Place Your Order',
    body: 'Add products to your cart and complete checkout. You\'ll receive an order confirmation email with your Order ID and the total amount due.',
  },
  {
    step: '02',
    title: 'Send Payment',
    body: 'Use your preferred payment method below. Include your Order ID in the payment note so we can match your payment to your order.',
  },
  {
    step: '03',
    title: 'We Confirm & Ship',
    body: 'Once payment is verified (usually within 1–2 hours on business days), your order moves to processing and ships same day if confirmed before 2pm ET.',
  },
  {
    step: '04',
    title: 'Receive Tracking',
    body: 'You\'ll receive a shipping confirmation email with your tracking number. Use our Track Order page to follow your shipment.',
  },
];

const PAYMENT_METHODS = [
  {
    id: 'zelle',
    name: 'Interac e-Transfer',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    color: '#6d28d9',
    instructions: [
      'Open your bank\'s online banking or mobile app',
      'Send an Interac e-Transfer to: support@evolabsresearch.ca',
      'In the memo/note field, enter your Order ID (e.g. EVO-10042)',
      'Send the exact amount shown in your order confirmation',
    ],
    note: 'Interac e-Transfer is available through most Canadian banks and credit unions. Transfers are typically instant with Autodeposit enabled.',
  },
  {
    id: 'crypto',
    name: 'Cryptocurrency',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    color: '#d97706',
    instructions: [
      'After checkout, email support@evolabsresearch.ca with your Order ID',
      'We will reply with our wallet address for your preferred coin (BTC, ETH, USDC)',
      'Send the CAD equivalent of your order total',
      'Include your Order ID in the transaction memo if your wallet supports it',
    ],
    note: 'We accept Bitcoin (BTC), Ethereum (ETH), and USDC. Orders are held for 30 minutes while awaiting crypto confirmation.',
  },
  {
    id: 'ach',
    name: 'Wire Transfer / EFT',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
      </svg>
    ),
    color: '#0369a1',
    instructions: [
      'Available for orders over $500 CAD — contact us to request bank details',
      'Standard EFT takes 1–3 business days to clear',
      'Include your Order ID as the payment reference',
      'We will hold your order until funds are confirmed',
    ],
    note: 'EFT is available for established wholesale customers and orders over $500 CAD.',
  },
];

export default function PaymentInstructionsPage() {
  return (
    <Layout
      title="Payment Instructions | EVO Labs Research Canada"
      description="How to pay for your EVO Labs Research Canada order — Interac e-Transfer, cryptocurrency, and wire transfer/EFT. Step-by-step payment instructions."
    >
      {/* Header */}
      <div style={{ background: '#0a0a0a', padding: '72px 0 60px' }}>
        <div className="container">
          <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
            How to Pay
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 16 }}>
            Payment Instructions
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', maxWidth: 460, lineHeight: 1.7 }}>
            We accept Interac e-Transfer, cryptocurrency, and wire transfer/EFT. All payments are processed manually — your order ships once payment is confirmed.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <section style={{ background: '#f9fafb', padding: '56px 0' }}>
        <div className="container">
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111827', marginBottom: 32, textAlign: 'center' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, maxWidth: 900, margin: '0 auto' }} className="steps-grid">
            {STEPS.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
                {i < STEPS.length - 1 && (
                  <div style={{ position: 'absolute', top: 22, left: '60%', right: '-40%', height: 1, background: '#e5e7eb', display: 'block' }} className="step-line" />
                )}
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1B4D3E', color: '#fff', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', position: 'relative', zIndex: 1 }}>
                  {s.step}
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111827', marginBottom: 32 }}>Accepted Payment Methods</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {PAYMENT_METHODS.map(m => (
              <div key={m.id} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 20, padding: '28px 32px', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: `${m.color}12`, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {m.icon}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{m.name}</h3>
                </div>
                <ol style={{ margin: '0 0 16px', padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {m.instructions.map((step, i) => (
                    <li key={i} style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{step}</li>
                  ))}
                </ol>
                <div style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 14px', borderLeft: `3px solid ${m.color}` }}>
                  <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>{m.note}</p>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ callout */}
          <div style={{ marginTop: 40, background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 16, padding: '24px 28px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#14532d', marginBottom: 8 }}>Questions about your payment?</h3>
            <p style={{ fontSize: 14, color: '#166534', lineHeight: 1.7, marginBottom: 16 }}>
              Email us at <strong>support@evolabsresearch.ca</strong> with your Order ID and we'll resolve it within a few hours on business days.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/contact" style={{ background: '#1B4D3E', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                Contact Us
              </Link>
              <Link href="/track" style={{ background: 'transparent', color: '#1B4D3E', padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1.5px solid #1B4D3E' }}>
                Track Order
              </Link>
              <Link href="/faq" style={{ background: 'transparent', color: '#1B4D3E', padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1.5px solid #1B4D3E' }}>
                View FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 640px) {
          .steps-grid { grid-template-columns: 1fr 1fr !important; }
          .step-line { display: none !important; }
        }
        @media (max-width: 400px) {
          .steps-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  );
}
