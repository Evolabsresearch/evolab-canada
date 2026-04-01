import Layout from '../components/Layout';
import Link from 'next/link';

export default function ReturnsPolicy() {
  return (
    <Layout title="Returns & Refunds Policy | EVO Labs Research Canada" description="EVO Labs Research Canada returns and refunds policy for research compounds.">
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '60px 24px 80px', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ marginBottom: 40 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Legal</span>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: '#111', margin: '8px 0 12px', letterSpacing: '-0.02em' }}>Returns & Refunds Policy</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Last updated: March 1, 2026</p>
          <div style={{ height: 1, background: '#e5e7eb', marginTop: 24 }} />
        </div>

        <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.8 }}>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '14px 18px', marginBottom: 28, color: '#065f46' }}>
            <strong>Our Commitment:</strong> If there's an issue with your order, we'll make it right. Contact us within 14 days of delivery.
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 12 }}>Eligible Return Situations</h2>
          <p>Due to the sensitive nature of research compounds, we cannot accept returns on products that have been opened, tampered with, or stored improperly. However, we will provide a refund, replacement, or store credit in the following circumstances:</p>
          <ul style={{ paddingLeft: 20, margin: '12px 0 20px' }}>
            <li style={{ marginBottom: 8 }}><strong>Damaged in Transit:</strong> Products that arrive physically damaged with the seal broken due to shipping damage</li>
            <li style={{ marginBottom: 8 }}><strong>Wrong Item Shipped:</strong> You received a product different from what you ordered</li>
            <li style={{ marginBottom: 8 }}><strong>Missing Items:</strong> An item listed on your order confirmation was not included in your shipment</li>
            <li style={{ marginBottom: 8 }}><strong>Quality Issue:</strong> Verified quality defect supported by our testing documentation</li>
          </ul>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '28px 0 12px' }}>Non-Returnable Situations</h2>
          <ul style={{ paddingLeft: 20, margin: '0 0 20px' }}>
            <li style={{ marginBottom: 6 }}>Opened or used products (unless defective)</li>
            <li style={{ marginBottom: 6 }}>Products stored improperly by the customer</li>
            <li style={{ marginBottom: 6 }}>Orders placed in error (wrong product, wrong quantity)</li>
            <li style={{ marginBottom: 6 }}>Requests made more than 14 days after delivery</li>
            <li style={{ marginBottom: 6 }}>Products without original packaging or labeling</li>
          </ul>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '28px 0 12px' }}>How to Request a Return/Refund</h2>
          <ol style={{ paddingLeft: 20, margin: '0 0 20px' }}>
            <li style={{ marginBottom: 10 }}>Email <a href="mailto:support@evolabsresearch.ca" style={{ color: '#0F2A4A' }}>support@evolabsresearch.ca</a> within 14 days of delivery</li>
            <li style={{ marginBottom: 10 }}>Include your order number (e.g., EVO-XXXXX)</li>
            <li style={{ marginBottom: 10 }}>Describe the issue clearly</li>
            <li style={{ marginBottom: 10 }}>Attach photos of the damaged/incorrect product and packaging</li>
            <li style={{ marginBottom: 10 }}>Our team will respond within 1-2 business days</li>
          </ol>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '28px 0 12px' }}>Refund Processing</h2>
          <p>Once approved, refunds are processed within 5-7 business days via the original payment method (Interac e-Transfer, cryptocurrency, or store credit). Store credit is issued immediately upon approval.</p>
          <p>Returns are handled in accordance with applicable Canadian consumer protection legislation.</p>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '28px 0 12px' }}>Contact</h2>
          <p>For any returns or refund questions:<br />
            <a href="mailto:support@evolabsresearch.ca" style={{ color: '#0F2A4A' }}>support@evolabsresearch.ca</a> · (647) 555-0199
          </p>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 24, marginTop: 40, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {['/privacy', '/terms', '/disclaimer', '/research-use'].map(href => (
            <Link key={href} href={href} style={{ fontSize: 13, color: '#6b7280', textDecoration: 'underline' }}>
              {href.replace('/', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
