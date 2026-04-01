import Layout from '../components/Layout';
import Link from 'next/link';

const UPDATED = 'March 1, 2026';

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 12 }}>{title}</h2>
      <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.8 }}>{children}</div>
    </section>
  );
}

export default function PrivacyPolicy() {
  return (
    <Layout title="Privacy Policy | EVO Labs Research Canada" description="EVO Labs Research Canada privacy policy — how we collect, use, and protect your information under PIPEDA.">
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '60px 24px 80px', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ marginBottom: 40 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Legal</span>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#111', margin: '8px 0 12px', letterSpacing: '-0.02em' }}>Privacy Policy</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Last updated: {UPDATED} · EVO Labs Research Canada, Toronto, ON M5X 1C9</p>
          <div style={{ height: 1, background: '#e5e7eb', marginTop: 24 }} />
        </div>

        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '14px 18px', marginBottom: 32, fontSize: 14, color: '#1e40af' }}>
          This Privacy Policy is designed to comply with the <strong>Personal Information Protection and Electronic Documents Act (PIPEDA)</strong> and applicable provincial privacy legislation, including Quebec's <strong>Law 25 (Bill 64)</strong>.
        </div>

        <Section title="1. Information We Collect">
          <p>We collect the following types of information when you use our site or make a purchase:</p>
          <ul style={{ paddingLeft: 20, marginTop: 10 }}>
            <li><strong>Account Information:</strong> Name, email address, password (hashed), and profile preferences when you create an account.</li>
            <li><strong>Order Information:</strong> Shipping address, billing address, payment method type (not card numbers), and order history.</li>
            <li><strong>Usage Data:</strong> Pages visited, time on site, referring URLs, browser type, and device information (collected automatically).</li>
            <li><strong>Communications:</strong> Emails, support messages, and newsletter subscriptions.</li>
            <li><strong>Affiliate/Partner Data:</strong> Referral codes, clicks, conversions, and commission tracking if you participate in our affiliate program.</li>
          </ul>
        </Section>

        <Section title="2. Consent">
          <p>In accordance with PIPEDA, we obtain your consent before collecting, using, or disclosing your personal information. By using our website or making a purchase, you consent to the collection and use of your information as described in this policy. You may withdraw your consent at any time by contacting us, subject to legal or contractual restrictions.</p>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul style={{ paddingLeft: 20 }}>
            <li>To process and fulfill your orders</li>
            <li>To send order confirmation, shipping, and tracking notifications</li>
            <li>To manage your account and provide customer support</li>
            <li>To send newsletters and promotional emails (opt-out available at any time via CASL-compliant unsubscribe)</li>
            <li>To improve our website, products, and services</li>
            <li>To detect fraud and ensure security</li>
            <li>To comply with legal obligations under Canadian law</li>
            <li>To track affiliate referrals and calculate commissions</li>
          </ul>
        </Section>

        <Section title="4. Payment Processing">
          <p>EVO Labs Research Canada does not directly collect or store credit/debit card information. All payment processing is handled by PCI-compliant third-party processors. We accept Interac e-Transfer, cryptocurrency, credit/debit cards, and other payment methods. Payment method details you provide are used solely to process your payment.</p>
        </Section>

        <Section title="5. Data Sharing">
          <p>We do not sell, rent, or trade your personal information. We may share data with:</p>
          <ul style={{ paddingLeft: 20, marginTop: 10 }}>
            <li><strong>Shipping providers</strong> (Canada Post, Purolator) — for order fulfillment within Canada</li>
            <li><strong>Email service providers</strong> — for transactional and marketing emails (CASL-compliant)</li>
            <li><strong>Analytics providers</strong> — for site improvement (anonymized data)</li>
            <li><strong>Legal authorities</strong> — when required by Canadian law</li>
          </ul>
          <p style={{ marginTop: 10 }}>Your personal information is stored and processed within Canada wherever possible. If any data is transferred outside of Canada, we ensure adequate protections are in place in accordance with PIPEDA.</p>
        </Section>

        <Section title="6. Cookies & Tracking">
          <p>We use cookies and similar technologies for:</p>
          <ul style={{ paddingLeft: 20, marginTop: 10 }}>
            <li>Keeping you logged in (session cookies)</li>
            <li>Remembering your shopping cart</li>
            <li>Affiliate tracking (30-day referral window via <code>__evo_aff</code> cookie)</li>
            <li>Analytics and performance monitoring</li>
          </ul>
          <p style={{ marginTop: 10 }}>You can disable cookies in your browser settings, though some features may not function correctly.</p>
        </Section>

        <Section title="7. Data Retention">
          <p>We retain your personal data for as long as your account is active or as needed to provide services. Order records are retained for 7 years for legal/tax compliance with CRA requirements. You may request deletion of your account and associated data at any time by contacting us.</p>
        </Section>

        <Section title="8. Your Rights Under PIPEDA">
          <p>Under Canadian privacy law, you have the right to:</p>
          <ul style={{ paddingLeft: 20, marginTop: 10 }}>
            <li>Access the personal information we hold about you</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your data (subject to legal retention requirements)</li>
            <li>Withdraw consent to the collection, use, or disclosure of your personal information</li>
            <li>Opt out of marketing communications</li>
            <li>File a complaint with the Office of the Privacy Commissioner of Canada</li>
          </ul>
          <p style={{ marginTop: 10 }}>To exercise these rights, email <a href="mailto:support@evolabsresearch.ca" style={{ color: '#0F2A4A' }}>support@evolabsresearch.ca</a>. We will respond within 30 days as required by PIPEDA.</p>
        </Section>

        <Section title="9. Children's Privacy">
          <p>EVO Labs Research Canada does not sell to or knowingly collect data from individuals under 18 years of age. Our products are intended for qualified research use only by adults. If you believe a minor has provided us with personal information, please contact us immediately.</p>
        </Section>

        <Section title="10. Security">
          <p>We implement industry-standard security measures including SSL/TLS encryption, hashed passwords, and restricted access to personal data. No method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>We may update this Privacy Policy periodically. Material changes will be communicated via email or prominent notice on the site. Continued use of the site after changes constitutes acceptance of the updated policy.</p>
        </Section>

        <Section title="12. Contact & Privacy Officer">
          <p>For privacy-related questions or requests:<br />
            EVO Labs Research Canada<br />
            100 King Street West, Suite 5600, Toronto, ON M5X 1C9<br />
            Email: <a href="mailto:support@evolabsresearch.ca" style={{ color: '#0F2A4A' }}>support@evolabsresearch.ca</a><br />
            Phone: (647) 555-0199
          </p>
          <p style={{ marginTop: 10 }}>You may also contact the <strong>Office of the Privacy Commissioner of Canada</strong> at <a href="https://www.priv.gc.ca" style={{ color: '#0F2A4A' }} target="_blank" rel="noopener noreferrer">www.priv.gc.ca</a> if you have concerns about our privacy practices.</p>
        </Section>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 24, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {['/terms', '/disclaimer', '/returns', '/research-use'].map(href => (
            <Link key={href} href={href} style={{ fontSize: 13, color: '#6b7280', textDecoration: 'underline' }}>
              {href.replace('/', '').replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
