import { useState, useEffect } from 'react';

const MODES = [
  {
    id: 'gated',
    icon: '\uD83D\uDD12',
    label: 'GATED',
    shortDesc: 'Members only\nLogin to browse',
    description: '\uD83D\uDD12 Site is in members-only mode. New visitors see the homepage but must create an account to browse products or place orders.',
    bg: '#1a1a1a',
    border: '#333',
  },
  {
    id: 'open_catalog',
    icon: '\uD83C\uDF10',
    label: 'OPEN CATALOG',
    shortDesc: 'Browse free,\nlogin to checkout',
    description: '\uD83C\uDF10 Anyone can browse products freely. An account is required to add to cart and checkout. Visitors see a prompt to sign in when they try to checkout.',
    bg: '#1a1a1a',
    border: '#333',
  },
  {
    id: 'full_open',
    icon: '\uD83D\uDE80',
    label: 'FULL OPEN',
    shortDesc: 'No account needed.\nAuto-creates account\non checkout',
    description: '\uD83D\uDE80 Completely open. Anyone can browse, add to cart, and checkout without an account. An account is automatically created using their checkout email, and a welcome email is sent with a login link.',
    bg: '#1a1a1a',
    border: '#333',
  },
];

function authHeaders() {
  const pw = typeof window !== 'undefined' ? localStorage.getItem('evo_admin_pw') || '' : '';
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` };
}

export default function CatalogModeSelector() {
  const [activeMode, setActiveMode] = useState('gated');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // which mode is being saved
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/site-settings', { headers: authHeaders() });
        const data = await res.json();
        if (data.settings?.catalog_mode) {
          const cm = data.settings.catalog_mode;
          // Handle both formats
          const mode = cm.mode || (cm.gated ? 'gated' : 'open_catalog');
          setActiveMode(mode);
        }
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectMode = async (modeId) => {
    if (modeId === activeMode || saving) return;
    setSaving(modeId);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          key: 'catalog_mode',
          value: { mode: modeId, updated_at: new Date().toISOString() },
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Save failed');
      }
      setActiveMode(modeId);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  };

  const activeModeInfo = MODES.find(m => m.id === activeMode);

  if (loading) {
    return (
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 28, marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: '#6b7280' }}>Loading site access mode...</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 28, marginBottom: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111' }}>Site Access Mode</h2>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Control who can browse and purchase</p>
      </div>

      {/* Three cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {MODES.map(mode => {
          const isActive = mode.id === activeMode;
          const isSaving = saving === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => selectMode(mode.id)}
              disabled={!!saving}
              style={{
                background: isActive ? 'rgba(201,169,110,0.08)' : '#fafafa',
                border: `2px solid ${isActive ? '#C9A96E' : '#e5e7eb'}`,
                borderRadius: 12,
                padding: '20px 16px',
                cursor: saving ? 'wait' : 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                opacity: saving && !isSaving ? 0.6 : 1,
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{mode.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 6 }}>{mode.label}</div>
              <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.4, whiteSpace: 'pre-line' }}>{mode.shortDesc}</div>
              {isSaving && (
                <div style={{ fontSize: 11, color: '#C9A96E', fontWeight: 600, marginTop: 8 }}>Saving...</div>
              )}
              {isActive && !isSaving && (
                <div style={{ fontSize: 11, color: '#C9A96E', fontWeight: 700, marginTop: 8, letterSpacing: '0.04em' }}>ACTIVE</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Status messages */}
      {saved && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#065f46', marginBottom: 12 }}>
          Mode updated — changes live within 60 seconds
        </div>
      )}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#991b1b', marginBottom: 12 }}>
          {error}
        </div>
      )}

      {/* Description of active mode */}
      {activeModeInfo && (
        <div style={{ background: '#f9fafb', borderRadius: 8, padding: '14px 16px', fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
          {activeModeInfo.description}
        </div>
      )}
    </div>
  );
}
