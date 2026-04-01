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

export default function TermsOfService() {
  return (
    <Layout title="Terms of Service | EVO Labs Research Canada" description="EVO Labs Research Canada terms of service — rules governing use of our site and purchase of research compounds.">
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '60px 24px 80px', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ marginBottom: 40 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Legal</span>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#111', margin: '8px 0 12px', letterSpacing: '-0.02em' }}>Terms of Service</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Last updated: {UPDATED} · EVO Labs Research Canada, Toronto, ON M5X 1C9</p>
          <div style={{ height: 1, background: '#e5e7eb', marginTop: 24 }} />
        </div>

        <div style={{ background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: 8, padding: '14px 18px', marginBottom: 32, fontSize: 14, color: '#92400e' }}>
          <strong>IMPORTANT:</strong> All products sold by EVO Labs Research Canada are strictly for Research Use Only (RUO). They are not intended for human or animal consumption, medical treatment, or any use outside of a research laboratory setting. By purchasing, you confirm you are a qualified researcher aged 18+ who understands and agrees to this restriction.
        </div>

        <Section title="1. Acceptance of Terms">
          <p>By accessing this website or placing an order, you agree to be bound by these Terms of Service, our Privacy Policy, and our Research Use Only Policy. If you do not agree, do not use this site or purchase our products.</p>
        </Section>

        <Section title="2. Eligibility">
          <p>You must be at least 18 years of age to purchase from EVO Labs Research Canada. By purchasing, you represent and warrant that:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>You are at least 18 years old</li>
            <li>You are a qualified researcher, scientist, or work in a laboratory/research capacity</li>
            <li>You understand these products are for research use only</li>
            <li>You will not use these products for human or animal consumption</li>
            <li>Purchasing these products is legal in your jurisdiction within Canada</li>
          </ul>
        </Section>

        <Section title="3. Research Use Only">
          <p>All products are sold for research purposes only and have not been approved by Health Canada for human consumption. EVO Labs Research Canada makes no medical claims and does not provide medical advice. These products have not been evaluated by Health Canada for use in humans. EVO Labs Research Canada is not responsible for any misuse of its products.</p>
        </Section>

        <Section title="4. Orders and Payment">
          <ul style={{ paddingLeft: 20 }}>
            <li>All prices are in Canadian Dollars (CAD). We reserve the right to change pricing at any time.</li>
            <li>Payment is required at the time of order. We accept Interac e-Transfer, cryptocurrency, credit/debit cards, and other accepted payment methods.</li>
            <li>All applicable taxes (GST/HST and provincial taxes) will be calculated at checkout.</li>
            <li>We reserve the right to cancel any order for any reason, including suspected fraud or policy violations.</li>
            <li>Orders are confirmed only after payment is verified.</li>
          </ul>
        </Section>

        <Section title="5. Shipping and Delivery">
          <ul style={{ paddingLeft: 20 }}>
            <li>We ship across Canada via Canada Post and other domestic carriers.</li>
            <li>Free shipping on orders of $300 CAD or more. Standard orders ship for $14.99 CAD.</li>
            <li>We are not responsible for delays caused by the carrier, weather, or circumstances beyond our control.</li>
            <li>Risk of loss transfers to you upon delivery confirmation by the carrier.</li>
          </ul>
        </Section>

        <Section title="6. Returns and Refunds">
          <p>Due to the nature of research compounds, all sales are final unless:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>The product arrives damaged or defective</li>
            <li>The wrong product was shipped</li>
          </ul>
          <p style={{ marginTop: 8 }}>Refund requests must be submitted within 14 days of delivery with photo documentation. We may, at our sole discretion, offer a replacement or store credit. No cash refunds on opened products. Returns are handled in accordance with applicable Canadian consumer protection legislation. See our full <Link href="/returns" style={{ color: '#0F2A4A' }}>Returns Policy</Link>.</p>
        </Section>

        <Section title="7. Intellectual Property">
          <p>All content on this site, including text, images, logos, product names, and branding, is the property of EVO Labs Research Canada and is protected by applicable Canadian and international intellectual property laws. You may not reproduce, distribute, or use our content without written permission.</p>
        </Section>

        <Section title="8. Limitation of Liability">
          <p>TO THE MAXIMUM EXTENT PERMITTED BY CANADIAN LAW, EVO LABS RESEARCH CANADA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OUR PRODUCTS OR SITE. Our liability is limited to the amount you paid for the specific product at issue.</p>
        </Section>

        <Section title="9. Governing Law">
          <p>These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein. Any disputes shall be resolved in the courts of Toronto, Ontario, Canada.</p>
        </Section>

        <Section title="10. Modifications">
          <p>We reserve the right to modify these Terms at any time. Continued use of the site after changes constitutes acceptance. We will provide notice of material changes via email or site notice.</p>
        </Section>

        <Section title="11. Contact">
          <p>EVO Labs Research Canada · 100 King Street West, Suite 5600, Toronto, ON M5X 1C9<br />
            Email: <a href="mailto:support@evolabsresearch.ca" style={{ color: '#0F2A4A' }}>support@evolabsresearch.ca</a>
          </p>
        </Section>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 24, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {['/privacy', '/disclaimer', '/returns', '/research-use'].map(href => (
            <Link key={href} href={href} style={{ fontSize: 13, color: '#6b7280', textDecoration: 'underline' }}>
              {href.replace('/', '').replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
