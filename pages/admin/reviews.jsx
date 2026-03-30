import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';

function authHeaders() {
  const pw = typeof window !== 'undefined' ? localStorage.getItem('evo_admin_pw') || '' : '';
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${pw}` };
}

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: 'Approved' },
  { key: 'hold', label: 'Pending' },
  { key: 'spam', label: 'Spam' },
  { key: 'trash', label: 'Trash' },
];

const STATUS_COLORS = {
  approved: { bg: '#dcfce7', color: '#166534' },
  hold: { bg: '#fef9c3', color: '#854d0e' },
  spam: { bg: '#fee2e2', color: '#991b1b' },
  trash: { bg: '#f3f4f6', color: '#6b7280' },
};

const STARS = [1, 2, 3, 4, 5];

function StarRating({ rating }) {
  return (
    <span style={{ color: '#f59e0b', fontSize: 14, letterSpacing: 1 }}>
      {STARS.map(s => s <= rating ? '★' : '☆').join('')}
    </span>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchReviews = useCallback(async (status = activeTab) => {
    setLoading(true);
    setError('');
    try {
      const r = await fetch(`/api/admin/reviews?status=${status}&per_page=100`, { headers: authHeaders() });
      const data = await r.json();
      if (data.reviews) setReviews(data.reviews);
      else setError(data.error || 'Failed to load');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchReviews(activeTab); }, [activeTab]);

  async function updateStatus(id, newStatus) {
    setActionLoading(id + '_status');
    try {
      const r = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (r.ok) fetchReviews(activeTab);
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteReview(id) {
    if (!confirm('Permanently delete this review?')) return;
    setActionLoading(id + '_delete');
    try {
      const r = await fetch('/api/admin/reviews', {
        method: 'DELETE',
        headers: authHeaders(),
        body: JSON.stringify({ id }),
      });
      if (r.ok) setReviews(prev => prev.filter(rv => rv.id !== id));
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = reviews.filter(rv => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      rv.reviewer?.toLowerCase().includes(q) ||
      rv.review?.toLowerCase().includes(q) ||
      rv.product_name?.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout title="Reviews">
      <style>{`
        .rv-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .rv-table th { background: #f9fafb; padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; color: #6b7280; letter-spacing: .06em; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; white-space: nowrap; }
        .rv-table td { padding: 14px; border-bottom: 1px solid #f3f4f6; vertical-align: top; color: #374151; }
        .rv-table tr:hover td { background: #f9fafb; }
        .rv-badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; }
        .rv-action-btn { padding: 5px 10px; border-radius: 6px; border: 1px solid; font-size: 12px; font-weight: 600; cursor: pointer; transition: opacity .15s; }
        .rv-action-btn:hover { opacity: .75; }
        .rv-action-btn:disabled { opacity: .4; cursor: default; }
        @media (max-width: 767px) {
          .rv-table .hide-mobile { display: none; }
          .rv-table td { padding: 10px 8px; font-size: 13px; }
          .rv-table th { padding: 8px; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111' }}>Product Reviews</h2>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>Manage customer reviews from WooCommerce</p>
        </div>
        <input
          type="text"
          placeholder="Search reviews..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, width: 220, outline: 'none' }}
        />
      </div>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid #e5e7eb', flexWrap: 'wrap' }}>
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 400,
              color: activeTab === tab.key ? '#1B4D3E' : '#6b7280',
              borderBottom: activeTab === tab.key ? '2px solid #1B4D3E' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading reviews…</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⭐</div>
          <p style={{ color: '#6b7280', margin: 0 }}>No reviews found</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="rv-table">
              <thead>
                <tr>
                  <th>Reviewer</th>
                  <th>Review</th>
                  <th className="hide-mobile">Product</th>
                  <th className="hide-mobile">Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(rv => {
                  const badge = STATUS_COLORS[rv.status] || { bg: '#f3f4f6', color: '#374151' };
                  const isApproved = rv.status === 'approved';
                  const date = rv.date_created ? new Date(rv.date_created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                  return (
                    <tr key={rv.id}>
                      <td style={{ minWidth: 120 }}>
                        <div style={{ fontWeight: 600, color: '#111', fontSize: 13 }}>{rv.reviewer || 'Anonymous'}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{rv.reviewer_email}</div>
                        {date && <div style={{ fontSize: 11, color: '#9ca3af' }}>{date}</div>}
                      </td>
                      <td style={{ maxWidth: 300 }}>
                        <div style={{ color: '#374151', fontSize: 13, lineHeight: 1.5 }}
                          dangerouslySetInnerHTML={{ __html: rv.review?.slice(0, 200) + (rv.review?.length > 200 ? '…' : '') }}
                        />
                        <div style={{ marginTop: 4 }}><StarRating rating={rv.rating} /></div>
                      </td>
                      <td className="hide-mobile" style={{ minWidth: 120 }}>
                        <span style={{ fontSize: 13, color: '#374151' }}>{rv.product_name || `#${rv.product_id}`}</span>
                      </td>
                      <td className="hide-mobile">
                        <StarRating rating={rv.rating} />
                        <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 4 }}>{rv.rating}/5</span>
                      </td>
                      <td>
                        <span className="rv-badge" style={{ background: badge.bg, color: badge.color }}>
                          {rv.status}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {!isApproved && (
                            <button
                              className="rv-action-btn"
                              disabled={!!actionLoading}
                              onClick={() => updateStatus(rv.id, 'approved')}
                              style={{ background: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' }}
                            >
                              {actionLoading === rv.id + '_status' ? '…' : 'Approve'}
                            </button>
                          )}
                          {isApproved && (
                            <button
                              className="rv-action-btn"
                              disabled={!!actionLoading}
                              onClick={() => updateStatus(rv.id, 'hold')}
                              style={{ background: '#fef9c3', color: '#854d0e', borderColor: '#fde68a' }}
                            >
                              {actionLoading === rv.id + '_status' ? '…' : 'Unapprove'}
                            </button>
                          )}
                          {rv.status !== 'spam' && (
                            <button
                              className="rv-action-btn"
                              disabled={!!actionLoading}
                              onClick={() => updateStatus(rv.id, 'spam')}
                              style={{ background: '#fee2e2', color: '#991b1b', borderColor: '#fecaca' }}
                            >
                              Spam
                            </button>
                          )}
                          <button
                            className="rv-action-btn"
                            disabled={!!actionLoading}
                            onClick={() => deleteReview(rv.id)}
                            style={{ background: '#f3f4f6', color: '#374151', borderColor: '#e5e7eb' }}
                          >
                            {actionLoading === rv.id + '_delete' ? '…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 14px', borderTop: '1px solid #f3f4f6', fontSize: 12, color: '#9ca3af' }}>
            {filtered.length} review{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
