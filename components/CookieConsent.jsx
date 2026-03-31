import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show on client side
    if (typeof window === 'undefined') return;

    // Check if user has already made a consent decision
    const existingConsent = localStorage.getItem('evo_cookie_consent');
    if (!existingConsent) {
      setVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('evo_cookie_consent', 'all');
    setVisible(false);
    // Dispatch custom event for app to load GA/Omnisend
    window.dispatchEvent(new CustomEvent('evo:cookie-consent-granted'));
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('evo_cookie_consent', 'essential');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        background: '#1B4D3E',
        color: '#fff',
        padding: '16px 24px',
        fontFamily: "'Poppins', sans-serif",
        borderTop: '1px solid rgba(74, 222, 128, 0.2)',
        boxShadow: '0 -2px 16px rgba(0, 0, 0, 0.15)',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        {/* Text Section */}
        <div style={{ flex: 1, minWidth: 250 }}>
          <p
            style={{
              margin: '0 0 8px 0',
              fontSize: 14,
              fontWeight: 500,
              lineHeight: '1.5',
            }}
          >
            We use cookies to improve your experience and for analytics. By clicking "Accept All", you consent to non-essential cookies including Google Analytics and marketing tools. You can change your preferences anytime in our{' '}
            <Link
              href="/privacy"
              style={{
                color: '#4ADE80',
                textDecoration: 'underline',
                fontWeight: 600,
              }}
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        {/* Buttons Section */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <button
            onClick={handleEssentialOnly}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "'Poppins', sans-serif",
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.6)';
              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.4)';
              e.target.style.background = 'transparent';
            }}
          >
            Essential Only
          </button>

          <button
            onClick={handleAcceptAll}
            style={{
              background: '#4ADE80',
              border: 'none',
              color: '#1B4D3E',
              padding: '10px 24px',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Poppins', sans-serif",
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#22c55e';
              e.target.style.boxShadow = '0 4px 12px rgba(74, 222, 128, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#4ADE80';
              e.target.style.boxShadow = 'none';
            }}
          >
            Accept All
          </button>
        </div>
      </div>

      {/* Responsive adjustments */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="position: fixed"] {
            padding: 12px 16px !important;
          }
          div[style*="maxWidth: 1280"] {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          p {
            font-size: 13px !important;
          }
          button {
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  );
}
