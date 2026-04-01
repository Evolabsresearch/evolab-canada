'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AgeGate() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ageVerified = localStorage.getItem('evo_age_verified');
    if (!ageVerified) {
      setIsVisible(true);
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem('evo_age_verified', 'true');
    setIsVisible(false);
  };

  const handleExit = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.95)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          textAlign: 'center',
          background: '#0f0f0f',
          border: '1.5px solid #0F2A4A',
          borderRadius: '16px',
          padding: '48px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Logo */}
        <img
          src="https://evolabsresearch.ca/wp-content/uploads/2021/06/EVO-LABS-RESEARCH-1.png"
          alt="EVO Labs Research"
          style={{
            height: '80px',
            objectFit: 'contain',
            filter: 'brightness(0) invert(1)',
          }}
        />

        {/* Text */}
        <p
          style={{
            fontSize: '16px',
            color: '#e5e7eb',
            lineHeight: '1.6',
            margin: '0',
            fontWeight: '500',
          }}
        >
          By entering this site, you confirm that you are 18 years of age or older and understand that all products sold by EVO Labs Research Canada are intended strictly for research use only and not for human consumption.
        </p>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexDirection: 'column',
            marginTop: '12px',
          }}
        >
          <button
            onClick={handleConfirm}
            style={{
              padding: '14px 28px',
              background: '#0F2A4A',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '700',
              fontFamily: "'DM Sans', sans-serif",
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onHover={(e) => (e.target.style.background = '#06b6d4')}
            onMouseEnter={(e) => (e.target.style.background = '#06b6d4')}
            onMouseLeave={(e) => (e.target.style.background = '#0F2A4A')}
          >
            I Confirm — Enter Site
          </button>
          <button
            onClick={handleExit}
            style={{
              padding: '14px 28px',
              background: 'transparent',
              color: '#9ca3af',
              border: '1.5px solid #374151',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '700',
              fontFamily: "'DM Sans', sans-serif",
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#e5e7eb';
              e.target.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#9ca3af';
              e.target.style.borderColor = '#374151';
            }}
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
