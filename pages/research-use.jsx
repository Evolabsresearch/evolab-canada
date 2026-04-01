import Layout from '../components/Layout';
import Link from 'next/link';

export default function ResearchUsePolicy() {
  return (
    <Layout title="Research Use Only Policy | EVO Labs Research Canada" description="EVO Labs Research Canada RUO compliance policy — all products are for research use only, not for human consumption.">
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '60px 24px 80px', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ marginBottom: 40 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Compliance</span>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#111', margin: '8px 0 12px', letterSpacing: '-0.02em' }}>Research Use Only Policy</h1>
          <div style={{ height: 1, background: '#e5e7eb', marginTop: 24 }} />
        </div>

        {/* Big RUO Banner */}
        <div style={{ background: '#0f1117', borderRadius: 16, padding: '32px 36px', marginBottom: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>⚗ Official Statement</div>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', lineHeight: 1.6, margin: 0 }}>
            "ALL PRODUCTS SOLD BY EVO LABS RESEARCH CANADA ARE FOR RESEARCH USE ONLY (RUO) AND ARE NOT INTENDED FOR USE IN HUMANS OR ANIMALS."
          </p>
        </div>

        <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 12 }}>What "Research Use Only" Means</h2>
          <p>Research Use Only (RUO) is a regulatory designation that means a product is intended solely for use in laboratory research. EVO Labs Research Canada RUO products:</p>
          <ul style={{ paddingLeft: 20, margin: '12px 0 20px' }}>
            <li>Have not been approved or evaluated by Health Canada for human use</li>
            <li>Must not be administered to humans or animals outside of approved research protocols</li>
            <li>Are intended for use by qualified scientists and researchers in laboratory settings</li>
            <li>Are not dietary supplements, pharmaceuticals, or therapeutic agents</li>
          </ul>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '28px 0 12px' }}>Our Compliance Standards</h2>
          <p>EVO Labs Research Canada maintains strict RUO compliance through:</p>
          <ul style={{ paddingLeft: 20, margin: '12px 0 20px' }}>
            <li><strong>Labeling:</strong> Every product label includes "For Research Use Only — Not for Human Consumption"</li>
            <li><strong>Marketing:</strong> All marketing materials, website content, and partner communications strictly avoid human-use language, dosing advice, or medical claims</li>
            <li><strong>Purchaser Verification:</strong> We require purchasers to agree to RUO terms and certify eligibility at checkout</li>
            <li><strong>COA Documentation:</strong> Every batch is third-party tested. Certificates of Analysis are publicly available in our COA library</li>
            <li><strong>Partner Program:</strong> Affiliate partners must agree to use only approved, RUO-compliant language in all promotional activities</li>
          </ul>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '28px 0 12px' }}>Prohibited Uses</h2>
          <p>The following uses of our products are strictly prohibited and violate our Terms of Service:</p>
          <ul style={{ paddingLeft: 20, margin: '12px 0 20px' }}>
            <li>Self-administration or administration to other humans</li>
            <li>Use in animals outside of formal, approved research protocols</li>
            <li>Resale for human-use purposes</li>
            <li>Making medical or therapeutic claims about these products</li>
            <li>Providing dosing recommendations for human use</li>
          </ul>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '28px 0 12px' }}>Affiliate & Partner Compliance</h2>
          <p>All EVO Labs Research Canada affiliates and partners must:</p>
          <ul style={{ paddingLeft: 20, margin: '12px 0 20px' }}>
            <li>Include the RUO disclaimer in all content featuring our products</li>
            <li>Use only EVO Labs-approved marketing language</li>
            <li>Never suggest or imply these products are for human use</li>
            <li>Never provide dosing advice or medical guidance</li>
            <li>Target research-oriented audiences only</li>
          </ul>
          <p>Violation of these requirements will result in immediate termination of the affiliate agreement.</p>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '28px 0 12px' }}>Questions?</h2>
          <p>For compliance questions, contact: <a href="mailto:support@evolabsresearch.ca" style={{ color: '#0F2A4A' }}>support@evolabsresearch.ca</a></p>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 24, marginTop: 40, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {['/privacy', '/terms', '/disclaimer', '/returns'].map(href => (
            <Link key={href} href={href} style={{ fontSize: 13, color: '#6b7280', textDecoration: 'underline' }}>
              {href.replace('/', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
