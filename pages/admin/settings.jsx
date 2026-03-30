import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import CatalogModeSelector from '../../components/admin/CatalogModeSelector';

function authHeaders() {
  const pw = typeof window !== 'undefined' ? localStorage.getItem('evo_admin_pw') || '' : '';
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` };
}

const DEFAULT_SETTINGS = {
  store: { name: 'EVO Labs Research Canada', address: '100 King Street West, Suite 5600, Toronto, ON M5X 1C9', phone: '(647) 555-0199', email: 'support@evolabsresearch.ca', website: 'https://evolabsresearch.ca' },
  shipping: { freeShippingThreshold: '250', flatRate: '9.99', processingDays: '1-2', sameDayCutoff: '12:00', carrier: 'USPS Priority Mail' },
  payments: { interac: '@evolabsresearch or support@evolabsresearch.ca', crypto: 'BTC, ETH, USDC accepted — contact for wallet address', giftCard: 'Digital gift certificate processing enabled', stripe: 'NOT ENABLED — use alternatives above' },
  compliance: { ruoDisclaimer: 'For Research Use Only — Not for Human Consumption. These products are intended solely for laboratory research. Not intended for use in humans or animals. Must be 18+ to purchase.', age: 'true', termsRequired: 'true' },
  affiliates: { defaultCommission: '10', silverThreshold: '10', silverCommission: '12', goldThreshold: '25', goldCommission: '15', cookieDays: '30', holdDays: '14', minPayout: '50' },
  emails: {
    orderConfirmation: "Hi {name},\n\nThank you for your order #{orderId}! We'll process it within 1-2 business days.\n\nFor Research Use Only.\n\nEVO Labs Research",
    shippingNotification: 'Your order #{orderId} has shipped! Track it at: {trackingUrl}',
    refundConfirmation: 'Your refund of ${amount} for order #{orderId} has been processed.',
  },
};

export default function AdminSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState('processors');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Payment processor state
  const [processors, setProcessors] = useState({});
  const [procLoading, setProcLoading] = useState(true);
  const [procToggles, setProcToggles] = useState({}); // per-processor loading state
  const [procSaved, setProcSaved] = useState('');
  const [procError, setProcError] = useState('');

  // Announcement bar state
  const [announcement, setAnnouncement] = useState({ text: '', enabled: false });
  const [annLoading, setAnnLoading] = useState(true);
  const [annSaving, setAnnSaving] = useState(false);
  const [annSaved, setAnnSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/settings', { headers: authHeaders() });
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
      } catch (e) {
        console.error('Failed to load settings', e);
      } finally {
        setLoading(false);
      }
    })();
    // Load payment processors
    (async () => {
      try {
        const res = await fetch('/api/admin/payment-settings', { headers: authHeaders() });
        const data = await res.json();
        if (data.processors) setProcessors(data.processors);
      } catch {} finally { setProcLoading(false); }
    })();
    // Load announcement bar
    (async () => {
      try {
        const res = await fetch('/api/admin/site-settings', { headers: authHeaders() });
        const data = await res.json();
        if (data.settings?.announcement_bar) {
          const ab = typeof data.settings.announcement_bar === 'string'
            ? { text: data.settings.announcement_bar, enabled: true }
            : data.settings.announcement_bar;
          setAnnouncement(ab);
        }
      } catch {} finally { setAnnLoading(false); }
    })();
  }, []);

  const toggleProcessor = async (key, enabled) => {
    setProcToggles(prev => ({ ...prev, [key]: true }));
    setProcError('');
    setProcSaved('');
    try {
      const res = await fetch('/api/admin/payment-settings', {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ processor: key, enabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Toggle failed');
      setProcessors(data.processors);
      setProcSaved(key);
      setTimeout(() => setProcSaved(''), 2000);
    } catch (err) {
      setProcError(err.message);
    } finally {
      setProcToggles(prev => ({ ...prev, [key]: false }));
    }
  };

  const saveAnnouncement = async () => {
    setAnnSaving(true);
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ key: 'announcement_bar', value: announcement }),
      });
      if (!res.ok) throw new Error('Save failed');
      setAnnSaved(true);
      setTimeout(() => setAnnSaved(false), 2500);
    } catch {} finally { setAnnSaving(false); }
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ section: activeTab, settings: settings[activeTab] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const update = (section, key, value) => setSettings(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));

  const TABS = [
    { id: 'processors', label: 'Payment Processors', icon: '💳' },
    { id: 'announcement', label: 'Announcement Bar', icon: '📢' },
    { id: 'store', label: 'Store Info', icon: '🏢' },
    { id: 'shipping', label: 'Shipping', icon: '📦' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'compliance', label: 'Compliance', icon: '⚖' },
    { id: 'affiliates', label: 'Affiliates', icon: '🔗' },
    { id: 'emails', label: 'Email Templates', icon: '✉' },
  ];

  return (
    <AdminLayout title="Settings">
      {/* Site Access Mode — first section */}
      <CatalogModeSelector />

      <div style={{ display: 'flex', gap: 24, maxWidth: 1000 }}>
        <div style={{ width: 200, flexShrink: 0 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '10px 14px', borderRadius: 8, marginBottom: 4,
              background: activeTab === tab.id ? '#1B4D3E' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#374151',
              border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: 500,
            }}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '28px', minHeight: 400 }}>
          {/* Payment Processors */}
          {activeTab === 'processors' && (
            <Section title="Payment Processors" desc="Enable or disable payment methods shown at checkout.">
              {procLoading ? (
                <div style={{ color: '#9ca3af', fontSize: 14 }}>Loading processors…</div>
              ) : (
                <>
                  {procError && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: '#fef2f2', borderRadius: 8 }}>{procError}</div>}
                  {Object.entries(processors).sort(([,a],[,b]) => (a.order||99) - (b.order||99)).map(([key, proc]) => {
                    const isOn = proc.enabled;
                    const toggling = procToggles[key];
                    const justSaved = procSaved === key;
                    return (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: isOn ? 'rgba(27,77,62,0.04)' : '#fafafa', border: `1px solid ${isOn ? 'rgba(27,77,62,0.2)' : '#e5e7eb'}`, borderRadius: 12, marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 2 }}>
                            {proc.icon === 'card' ? '💳' : '🏦'} {proc.label}
                          </div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>{key.charAt(0).toUpperCase() + key.slice(1)} — {proc.description}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {justSaved && <span style={{ fontSize: 12, color: '#065f46', fontWeight: 600 }}>Saved ✓</span>}
                          <span style={{ fontSize: 11, fontWeight: 700, color: isOn ? '#065f46' : '#9ca3af', letterSpacing: '0.06em' }}>
                            {isOn ? '● ACTIVE' : '○ OFF'}
                          </span>
                          <button
                            onClick={() => toggleProcessor(key, !isOn)}
                            disabled={toggling}
                            style={{
                              width: 48, height: 26, borderRadius: 13, border: 'none', cursor: toggling ? 'wait' : 'pointer',
                              background: isOn ? '#C9A96E' : '#444', position: 'relative', transition: 'background 0.2s',
                            }}
                          >
                            <span style={{
                              position: 'absolute', top: 3, left: isOn ? 25 : 3,
                              width: 20, height: 20, borderRadius: '50%', background: '#fff',
                              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            }} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </Section>
          )}

          {/* Announcement Bar */}
          {activeTab === 'announcement' && (
            <Section title="Announcement Bar" desc="The banner shown at the top of every page.">
              {annLoading ? (
                <div style={{ color: '#9ca3af', fontSize: 14 }}>Loading…</div>
              ) : (
                <>
                  {/* Preview */}
                  {announcement.enabled && announcement.text && (
                    <div style={{ background: '#131315', color: '#C9A96E', textAlign: 'center', padding: '10px 16px', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', borderRadius: 8, marginBottom: 20 }}>
                      {announcement.text}
                    </div>
                  )}
                  <Field label="Enable Announcement Bar">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <button
                        onClick={() => setAnnouncement(prev => ({ ...prev, enabled: !prev.enabled }))}
                        style={{
                          width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                          background: announcement.enabled ? '#C9A96E' : '#444', position: 'relative', transition: 'background 0.2s',
                        }}
                      >
                        <span style={{
                          position: 'absolute', top: 3, left: announcement.enabled ? 25 : 3,
                          width: 20, height: 20, borderRadius: '50%', background: '#fff',
                          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }} />
                      </button>
                      <span style={{ fontSize: 13, color: announcement.enabled ? '#065f46' : '#9ca3af' }}>
                        {announcement.enabled ? 'Visible on site' : 'Hidden'}
                      </span>
                    </label>
                  </Field>
                  <Field label={`Announcement Text (${(announcement.text || '').length}/100)`}>
                    <input
                      type="text" value={announcement.text || ''}
                      onChange={e => { if (e.target.value.length <= 100) setAnnouncement(prev => ({ ...prev, text: e.target.value })); }}
                      placeholder="Free Shipping on Orders $250+"
                      style={inputStyle}
                    />
                  </Field>
                  <button onClick={saveAnnouncement} disabled={annSaving} style={{
                    padding: '10px 24px', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: annSaving ? 'not-allowed' : 'pointer',
                    background: annSaved ? '#065f46' : '#1B4D3E', color: '#fff', opacity: annSaving ? 0.7 : 1, marginTop: 8,
                  }}>
                    {annSaving ? 'Saving…' : annSaved ? '✓ Saved' : 'Save Announcement'}
                  </button>
                </>
              )}
            </Section>
          )}

          {loading && <div style={{ color: '#9ca3af', fontSize: 14 }}>Loading settings…</div>}

          {!loading && activeTab === 'store' && (
            <Section title="Store Information" desc="Basic business information displayed on invoices and emails.">
              {Object.entries(settings.store).map(([key, val]) => (
                <Field key={key} label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}>
                  <input type="text" value={val} onChange={e => update('store', key, e.target.value)} style={inputStyle} />
                </Field>
              ))}
            </Section>
          )}

          {!loading && activeTab === 'shipping' && (
            <Section title="Shipping Configuration" desc="Configure shipping rates and thresholds.">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Free Shipping Threshold ($)">
                  <input type="number" value={settings.shipping.freeShippingThreshold} onChange={e => update('shipping', 'freeShippingThreshold', e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Flat Rate Shipping ($)">
                  <input type="number" step="0.01" value={settings.shipping.flatRate} onChange={e => update('shipping', 'flatRate', e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Processing Days">
                  <input type="text" value={settings.shipping.processingDays} onChange={e => update('shipping', 'processingDays', e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Same-Day Cutoff Time">
                  <input type="time" value={settings.shipping.sameDayCutoff} onChange={e => update('shipping', 'sameDayCutoff', e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Primary Carrier">
                  <input type="text" value={settings.shipping.carrier} onChange={e => update('shipping', 'carrier', e.target.value)} style={inputStyle} />
                </Field>
              </div>
            </Section>
          )}

          {!loading && activeTab === 'payments' && (
            <Section title="Payment Configuration" desc="Configure accepted payment methods. Stripe is NOT enabled.">
              <div style={{ background: '#fef3c7', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#92400e' }}>
                ⚠ Stripe is not available for this business. Use the alternatives below.
              </div>
              {Object.entries(settings.payments).map(([key, val]) => (
                <Field key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
                  <input type="text" value={val} onChange={e => update('payments', key, e.target.value)} style={inputStyle} disabled={key === 'stripe'} />
                </Field>
              ))}
            </Section>
          )}

          {!loading && activeTab === 'compliance' && (
            <Section title="Compliance Settings" desc="RUO disclaimer and legal requirements.">
              <Field label="RUO Disclaimer Text">
                <textarea value={settings.compliance.ruoDisclaimer} onChange={e => update('compliance', 'ruoDisclaimer', e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
              </Field>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                {[
                  { key: 'age', label: 'Require 18+ age verification on checkout' },
                  { key: 'termsRequired', label: 'Require acceptance of Terms of Service before purchase' },
                ].map(({ key, label }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#374151', cursor: 'pointer' }}>
                    <input type="checkbox" checked={settings.compliance[key] === 'true'} onChange={e => update('compliance', key, String(e.target.checked))} style={{ width: 16, height: 16 }} />
                    {label}
                  </label>
                ))}
              </div>
            </Section>
          )}

          {!loading && activeTab === 'affiliates' && (
            <Section title="Affiliate Program Settings" desc="Commission rates and payout rules.">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { key: 'defaultCommission', label: 'Default Commission (%)' },
                  { key: 'cookieDays', label: 'Cookie Duration (days)' },
                  { key: 'silverThreshold', label: 'Silver Threshold (sales/mo)' },
                  { key: 'silverCommission', label: 'Silver Commission (%)' },
                  { key: 'goldThreshold', label: 'Gold Threshold (sales/mo)' },
                  { key: 'goldCommission', label: 'Gold Commission (%)' },
                  { key: 'holdDays', label: 'Commission Hold (days)' },
                  { key: 'minPayout', label: 'Min Payout ($)' },
                ].map(({ key, label }) => (
                  <Field key={key} label={label}>
                    <input type="number" min="0" value={settings.affiliates[key] || ''} onChange={e => update('affiliates', key, e.target.value)} style={inputStyle} />
                  </Field>
                ))}
              </div>
            </Section>
          )}

          {!loading && activeTab === 'emails' && (
            <Section title="Email Templates" desc="Automated email content sent to customers.">
              {Object.entries(settings.emails).map(([key, val]) => (
                <Field key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}>
                  <textarea value={val} onChange={e => update('emails', key, e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }} />
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Variables: {'{name}'}, {'{orderId}'}, {'{trackingUrl}'}, {'{amount}'}</p>
                </Field>
              ))}
            </Section>
          )}

          {!loading && (
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #f3f4f6' }}>
              {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 10 }}>✕ {error}</div>}
              <button onClick={save} disabled={saving} style={{
                padding: '10px 24px', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                background: saved ? '#065f46' : '#1B4D3E', color: '#fff', opacity: saving ? 0.7 : 1,
              }}>
                {saving ? 'Saving…' : saved ? '✓ Saved to Database' : 'Save Settings'}
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function Section({ title, desc, children }) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111' }}>{title}</h2>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>{desc}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: '#fff', boxSizing: 'border-box', outline: 'none' };
