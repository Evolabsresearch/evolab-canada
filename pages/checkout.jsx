import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { products } from '../lib/data';
import dynamic from 'next/dynamic';

export async function getServerSideProps(ctx) {
  const { getCatalogMode, isCheckoutPublic } = await import('../lib/catalogMode');
  const mode = await getCatalogMode();
  const { getServerSession } = await import('next-auth/next');
  const { authOptions } = await import('./api/auth/[...nextauth]');
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const isAdmin = ctx.req.cookies?.evo_admin === '1';
  const isLoggedIn = !!session || isAdmin;
  if (!isCheckoutPublic(mode) && !isLoggedIn) return { redirect: { destination: '/account/login?redirect=/checkout', permanent: false } };

  // Fetch enabled payment processors
  let enabledProcessors = ['hummingbird', 'linkmoney', 'stripe']; // fallback: show all
  try {
    const { getSupabaseAdmin } = await import('../lib/supabase');
    const db = getSupabaseAdmin();
    const { data } = await db.from('site_settings').select('value').eq('key', 'payment_processors').maybeSingle();
    if (data) {
      const all = JSON.parse(data.value);
      enabledProcessors = Object.entries(all)
        .filter(([, v]) => v.enabled)
        .sort(([, a], [, b]) => (a.order || 99) - (b.order || 99))
        .map(([key]) => key);
    }
  } catch {}
  if (enabledProcessors.length === 0) enabledProcessors = ['stripe'];

  return { props: { enabledProcessors, catalogMode: mode, isGuest: !isLoggedIn } };
}

const STRIPE_ENABLED = process.env.NEXT_PUBLIC_STRIPE_ENABLED === 'true';
const StripePayment = STRIPE_ENABLED
  ? dynamic(() => import('../components/StripePayment'), { ssr: false })
  : null;

const CA_PROVINCES = [
  'Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Northwest Territories',
  'Nova Scotia','Nunavut','Ontario','Prince Edward Island','Quebec','Saskatchewan','Yukon',
];

function InputField({ label, required, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <input
        required={required}
        {...props}
        style={{
          padding: '12px 14px', borderRadius: 10,
          border: '1.5px solid #e5e7eb', fontSize: 14,
          fontFamily: "'Anek Telugu', sans-serif",
          outline: 'none', transition: 'border-color 0.2s',
          ...(props.style || {}),
        }}
        onFocus={e => e.target.style.borderColor = '#0F2A4A'}
        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
      />
    </div>
  );
}

function SelectField({ label, required, children, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <select
        required={required}
        {...props}
        style={{
          padding: '12px 14px', borderRadius: 10,
          border: '1.5px solid #e5e7eb', fontSize: 14,
          fontFamily: "'Anek Telugu', sans-serif",
          outline: 'none', transition: 'border-color 0.2s',
          background: '#fff', appearance: 'auto',
          ...(props.style || {}),
        }}
        onFocus={e => e.target.style.borderColor = '#0F2A4A'}
        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
      >
        {children}
      </select>
    </div>
  );
}

function Checkbox({ checked, onChange, children, description }) {
  return (
    <label style={{ display: 'flex', gap: 10, cursor: 'pointer', alignItems: 'flex-start' }}>
      <div style={{
        width: 20, height: 20, flexShrink: 0, borderRadius: 6, marginTop: 1,
        border: checked ? '2px solid #0F2A4A' : '2px solid #d1d5db',
        background: checked ? '#0F2A4A' : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s', cursor: 'pointer',
      }}>
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />
      <div>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{children}</span>
        {description && (
          <span style={{ display: 'block', fontSize: 11, color: '#9ca3af', marginTop: 2, lineHeight: 1.4 }}>{description}</span>
        )}
      </div>
    </label>
  );
}

function VisaLogo() {
  return (
    <svg width="38" height="24" viewBox="0 0 50 32" fill="none">
      <rect width="50" height="32" rx="5" fill="#fff" stroke="#e5e7eb" strokeWidth="1.5"/>
      <text x="25" y="22" textAnchor="middle" fill="#1A1F71" fontSize="17" fontWeight="700"
        fontStyle="italic" fontFamily="Arial Black, Arial, sans-serif" letterSpacing="-0.5">VISA</text>
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg width="38" height="24" viewBox="0 0 50 32" fill="none">
      <rect width="50" height="32" rx="5" fill="#fff" stroke="#e5e7eb" strokeWidth="1.5"/>
      <circle cx="19" cy="16" r="9" fill="#EB001B"/>
      <circle cx="31" cy="16" r="9" fill="#F79E1B"/>
      <path d="M25 8.2a9 9 0 0 1 0 15.6A9 9 0 0 1 25 8.2z" fill="#FF5F00"/>
    </svg>
  );
}

function AmexLogo() {
  return (
    <svg width="38" height="24" viewBox="0 0 50 32" fill="none">
      <rect width="50" height="32" rx="5" fill="#016FD0"/>
      <text x="25" y="14" textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="7"
        fontWeight="600" fontFamily="Arial, sans-serif" letterSpacing="0.8">AMERICAN</text>
      <text x="25" y="24" textAnchor="middle" fill="#fff" fontSize="9.5"
        fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="0.4">EXPRESS</text>
    </svg>
  );
}

function PlaidLogoInline() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <svg width="20" height="20" viewBox="0 0 34 34" fill="none">
        <defs><clipPath id="plaidOctCo"><path d="M9 0H25L34 9V25L25 34H9L0 25V9Z"/></clipPath></defs>
        <rect x="0" y="5" width="34" height="9" fill="#111" clipPath="url(#plaidOctCo)"/>
        <rect x="0" y="20" width="34" height="9" fill="#111" clipPath="url(#plaidOctCo)"/>
        <rect x="5" y="0" width="9" height="34" fill="#111" clipPath="url(#plaidOctCo)"/>
        <rect x="20" y="0" width="9" height="34" fill="#111" clipPath="url(#plaidOctCo)"/>
        <rect x="20" y="5" width="9" height="9" fill="white" clipPath="url(#plaidOctCo)"/>
        <rect x="5" y="20" width="9" height="9" fill="white" clipPath="url(#plaidOctCo)"/>
      </svg>
      <span style={{ fontWeight: 900, fontSize: 11, color: '#111', letterSpacing: '-0.02em', fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>PLAID</span>
    </div>
  );
}

// Processor key → internal paymentMethod mapping
const PROC_TO_METHOD = { hummingbird: 'card', linkmoney: 'bank', stripe: 'stripe' };

export default function CheckoutPage({ enabledProcessors = ['hummingbird', 'linkmoney', 'stripe'], catalogMode = 'gated', isGuest = false }) {
  const router = useRouter();
  const { cart, itemCount, subtotal, volumeDiscount, subtotalAfterVolume, shipping, total, clearCart, addItem } = useCart();
  const [bumpAdded, setBumpAdded] = useState(false);
  const [step, setStep] = useState(1); // 1 = shipping, 2 = payment, 3 = confirmation
  const [selectedShipping, setSelectedShipping] = useState('standard'); // 'standard' | 'express'
  const [placing, setPlacing] = useState(false);
  const [discountCode, setDiscountCode] = useState(''); // newsletter code earned at checkout
  const [referralCopied, setReferralCopied] = useState(false);
  const [orderedItems, setOrderedItems] = useState([]); // snapshot of cart at order time
  const [paidTotal, setPaidTotal] = useState(0);        // effective total paid
  // Promo code input
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(null); // { code, type, value, description }
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  // Loyalty points redemption
  const [loyaltyBalance, setLoyaltyBalance] = useState(0);
  const [loyaltyRedeemed, setLoyaltyRedeemed] = useState(0); // points being applied
  const [linkMoneyError, setLinkMoneyError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PROC_TO_METHOD[enabledProcessors[0]] || 'card'); // 'card' | 'bank' | 'stripe'
  const [adyenCardState, setAdyenCardState] = useState(null);
  const [adyenReady, setAdyenReady] = useState(false);
  const [adyenError, setAdyenError] = useState('');
  const [hbError, setHbError] = useState('');
  const [stripeSubmitting, setStripeSubmitting] = useState(false);
  const [stripeError, setStripeError] = useState('');
  const [ruoAgreed, setRuoAgreed] = useState(false); // Research use only acknowledgment
  const adyenContainerRef = useRef(null);

  // Persist order to Supabase after any successful payment (fire-and-forget)
  function saveOrderToSupabase({ formData, cartItems, total, paymentMethod, transactionId }) {
    fetch('/api/orders/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address1: formData.address1,
        address2: formData.address2,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: formData.country || 'CA',
        items: cartItems.map(item => ({
          id: item.id,
          slug: item.slug,
          name: item.name,
          quantity: item.qty || 1,
          lineTotal: parseFloat((item.salePrice || item.price || '0').replace(/[^0-9.]/g, '')) * (item.qty || 1),
          price: item.price,
          salePrice: item.salePrice || null,
          image: item.image || null,
        })),
        total,
        paymentMethod,
        transactionId: transactionId || null,
        catalogMode: catalogMode || 'gated',
      }),
    }).catch(() => {});
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const pts = parseInt(localStorage.getItem('evo_loyalty_pts') || '0', 10);
    setLoyaltyBalance(isNaN(pts) ? 0 : pts);
  }, []);

  // Handle return from Link Money after bank payment
  useEffect(() => {
    const { status, customerId, paymentId } = router.query;
    if (!status || !paymentId) return;

    if (status === '200') {
      // Restore checkout state saved before redirect
      const savedForm = sessionStorage.getItem('evo_checkout_form');
      const savedCart = sessionStorage.getItem('evo_checkout_cart');
      const savedTotal = sessionStorage.getItem('evo_checkout_total');

      let restoredForm = null;
      let restoredCart = [];
      if (savedForm) {
        try { restoredForm = JSON.parse(savedForm); setForm(restoredForm); } catch {}
      }
      if (savedCart) {
        try { restoredCart = JSON.parse(savedCart); setOrderedItems(restoredCart); } catch {}
      }
      const total = parseFloat(savedTotal || '0');
      setPaidTotal(total);

      // Save order to Supabase
      if (restoredForm) {
        saveOrderToSupabase({ formData: restoredForm, cartItems: restoredCart, total, paymentMethod: 'bank', transactionId: paymentId });
      }

      // Award loyalty points (1 pt per $1)
      const existing = parseInt(localStorage.getItem('evo_loyalty_pts') || '0', 10);
      localStorage.setItem('evo_loyalty_pts', String(existing + Math.floor(total)));

      // Send confirmation email + SMS
      if (savedForm && restoredCart.length) {
        try {
          const f = JSON.parse(savedForm);
          fetch('/api/orders/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: f.email,
              firstName: f.firstName,
              lastName: f.lastName,
              phone: f.phone || '',
              address1: f.address1,
              address2: f.address2 || '',
              city: f.city,
              state: f.state,
              zip: f.zip,
              country: f.country || 'CA',
              items: restoredCart.map(item => ({
                name: item.name,
                quantity: item.qty || 1,
                price: parseFloat((item.salePrice || item.price || '0').toString().replace(/[^0-9.]/g, '')) * (item.qty || 1),
              })),
              subtotal: total,
              shipping: parseFloat(savedTotal || '0') > 0 ? 9.99 : 0,
              total,
              shippingMethod: 'USPS Priority Mail',
              paymentMethod: 'linkmoney',
            }),
          }).catch(() => {});
        } catch {}
      }

      sessionStorage.removeItem('evo_checkout_form');
      sessionStorage.removeItem('evo_checkout_cart');
      sessionStorage.removeItem('evo_checkout_total');

      clearCart();
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (status === '204') {
      // Customer exited voluntarily — stay on checkout step 2
      setStep(2);
    } else {
      setLinkMoneyError('Payment was not completed. Please try again.');
      setStep(2);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query]);

  // Initialize Adyen card component when credit card payment is selected and step is 2
  useEffect(() => {
    if (paymentMethod !== 'card' || step !== 2) return;

    let cardComponent = null;
    let cancelled = false;

    async function initAdyen() {
      try {
        const configRes = await fetch('/api/hummingbird/config');
        if (cancelled) return;
        const configData = await configRes.json();
        const clientKey = configData.client_key;
        const environment = configData.environment || 'live';
        if (!clientKey) {
          if (!cancelled) setAdyenError('card_unavailable');
          return;
        }
        if (cancelled) return;

        const sdkVersion = '5.58.0';
        const sdkBase = `https://checkoutshopper-${environment}.adyen.com/checkoutshopper/sdk/${sdkVersion}`;

        // Load CSS if not already loaded
        if (!document.getElementById('adyen-web-css')) {
          const link = document.createElement('link');
          link.id = 'adyen-web-css';
          link.rel = 'stylesheet';
          link.href = `${sdkBase}/adyen.css`;
          document.head.appendChild(link);
        }

        // Load JS if not already loaded
        if (!window.AdyenCheckout) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `${sdkBase}/adyen.js`;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        }

        if (cancelled || !window.AdyenCheckout) return;

        const checkout = await window.AdyenCheckout({
          clientKey,
          environment,
          locale: 'en-US',
        });

        if (cancelled) return;

        cardComponent = checkout.create('card', {
          hasHolderName: true,
          holderNameRequired: true,
          onChange: (state) => setAdyenCardState(state),
        });

        if (adyenContainerRef.current) {
          cardComponent.mount(adyenContainerRef.current);
          setAdyenReady(true);
        }
      } catch (err) {
        console.error('Adyen init error:', err);
      }
    }

    initAdyen();

    return () => {
      cancelled = true;
      if (cardComponent) {
        try { cardComponent.unmount(); } catch {}
      }
      setAdyenReady(false);
      setAdyenCardState(null);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod, step]);

  // Auto-apply affiliate ref code from sessionStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ref = sessionStorage.getItem('evo_ref');
    if (!ref) return;
    fetch('/api/discount/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: ref, subtotal: 0 }),
    })
      .then(r => r.json())
      .then(d => { if (d.valid) setPromoApplied({ code: ref, pct: d.pct, label: d.label, freeShipping: d.freeShipping }); })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Form state
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'CA',
    phone: '',
    newsletter: true,   // pre-selected
    smsUpdates: true,    // pre-selected
    notes: '',
  });

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // Compute discount amount from applied promo (applies after volume discount)
  const discountAmount = promoApplied ? parseFloat((subtotalAfterVolume * promoApplied.pct).toFixed(2)) : 0;
  // free_shipping
  const promoFreeShip = promoApplied?.freeShipping || false;
  const selectedShippingCost = selectedShipping === 'express' ? 14.99 : (shipping || 9.99);
  const effectiveShipping = promoFreeShip ? 0 : selectedShippingCost;
  // Points: 500 pts = $5, i.e. $0.01 per point
  const loyaltyDiscount = parseFloat((loyaltyRedeemed * 0.01).toFixed(2));
  const effectiveTotal = Math.max(0, subtotalAfterVolume - discountAmount - loyaltyDiscount + effectiveShipping);

  // ── Shared: fire order confirmation email + SMS ───────────────────
  const sendOrderConfirmation = (cartSnapshot, total, payMethod) => {
    const body = {
      email: form.email,
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone || '',
      address1: form.address1,
      address2: form.address2 || '',
      city: form.city,
      state: form.state,
      zip: form.zip,
      country: form.country || 'CA',
      items: cartSnapshot.map(item => ({
        name: item.name,
        quantity: item.qty || 1,
        price: parseFloat((item.salePrice || item.price || '0').toString().replace(/[^0-9.]/g, '')) * (item.qty || 1),
      })),
      subtotal: subtotalAfterVolume,
      shipping: effectiveShipping,
      total,
      shippingMethod: selectedShipping === 'express' ? 'UPS Ground' : 'USPS Priority Mail',
      paymentMethod: payMethod,
    };
    // Fire-and-forget — don't block the UI
    fetch('/api/orders/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(err => console.warn('Order confirm email error:', err));
  };

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    const codeStr = promoInput.trim();
    if (!codeStr) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeStr, subtotal: subtotalAfterVolume }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromoApplied({ code: codeStr, pct: data.pct, label: data.label, freeShipping: data.freeShipping });
        setPromoInput('');
        setPromoError('');
      } else {
        setPromoError(data.error || 'Invalid code.');
      }
    } catch {
      setPromoError('Could not validate code. Please try again.');
    }
    setPromoLoading(false);
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Omnisend: started checkout (client-side SDK)
    try {
      if (typeof window !== 'undefined' && window.omnisend) {
        window.omnisend.push(['track', '$startedCheckout', {
          $currency: 'CAD',
          $revenue: effectiveTotal,
          $cartItems: cart.map(item => ({
            productID: item.slug,
            sku: item.slug,
            name: item.name,
            quantity: item.qty || 1,
            price: parseFloat((item.salePrice || item.price || '0').toString().replace(/[^0-9.]/g, '')),
            imageUrl: item.image ? `https://evolabsresearch.ca${item.image}` : '',
          })),
        }]);
      }
    } catch (_) {}
    // Omnisend: server-side startedCheckout event (fires even without client SDK)
    if (form.email) {
      fetch('/api/omnisend/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          eventName: 'startedCheckout',
          fields: {
            cartTotal: effectiveTotal,
            itemCount: cart.reduce((s, i) => s + (i.qty || 1), 0),
            checkoutUrl: 'https://evolabsresearch.ca/checkout',
          },
        }),
      }).catch(() => {});
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);

    // Sign up to newsletter if opted in (fire-and-forget, non-blocking)
    if (form.newsletter && form.email) {
      fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, phone: form.smsUpdates ? form.phone : undefined }),
      })
        .then(r => r.json())
        .then(d => {
          if (d.code) {
            setDiscountCode(d.code);
            if (typeof window !== 'undefined') {
              localStorage.setItem('evo_discount_code', d.code);
            }
          }
        })
        .catch(() => {});
    }

    // Save checkout state so we can restore it after Link Money redirect
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('evo_checkout_form', JSON.stringify(form));
      sessionStorage.setItem('evo_checkout_cart', JSON.stringify(cart));
      sessionStorage.setItem('evo_checkout_total', String(effectiveTotal));
    }

    try {
      const res = await fetch('/api/linkmoney/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          amount: effectiveTotal,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create payment session');
      window.location.href = data.sessionUrl;
    } catch (err) {
      console.error('Link Money error:', err);
      setLinkMoneyError(err.message || 'Payment setup failed. Please try again.');
      setPlacing(false);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('evo_checkout_form');
        sessionStorage.removeItem('evo_checkout_cart');
        sessionStorage.removeItem('evo_checkout_total');
      }
    }
  };

  const handlePlaceOrderWithCard = async (e) => {
    e.preventDefault();
    if (!adyenCardState?.isValid) {
      setHbError('Please fill in all card details correctly.');
      return;
    }
    setPlacing(true);
    setHbError('');

    if (form.newsletter && form.email) {
      fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, phone: form.smsUpdates ? form.phone : undefined }),
      })
        .then(r => r.json())
        .then(d => {
          if (d.code) {
            setDiscountCode(d.code);
            if (typeof window !== 'undefined') localStorage.setItem('evo_discount_code', d.code);
          }
        })
        .catch(() => {});
    }

    try {
      const pm = adyenCardState.data.paymentMethod;
      const res = await fetch('/api/hummingbird/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          amount: effectiveTotal,
          encryptedCardNumber: pm.encryptedCardNumber,
          encryptedExpiryMonth: pm.encryptedExpiryMonth,
          encryptedExpiryYear: pm.encryptedExpiryYear,
          encryptedSecurityCode: pm.encryptedSecurityCode,
          holderName: pm.holderName,
          address1: form.address1,
          address2: form.address2,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: form.country || 'CA',
          cartItems: cart.map(item => ({
            name: item.name,
            quantity: item.qty || 1,
            total: parseFloat((item.salePrice || item.price || '0').replace(/[^0-9.]/g, '')) * (item.qty || 1),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');

      if (typeof window !== 'undefined') {
        const existing = parseInt(localStorage.getItem('evo_loyalty_pts') || '0', 10);
        localStorage.setItem('evo_loyalty_pts', String(existing + Math.floor(effectiveTotal)));
      }
      saveOrderToSupabase({ formData: form, cartItems: cart, total: effectiveTotal, paymentMethod: 'card', transactionId: data.transaction_id });
      const cartSnapshot = [...cart];
      setOrderedItems(cartSnapshot);
      setPaidTotal(effectiveTotal);
      sendOrderConfirmation(cartSnapshot, effectiveTotal, 'card');
      clearCart();
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setHbError(err.message || 'Payment failed. Please try again.');
      setPlacing(false);
    }
  };

  const handleStripeSuccess = (paymentIntent) => {
    if (typeof window !== 'undefined') {
      const existing = parseInt(localStorage.getItem('evo_loyalty_pts') || '0', 10);
      localStorage.setItem('evo_loyalty_pts', String(existing + Math.floor(effectiveTotal)));
    }
    saveOrderToSupabase({ formData: form, cartItems: cart, total: effectiveTotal, paymentMethod: 'stripe', transactionId: paymentIntent?.id });
    const cartSnapshot = [...cart];
    setOrderedItems(cartSnapshot);
    setPaidTotal(effectiveTotal);
    sendOrderConfirmation(cartSnapshot, effectiveTotal, 'stripe');
    clearCart();
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSubmit = (e) => {
    if (paymentMethod === 'stripe') {
      e.preventDefault();
      if (!placing) {
        setPlacing(true);
        setStripeError('');
        setStripeSubmitting(true);
      }
    } else if (paymentMethod === 'card') {
      handlePlaceOrderWithCard(e);
    } else {
      handlePlaceOrder(e);
    }
  };

  // GTM: Fire purchase event on confirmation
  useEffect(() => {
    if (step === 3 && typeof window !== 'undefined' && orderedItems.length > 0) {
      // Generate a stable order ID for this checkout session if none exists
      let transactionId = sessionStorage.getItem('evo_current_trx_id');
      if (!transactionId) {
        transactionId = 'EVO-' + Date.now().toString(36).toUpperCase();
        sessionStorage.setItem('evo_current_trx_id', transactionId);
      }

      const key = `evo_tracked_${transactionId}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, 'true');

      // Support for GA4 eCommerce mapping
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ ecommerce: null });
      window.dataLayer.push({
        event: 'purchase',
        currency: 'CAD',
        transaction_id: transactionId,
        value: paidTotal,
        ecommerce: {
          currency: 'CAD',
          transaction_id: transactionId,
          value: paidTotal,
          items: orderedItems.map((item) => {
            const price = parseFloat((item.salePrice || item.price || '0').toString().replace(/[^0-9.]/g, ''));
            return {
              item_id: item.dosage ? `${item.slug}-${item.dosage}` : item.slug,
              item_name: item.dosage ? `${item.name} ${item.dosage}` : item.name,
              item_brand: 'EVO Labs Research',
              item_category: item.category || '',
              item_variant: item.dosage || '',
              price: price,
              quantity: item.qty || 1,
            };
          }),
        },
      });
    }
  }, [step, orderedItems, paidTotal]);

  // Order confirmation
  if (step === 3) {
    return (
      <Layout title="Order Confirmed | EVO Labs Research Canada">
        <section style={{ padding: '80px 0 120px', minHeight: '60vh' }}>
          <div className="container" style={{ maxWidth: 600, textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: '#eff6ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', border: '2px solid #dbeafe',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0a0a0a', marginBottom: 8, letterSpacing: '-0.02em' }}>
              Order Confirmed!
            </h1>
            <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 8, lineHeight: 1.6 }}>
              Thank you for your order. A confirmation email has been sent to <strong style={{ color: '#0a0a0a' }}>{form.email}</strong>.
            </p>
            <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 24, lineHeight: 1.6 }}>
              Your order number is <strong style={{ color: '#374151' }}>EVO-{Date.now().toString(36).toUpperCase()}</strong>.
              You&apos;ll receive shipping tracking information shortly.
            </p>

            {/* Loyalty points earned */}
            {paidTotal > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                border: '1.5px solid #fde68a', borderRadius: 14,
                padding: '16px 24px', marginBottom: 24,
                display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
              }}>
                <div style={{ fontSize: 32 }}>⭐</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#92400e', marginBottom: 2 }}>
                    You earned {Math.floor(paidTotal).toLocaleString()} EVO Points!
                  </div>
                  <div style={{ fontSize: 12, color: '#78350f' }}>
                    Redeemable on your next order — view in <Link href="/account" style={{ color: '#d97706', fontWeight: 700 }}>My Account</Link>
                  </div>
                </div>
              </div>
            )}

            {/* Order items summary */}
            {orderedItems.length > 0 && (
              <div style={{
                background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 14,
                padding: '20px 24px', marginBottom: 24, textAlign: 'left',
              }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0a0a0a', marginBottom: 14 }}>
                  Order Summary · {orderedItems.reduce((s, i) => s + (i.qty || 1), 0)} items
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {orderedItems.map((item, i) => {
                    const price = parseFloat((item.salePrice || item.price || '0').replace(/[^0-9.]/g, ''));
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={item.image} alt={item.name} style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 8, background: '#fff', border: '1px solid #f0f0f0', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{item.name}</div>
                          {item.dosage && <div style={{ fontSize: 11, color: '#9ca3af' }}>{item.dosage}</div>}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', flexShrink: 0 }}>
                          {(item.qty || 1)} × ${price.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#0a0a0a' }}>Total Paid</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: '#0F2A4A', fontFamily: "'DM Sans', sans-serif" }}>${paidTotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div style={{
              background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 14,
              padding: '20px 24px', marginBottom: 32, textAlign: 'left',
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0a0a0a', marginBottom: 12 }}>Shipping to</h3>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                {form.firstName} {form.lastName}<br />
                {form.address1}{form.address2 ? `, ${form.address2}` : ''}<br />
                {form.city}, {form.state} {form.zip}
              </p>
            </div>

            {/* What's next steps */}
            <div style={{
              background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 14,
              padding: '20px 24px', marginBottom: 24, textAlign: 'left',
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0a0a0a', marginBottom: 16 }}>What happens next?</h3>
              {[
                { step: '1', title: 'Order Processing', desc: 'Your order is being prepared and will be dispatched same business day if placed before 2pm EST.', color: '#0F2A4A' },
                { step: '2', title: 'Shipping Confirmation', desc: 'You\'ll receive an email with your tracking number once your order ships via USPS Priority or UPS Ground.', color: '#2563eb' },
                { step: '3', title: 'Delivery', desc: 'Most orders arrive within 2-5 business days. Cold-pack packaging included for temperature-sensitive compounds.', color: '#7c3aed' },
              ].map(s => (
                <div key={s.step} style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: s.color, color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, fontFamily: "'DM Sans', sans-serif" }}>{s.step}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a', marginBottom: 2 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
              <Link href="/track" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 12, fontWeight: 700, color: '#0F2A4A', textDecoration: 'none', borderBottom: '1px solid #0F2A4A', paddingBottom: 1 }}>
                Track your order →
              </Link>
            </div>

            {/* Share & Earn referral section */}
            {(() => {
              const referralCode = `EVO${(form.firstName || 'FRIEND').toUpperCase().slice(0, 4)}10`;
              const shareUrl = `https://evolabsresearch.ca?ref=${referralCode}`;
              const shareMsg = `I just ordered from EVO Labs Research — research-grade peptides with 99%+ purity. Use my code ${referralCode} for 10% off: ${shareUrl}`;
              const handleCopy = () => {
                navigator.clipboard?.writeText(shareUrl).then(() => {
                  setReferralCopied(true);
                  setTimeout(() => setReferralCopied(false), 2500);
                });
              };
              return (
                <div style={{
                  background: 'linear-gradient(135deg, #0d2218 0%, #0a1a1a 100%)',
                  border: '1.5px solid rgba(74,222,128,0.2)',
                  borderRadius: 14, padding: '20px 24px',
                  marginBottom: 24, textAlign: 'left',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(74,222,128,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                    Share &amp; Earn
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 4, lineHeight: 1.3 }}>
                    Give a friend 10% off. Earn $10 credit.
                  </h3>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 16, lineHeight: 1.5 }}>
                    When your friend orders using your link, you both save — and we&apos;ll add $10 to your account.
                  </p>
                  {/* Referral link input + copy */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <div style={{
                      flex: 1, padding: '9px 12px',
                      background: 'rgba(255,255,255,0.06)', borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: 12, color: 'rgba(255,255,255,0.6)',
                      fontFamily: 'monospace', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                    }}>
                      {shareUrl}
                    </div>
                    <button
                      onClick={handleCopy}
                      style={{
                        padding: '9px 16px', borderRadius: 8, border: 'none',
                        background: referralCopied ? '#0ea5e9' : '#0F2A4A',
                        color: '#fff', fontSize: 12, fontWeight: 700,
                        cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {referralCopied ? '✓ Copied!' : 'Copy Link'}
                    </button>
                  </div>
                  {/* Social share buttons */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Twitter / X', color: '#000', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMsg)}` },
                      { label: 'Facebook', color: '#1877f2', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
                      { label: 'WhatsApp', color: '#25d366', href: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMsg)}` },
                    ].map(s => (
                      <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{
                        padding: '7px 14px', borderRadius: 8,
                        background: s.color, color: '#fff',
                        fontSize: 11, fontWeight: 700, textDecoration: 'none',
                        fontFamily: "'DM Sans', sans-serif",
                      }}>
                        {s.label}
                      </a>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Newsletter discount code — shown if user opted in */}
            {discountCode && (
              <div style={{
                background: 'linear-gradient(135deg, #0a1f14, #0d2a1a)',
                border: '1.5px dashed rgba(74,222,128,0.35)',
                borderRadius: 14, padding: '20px 24px',
                marginBottom: 32, textAlign: 'center',
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(74,222,128,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                  Your Next Order Discount
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#06b6d4', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: 6 }}>
                  {discountCode}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                  10% off · one-time use · expires in 30 days
                </div>
              </div>
            )}

            <Link href="/products" className="btn-primary" style={{ padding: '14px 32px' }}>
              Continue Shopping &rarr;
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  // Empty cart redirect
  if (cart.length === 0 && step !== 3) {
    return (
      <Layout title="Checkout | EVO Labs Research Canada">
        <section style={{ padding: '80px 0 120px', minHeight: '60vh' }}>
          <div className="container" style={{ maxWidth: 600, textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Your cart is empty</p>
            <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 32 }}>Add some items before checking out.</p>
            <Link href="/products" className="btn-primary" style={{ padding: '14px 32px' }}>
              Browse Products &rarr;
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout title="Checkout | EVO Labs Research Canada" description="Complete your research order.">
      <section style={{ padding: '48px 0 120px', minHeight: '60vh' }}>
        <div className="container" style={{ maxWidth: 1080 }}>

          {/* Progress steps */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 48 }}>
            {[
              { num: 1, label: 'Shipping' },
              { num: 2, label: 'Payment' },
              { num: 3, label: 'Confirmation' },
            ].map(({ num, label }, i) => (
              <div key={num} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: step >= num ? '#0F2A4A' : '#e5e7eb',
                    color: step >= num ? '#fff' : '#9ca3af',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.3s',
                  }}>
                    {step > num ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    ) : num}
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: step >= num ? 700 : 500,
                    color: step >= num ? '#0a0a0a' : '#9ca3af',
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div style={{
                    width: 48, height: 2, margin: '0 16px',
                    background: step > num ? '#0F2A4A' : '#e5e7eb',
                    borderRadius: 1, transition: 'background 0.3s',
                  }} />
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'start' }} className="checkout-grid">

            {/* Left: Form */}
            <div>
              {step === 1 && (
                <form onSubmit={handleShippingSubmit}>
                  {/* Contact Info */}
                  <div style={{ marginBottom: 36 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0a0a0a', marginBottom: 20, letterSpacing: '-0.01em' }}>
                      Contact Information
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <InputField label="Email Address" type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" />
                      {isGuest && catalogMode === 'full_open' && (
                        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#065f46', lineHeight: 1.5 }}>
                          We&apos;ll create a free account for you so you can track your order. You&apos;ll receive an email to set your password.
                        </div>
                      )}
                      <InputField label="Phone Number" type="tel" required={catalogMode !== 'full_open'} value={form.phone} onChange={set('phone')} placeholder="(555) 123-4567" />
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div style={{ marginBottom: 36 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0a0a0a', marginBottom: 20, letterSpacing: '-0.01em' }}>
                      Shipping Address
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="checkout-name-grid">
                        <InputField label="First Name" required value={form.firstName} onChange={set('firstName')} placeholder="John" />
                        <InputField label="Last Name" required value={form.lastName} onChange={set('lastName')} placeholder="Doe" />
                      </div>
                      <InputField label="Address" required value={form.address1} onChange={set('address1')} placeholder="123 Main Street" />
                      <InputField label="Apartment, suite, etc." value={form.address2} onChange={set('address2')} placeholder="Apt 4B (optional)" />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 140px', gap: 16 }} className="checkout-city-grid">
                        <InputField label="City" required value={form.city} onChange={set('city')} placeholder="Toronto" />
                        <SelectField label="Province" required value={form.state} onChange={set('state')}>
                          <option value="">Select province...</option>
                          {CA_PROVINCES.map(s => <option key={s} value={s}>{s}</option>)}
                        </SelectField>
                        <InputField label="Postal Code" required value={form.zip} onChange={set('zip')} placeholder="M5V 3A8" pattern="[A-Z][0-9][A-Z] ?[0-9][A-Z][0-9]" />
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div style={{ marginBottom: 36 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0a0a0a', marginBottom: 20, letterSpacing: '-0.01em' }}>
                      Preferences
                    </h2>
                    <div style={{
                      background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 14,
                      padding: '20px', display: 'flex', flexDirection: 'column', gap: 16,
                    }}>
                      <Checkbox
                        checked={form.newsletter}
                        onChange={() => setForm({ ...form, newsletter: !form.newsletter })}
                        description="New product launches, research updates, and exclusive offers."
                      >
                        Email me news & promotions
                      </Checkbox>
                      <Checkbox
                        checked={form.smsUpdates}
                        onChange={() => setForm({ ...form, smsUpdates: !form.smsUpdates })}
                        description="Shipping updates & order notifications only. No spam, ever. You can opt out anytime."
                      >
                        Text me order & shipping updates
                      </Checkbox>
                    </div>
                  </div>

                  {/* Order notes */}
                  <div style={{ marginBottom: 36 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
                        Order Notes <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span>
                      </label>
                      <textarea
                        value={form.notes}
                        onChange={set('notes')}
                        rows={3}
                        placeholder="Any special instructions for your order..."
                        style={{
                          padding: '12px 14px', borderRadius: 10,
                          border: '1.5px solid #e5e7eb', fontSize: 14,
                          fontFamily: "'Anek Telugu', sans-serif",
                          outline: 'none', resize: 'vertical',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={e => e.target.style.borderColor = '#0F2A4A'}
                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%', background: '#0F2A4A', color: '#fff',
                      padding: '16px 24px', borderRadius: 12, fontSize: 15,
                      fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                      cursor: 'pointer', border: 'none',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#0a1f3d'}
                    onMouseLeave={e => e.currentTarget.style.background = '#0F2A4A'}
                  >
                    Continue to Payment &rarr;
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handlePaymentSubmit}>
                  {/* Shipping summary */}
                  <div style={{
                    background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 14,
                    padding: '20px', marginBottom: 32,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0a0a0a' }}>Shipping to</h3>
                      <button
                        type="button"
                        onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        style={{ fontSize: 12, color: '#0F2A4A', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Edit
                      </button>
                    </div>
                    <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                      {form.firstName} {form.lastName}<br />
                      {form.address1}{form.address2 ? `, ${form.address2}` : ''}<br />
                      {form.city}, {form.state} {form.zip}<br />
                      {form.phone}
                    </p>
                  </div>

                  {/* Shipping method */}
                  <div style={{ marginBottom: 32 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0a0a0a', marginBottom: 16, letterSpacing: '-0.01em' }}>
                      Shipping Method
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        { id: 'standard', label: 'USPS Priority Mail', time: '3-5 business days', price: promoFreeShip ? 'FREE' : '$9.99' },
                        { id: 'express', label: 'UPS Ground', time: '2-3 business days', price: '$14.99' },
                      ].map(m => (
                        <label key={m.id} onClick={() => setSelectedShipping(m.id)} style={{
                          display: 'flex', alignItems: 'center', gap: 14,
                          padding: '14px 16px', borderRadius: 12,
                          border: selectedShipping === m.id ? '2px solid #0F2A4A' : '1.5px solid #e5e7eb',
                          background: selectedShipping === m.id ? '#f0fdf8' : '#fff',
                          cursor: 'pointer',
                        }}>
                          <div style={{
                            width: 18, height: 18, borderRadius: '50%',
                            border: selectedShipping === m.id ? '5px solid #0F2A4A' : '2px solid #d1d5db',
                            flexShrink: 0,
                          }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a' }}>{m.label}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>{m.time}</div>
                          </div>
                          <span style={{
                            fontSize: 13, fontWeight: 700,
                            color: m.price === 'FREE' ? '#0ea5e9' : '#0a0a0a',
                            fontFamily: "'DM Sans', sans-serif",
                          }}>
                            {m.price}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Payment */}
                  <div style={{ marginBottom: 32 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0a0a0a', marginBottom: 16, letterSpacing: '-0.01em' }}>
                      Payment Method
                    </h2>

                    {/* Payment method tabs — only show enabled processors */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                      {/* Credit / Debit Card tab (Hummingbird) */}
                      {enabledProcessors.includes('hummingbird') && (
                      <button
                        type="button"
                        onClick={() => { setPaymentMethod('card'); setHbError(''); setLinkMoneyError(''); setStripeError(''); }}
                        style={{
                          flex: 1, minWidth: 120, padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                          border: paymentMethod === 'card' ? '2px solid #0F2A4A' : '1.5px solid #e5e7eb',
                          background: paymentMethod === 'card' ? '#f0fdf8' : '#fff',
                          textAlign: 'left', transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <div style={{
                            width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                            border: paymentMethod === 'card' ? '4px solid #0F2A4A' : '2px solid #d1d5db',
                          }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#0a0a0a', fontFamily: "'DM Sans', sans-serif" }}>
                            Credit / Debit Card
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 5, paddingLeft: 22, alignItems: 'center' }}>
                          <VisaLogo />
                          <MastercardLogo />
                          <AmexLogo />
                        </div>
                      </button>
                      )}
                      {/* Pay by Bank tab (LinkMoney) */}
                      {enabledProcessors.includes('linkmoney') && (
                      <button
                        type="button"
                        onClick={() => { setPaymentMethod('bank'); setHbError(''); setLinkMoneyError(''); setStripeError(''); }}
                        style={{
                          flex: 1, minWidth: 120, padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                          border: paymentMethod === 'bank' ? '2px solid #0F2A4A' : '1.5px solid #e5e7eb',
                          background: paymentMethod === 'bank' ? '#f0fdf8' : '#fff',
                          textAlign: 'left', transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <div style={{
                            width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                            border: paymentMethod === 'bank' ? '4px solid #0F2A4A' : '2px solid #d1d5db',
                          }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#0a0a0a', fontFamily: "'DM Sans', sans-serif" }}>
                            Pay by Bank (ACH)
                          </span>
                        </div>
                        <div style={{ paddingLeft: 22 }}>
                          <PlaidLogoInline />
                        </div>
                      </button>
                      )}
                      {/* Stripe tab — Apple Pay, Google Pay, Klarna, etc. */}
                      {STRIPE_ENABLED && enabledProcessors.includes('stripe') && (
                        <button
                          type="button"
                          onClick={() => { setPaymentMethod('stripe'); setHbError(''); setLinkMoneyError(''); setStripeError(''); }}
                          style={{
                            flex: 1, minWidth: 120, padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                            border: paymentMethod === 'stripe' ? '2px solid #635bff' : '1.5px solid #e5e7eb',
                            background: paymentMethod === 'stripe' ? '#f5f4ff' : '#fff',
                            textAlign: 'left', transition: 'all 0.15s',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <div style={{
                              width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                              border: paymentMethod === 'stripe' ? '4px solid #635bff' : '2px solid #d1d5db',
                            }} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#0a0a0a', fontFamily: "'DM Sans', sans-serif" }}>
                              Credit/Debit &amp; More
                            </span>
                          </div>
                          <div style={{ paddingLeft: 22, fontSize: 10, color: '#6b7280', fontFamily: "'DM Sans', sans-serif" }}>
                            Apple Pay · Google Pay · Klarna
                          </div>
                        </button>
                      )}
                    </div>

                    {/* Credit / Debit card via Hummingbird */}
                    {paymentMethod === 'card' && (
                      <div style={{ border: '1.5px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
                        <div style={{ padding: '16px', background: '#fff' }}>
                          {adyenError === 'card_unavailable' ? (
                            <div>
                              <div style={{
                                padding: '14px 16px', borderRadius: 10,
                                background: '#fffbeb', border: '1.5px solid #fde68a',
                                marginBottom: 12,
                              }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>
                                  Card payments are being activated
                                </div>
                                <div style={{ fontSize: 12, color: '#a16207', lineHeight: 1.5 }}>
                                  Our card processor is being set up. In the meantime, please use bank transfer — it&apos;s instant, free, and just as secure.
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => { setPaymentMethod('bank'); setHbError(''); }}
                                style={{
                                  width: '100%', padding: '11px 16px', borderRadius: 10,
                                  border: '1.5px solid #0F2A4A', background: '#f0fdf8',
                                  fontSize: 13, fontWeight: 700, color: '#0F2A4A',
                                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                                }}
                              >
                                Switch to Bank Transfer &rarr;
                              </button>
                            </div>
                          ) : (
                            <>
                              {!adyenReady && (
                                <div style={{ fontSize: 13, color: '#9ca3af', padding: '20px 0', textAlign: 'center' }}>
                                  Loading secure card form...
                                </div>
                              )}
                              <div ref={adyenContainerRef} style={{ minHeight: adyenReady ? 'auto' : 0 }} />
                              {hbError && (
                                <div style={{
                                  marginTop: 12, padding: '10px 14px', borderRadius: 8,
                                  background: '#fef2f2', border: '1px solid #fecaca',
                                  fontSize: 12, color: '#dc2626',
                                }}>
                                  {hbError}
                                </div>
                              )}
                            </>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <span style={{ fontSize: 11, color: '#6b7280' }}>256-bit SSL &bull; Card data never touches our servers</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bank account via Link Money */}
                    {paymentMethod === 'bank' && (
                      <div style={{ border: '1.5px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
                        <div style={{ padding: '20px 16px', background: '#fff' }}>
                          <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, margin: '0 0 14px' }}>
                            Securely link your bank account to complete payment. You&apos;ll be redirected to our payment partner to authorize the transfer — your banking credentials are never shared with us.
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <span style={{ fontSize: 11, color: '#6b7280' }}>Bank-grade encryption &bull; Powered by Link Money</span>
                          </div>
                          {linkMoneyError && (
                            <div style={{
                              marginTop: 14, padding: '10px 14px', borderRadius: 8,
                              background: '#fef2f2', border: '1px solid #fecaca',
                              fontSize: 12, color: '#dc2626',
                            }}>
                              {linkMoneyError}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stripe — Apple Pay, Google Pay, Klarna, cards, etc. */}
                    {STRIPE_ENABLED && paymentMethod === 'stripe' && (
                      <div style={{ border: '1.5px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
                        <div style={{ padding: '16px', background: '#fff' }}>
                          <StripePayment
                            amountCents={Math.round(effectiveTotal * 100)}
                            orderMetadata={{ email: form.email, name: `${form.firstName} ${form.lastName}` }}
                            onSuccess={handleStripeSuccess}
                            onError={(msg) => { setStripeError(msg); setPlacing(false); setStripeSubmitting(false); }}
                            submitting={stripeSubmitting}
                            setSubmitting={setStripeSubmitting}
                          />
                          {stripeError && (
                            <div style={{
                              marginTop: 12, padding: '10px 14px', borderRadius: 8,
                              background: '#fef2f2', border: '1px solid #fecaca',
                              fontSize: 12, color: '#dc2626',
                            }}>
                              {stripeError}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tracking note */}
                  <div style={{
                    background: '#fffbeb', border: '1.5px solid #fef3c7', borderRadius: 12,
                    padding: '14px 16px', marginBottom: 24,
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                  }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>📦</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 3 }}>Shipping Tracking</div>
                      <p style={{ fontSize: 11, color: '#a16207', lineHeight: 1.5, margin: 0 }}>
                        Once your order ships, you&apos;ll receive a tracking number via email{form.smsUpdates ? ' and text' : ''}.
                        All orders ship same-day if placed before 2pm EST on business days.
                      </p>
                    </div>
                  </div>

                  {/* ── Order Bump ── */}
                  {(() => {
                    const bacWater = products.find(p => p.slug === 'bac-water-10-ml');
                    const alreadyInCart = cart.some(i => i.slug === 'bac-water-10-ml');
                    if (!bacWater || alreadyInCart) return null;
                    return (
                      <div style={{
                        border: `2px dashed ${bumpAdded ? '#0ea5e9' : '#0F2A4A'}`,
                        borderRadius: 12, padding: '16px', marginBottom: 24,
                        background: bumpAdded ? '#eff6ff' : '#f0fdf8',
                        transition: 'all 0.2s ease',
                      }}>
                        <label style={{ display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={bumpAdded}
                            onChange={e => {
                              setBumpAdded(e.target.checked);
                              if (e.target.checked) addItem(bacWater, { dosage: '', bundleCount: 1 });
                            }}
                            style={{ width: 18, height: 18, accentColor: '#0F2A4A', flexShrink: 0, cursor: 'pointer' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#0F2A4A', marginBottom: 3 }}>
                              YES — Add Bacteriostatic Water 10mL for just $12.99!
                            </div>
                            <p style={{ fontSize: 11, color: '#374151', lineHeight: 1.5, margin: 0 }}>
                              Essential for peptide reconstitution. 0.9% benzyl alcohol — the standard for research laboratories. Tick the box to add it to your order.
                            </p>
                          </div>
                          <div style={{ flexShrink: 0, textAlign: 'right' }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: '#0F2A4A', fontFamily: "'DM Sans', sans-serif" }}>$12.99</div>
                          </div>
                        </label>
                      </div>
                    );
                  })()}

                  <Checkbox
                    checked={ruoAgreed}
                    onChange={e => setRuoAgreed(e.target.checked)}
                  >
                    I confirm these products are for research use only, not for human consumption, and are not approved by Health Canada.
                  </Checkbox>

                  <button
                    type="submit"
                    disabled={placing || !ruoAgreed}
                    style={{
                      width: '100%', background: (placing || !ruoAgreed) ? '#6b7280' : '#0F2A4A', color: '#fff',
                      padding: '16px 24px', borderRadius: 12, fontSize: 15,
                      fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                      cursor: (placing || !ruoAgreed) ? 'not-allowed' : 'pointer', border: 'none',
                      transition: 'background 0.2s', opacity: (placing || !ruoAgreed) ? 0.5 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >
                    {placing ? (
                      <>
                        <span style={{
                          width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: '#fff', borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite', display: 'inline-block',
                        }} />
                        Processing...
                      </>
                    ) : (
                      <>
                        {paymentMethod === 'card'
                          ? `Pay $${effectiveTotal.toFixed(2)}`
                          : paymentMethod === 'stripe'
                          ? `Pay $${effectiveTotal.toFixed(2)}`
                          : `Continue to Bank Linking — $${effectiveTotal.toFixed(2)}`}
                      </>
                    )}
                  </button>

                  {!ruoAgreed && placing && (
                    <p style={{ fontSize: 11, color: '#ef4444', textAlign: 'center', marginTop: 8, lineHeight: 1.5 }}>
                      You must acknowledge the research use policy to proceed.
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Right: Order Summary */}
            <div style={{
              background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 16,
              padding: '28px', position: 'sticky', top: 100,
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0a0a0a', marginBottom: 20 }}>
                Order Summary
              </h2>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                {cart.map((item, idx) => {
                  const price = parseFloat((item.salePrice || item.price || '0').replace(/[^0-9.]/g, ''));
                  return (
                    <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{
                        width: 52, height: 52, flexShrink: 0,
                        borderRadius: 10, background: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid #f0f0f0', position: 'relative',
                      }}>
                        <img src={item.image} alt={item.name} style={{ width: '78%', height: '78%', objectFit: 'contain' }} />
                        {(item.qty || 1) > 1 && (
                          <span style={{
                            position: 'absolute', top: -6, right: -6,
                            background: '#0F2A4A', color: '#fff',
                            fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                            width: 20, height: 20, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>{item.qty}</span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a' }}>{item.name}</div>
                        {item.dosage && (
                          <div style={{ fontSize: 11, color: '#9ca3af' }}>{item.dosage}</div>
                        )}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0a0a0a', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
                        ${(price * (item.qty || 1)).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ height: 1, background: '#e5e7eb', marginBottom: 16 }} />

              {/* Promo code input */}
              {step !== 3 && (
                <div style={{ marginBottom: 16 }}>
                  {promoApplied ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px 14px' }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#0ea5e9', fontFamily: "'DM Sans', sans-serif" }}>
                          🏷️ {promoApplied.code}
                          {promoFreeShip && promoApplied.type !== 'free_shipping' && (
                            <span style={{ marginLeft: 8, fontSize: 11, color: '#1d4ed8', background: '#eff6ff', borderRadius: 6, padding: '2px 6px' }}>🚚 + Free shipping</span>
                          )}
                          {promoApplied.type === 'free_shipping' && (
                            <span style={{ marginLeft: 8, fontSize: 11, color: '#1d4ed8' }}>🚚 Free shipping</span>
                          )}
                        </span>
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{promoApplied.description}</div>
                      </div>
                      <button onClick={() => setPromoApplied(null)} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#6b7280', padding: '0 4px' }}>✕</button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text" placeholder="Promo code"
                        value={promoInput} onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                        style={{
                          flex: 1, padding: '9px 12px', border: `1.5px solid ${promoError ? '#fca5a5' : '#e5e7eb'}`,
                          borderRadius: 10, fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                          outline: 'none', textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}
                      />
                      <button type="submit" disabled={promoLoading || !promoInput.trim()}
                        style={{
                          padding: '9px 16px', background: '#0F2A4A', color: '#fff',
                          border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700,
                          cursor: promoLoading ? 'wait' : 'pointer', whiteSpace: 'nowrap',
                          fontFamily: "'DM Sans', sans-serif", opacity: (!promoInput.trim() || promoLoading) ? 0.6 : 1,
                        }}>Apply</button>
                    </form>
                  )}
                  {promoError && <p style={{ fontSize: 11, color: '#dc2626', marginTop: 6, margin: '6px 0 0' }}>{promoError}</p>}
                </div>
              )}

              {/* Loyalty points redemption */}
              {step !== 3 && loyaltyBalance >= 500 && (
                <div style={{ marginBottom: 16 }}>
                  {loyaltyRedeemed > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px' }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e', fontFamily: "'DM Sans', sans-serif" }}>
                          ⭐ {loyaltyRedeemed.toLocaleString()} pts redeemed
                        </span>
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>−${loyaltyDiscount.toFixed(2)} off your order</div>
                      </div>
                      <button
                        onClick={() => setLoyaltyRedeemed(0)}
                        style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#6b7280', padding: '0 4px' }}
                      >✕</button>
                    </div>
                  ) : (
                    <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 8 }}>
                        ⭐ You have {loyaltyBalance.toLocaleString()} EVO Points
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {[500, 1000, 2500].filter(t => t <= loyaltyBalance).map(tier => {
                          const dollarOff = (tier * 0.01).toFixed(2);
                          return (
                            <button
                              key={tier}
                              onClick={() => setLoyaltyRedeemed(tier)}
                              style={{
                                padding: '6px 12px', background: '#fff',
                                border: '1.5px solid #fbbf24', borderRadius: 8,
                                fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                color: '#92400e', fontFamily: "'DM Sans', sans-serif",
                                transition: 'all 0.15s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#fef3c7'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                            >
                              {tier.toLocaleString()} pts = −${dollarOff}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Subtotal</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
              </div>
              {volumeDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: '#0ea5e9' }}>🏷️ Multi-vial savings</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0ea5e9' }}>−${volumeDiscount.toFixed(2)}</span>
                </div>
              )}
              {promoApplied && discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: '#0ea5e9' }}>Discount ({promoApplied.code})</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0ea5e9' }}>−${discountAmount.toFixed(2)}</span>
                </div>
              )}
              {loyaltyRedeemed > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: '#d97706' }}>⭐ EVO Points ({loyaltyRedeemed.toLocaleString()} pts)</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#d97706' }}>−${loyaltyDiscount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Shipping</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: (effectiveShipping === 0) ? '#0ea5e9' : '#0a0a0a' }}>
                  {effectiveShipping === 0 ? 'FREE' : `$${effectiveShipping.toFixed(2)}`}
                  {promoFreeShip && effectiveShipping === 0 && <span style={{ fontSize: 10, color: '#0ea5e9', marginLeft: 4 }}>(promo)</span>}
                </span>
              </div>

              <div style={{ height: 1, background: '#e5e7eb', margin: '14px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ fontSize: 16, fontWeight: 800 }}>Total</span>
                <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "'DM Sans', sans-serif" }}>
                  ${effectiveTotal.toFixed(2)}
                </span>
              </div>

              {/* Loyalty points preview */}
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>⭐</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0ea5e9' }}>
                    Earn {Math.floor(effectiveTotal)} reward points on this order
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>
                    1 pt per $1 · Redeem for discounts on future orders
                  </div>
                </div>
              </div>

              {/* Trust signals */}
              <div style={{ paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
                {[
                  { icon: '🔒', text: 'SSL encrypted checkout' },
                  { icon: '⚖️', text: 'Net purity & content verified' },
                  { icon: '📋', text: 'COA included with every order' },
                ].map(b => (
                  <div key={b.text} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 11, color: '#6b7280', marginBottom: 8,
                  }}>
                    <span>{b.icon}</span>
                    {b.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
          .checkout-name-grid { grid-template-columns: 1fr !important; }
          .checkout-city-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  );
}
