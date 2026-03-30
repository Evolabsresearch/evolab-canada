import Layout from '../components/Layout';
import Link from 'next/link';

export default function Disclaimer() {
  return (
    <Layout title="Disclaimer | EVO Labs Research Canada" description="EVO Labs Research Canada legal disclaimer — research use only, not for human consumption.">
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '60px 24px 80px', fontFamily: "'Anek Telugu', sans-serif" }}>
        <div style={{ marginBottom: 40 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Legal</span>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#111', margin: '8px 0 12px', letterSpacing: '-0.02em' }}>Disclaimer</h1>
          <div style={{ height: 1, background: '#e5e7eb', marginTop: 24 }} />
        </div>

        <div style={{ background: '#1B4D3E', color: '#fff', borderRadius: 12, padding: '24px 28px', marginBottom: 36, fontSize: 16, lineHeight: 1.7 }}>
          <strong style={{ display: 'block', fontSize: 18, marginBottom: 8 }}>⚠ Research Use Only — Not for Human Consumption</strong>
          All products sold by EVO Labs Research Canada are intended exclusively for in vitro (test tube/cell culture) and in vivo (animal) research by qualified scientific professionals. These products are NOT approved by Health Canada for use in humans or as dietary supplements.
        </div>

        <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 12 }}>No Medical Claims</h2>
          <p>Nothing on this website constitutes medical advice, diagnosis, treatment, or a recommendation for any specific compound for human use. EVO Labs Research does not make any claims about the efficacy, safety, or appropriateness of any compound for human administration.</p>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '28px 0 12px' }}>Qualified Purchasers Only</h2>
          <p>Products are sold only to individuals who represent and warrant that:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>They are at least 18 years of age</li>
            <li>They are qualified researchers, scientists, or laboratory professionals</li>
            <li>They understand the research-use-only nature of these products</li>
            <li>They will use these products solely in a research setting</li>
            <li>They will not administer these products to themselves or others</li>
          </ul>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '28px 0 12px' }}>Legal Compliance</h2>
          <p>It is the purchaser's responsibility to ensure that acquiring, possessing, and using these compounds complies with all applicable federal, provincial, and municipal laws and regulations in Canada. EVO Labs Research Canada makes no representations about the legality of these products in any specific jurisdiction.</p>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '28px 0 12px' }}>Third-Party Research References</h2>
          <p>Any research studies, publications, or external links referenced on this site are provided for informational purposes only and do not constitute an endorsement of the findings or suggest that any product is suitable for human use.</p>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '28px 0 12px' }}>Limitation of Liability</h2>
          <p>EVO Labs Research Canada shall not be held liable for any damages, injury, illness, or adverse effects resulting from the misuse of its products. By purchasing, you acknowledge these terms and accept full responsibility for your use of these research compounds.</p>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 24, marginTop: 40, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {['/privacy', '/terms', '/returns', '/research-use'].map(href => (
            <Link key={href} href={href} style={{ fontSize: 13, color: '#6b7280', textDecoration: 'underline' }}>
              {href.replace('/', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
