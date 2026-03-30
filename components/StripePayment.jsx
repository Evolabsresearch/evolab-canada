import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

let stripePromise;
function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

const STRIPE_APPEARANCE = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#1B4D3E',
    colorBackground: '#ffffff',
    colorText: '#0a0a0a',
    colorDanger: '#dc2626',
    fontFamily: "'Poppins', system-ui, sans-serif",
    borderRadius: '8px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': { border: '1.5px solid #e5e7eb', padding: '10px 12px' },
    '.Input:focus': { border: '1.5px solid #1B4D3E', boxShadow: '0 0 0 2px rgba(27,77,62,0.12)' },
    '.Label': { fontWeight: '600', fontSize: '12px', color: '#374151' },
    '.Tab': { border: '1.5px solid #e5e7eb', borderRadius: '8px' },
    '.Tab--selected': { border: '1.5px solid #1B4D3E', backgroundColor: '#f0fdf8' },
  },
};

// Inner form — rendered inside <Elements>
function CheckoutForm({ onSuccess, onError, submitting, setSubmitting }) {
  const stripe = useStripe();
  const elements = useElements();

  // Exposed so parent can trigger submit
  useEffect(() => {
    if (!submitting) return;
    (async () => {
      if (!stripe || !elements) { setSubmitting(false); return; }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'Payment failed. Please try again.');
        setSubmitting(false);
      } else if (paymentIntent?.status === 'succeeded') {
        onSuccess(paymentIntent);
      } else {
        onError('Payment could not be completed. Please try again.');
        setSubmitting(false);
      }
    })();
  }, [submitting]);

  return (
    <div>
      <PaymentElement
        options={{
          layout: 'tabs',
          wallets: { applePay: 'auto', googlePay: 'auto' },
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span style={{ fontSize: 11, color: '#6b7280', fontFamily: "'Poppins', sans-serif" }}>
          256-bit SSL &bull; Powered by Stripe &bull; Apple Pay, Google Pay, Klarna &amp; more
        </span>
      </div>
    </div>
  );
}

// Outer wrapper — creates PaymentIntent and provides Elements context
export default function StripePayment({ amountCents, orderMetadata, onSuccess, onError, submitting, setSubmitting }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    if (!amountCents || amountCents < 50) return;
    setLoading(true);
    setInitError(null);

    fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amountCents, metadata: orderMetadata }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setClientSecret(data.clientSecret);
      })
      .catch(err => {
        console.error(err);
        setInitError('Could not initialize payment. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [amountCents]);

  if (loading) {
    return (
      <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 13, color: '#9ca3af', fontFamily: "'Poppins', sans-serif" }}>
        Loading secure payment form...
      </div>
    );
  }

  if (initError) {
    return (
      <div style={{ padding: '12px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 12, color: '#dc2626', fontFamily: "'Poppins', sans-serif" }}>
        {initError}
      </div>
    );
  }

  if (!clientSecret) return null;

  return (
    <Elements
      stripe={getStripe()}
      options={{ clientSecret, appearance: STRIPE_APPEARANCE }}
    >
      <CheckoutForm
        onSuccess={onSuccess}
        onError={onError}
        submitting={submitting}
        setSubmitting={setSubmitting}
      />
    </Elements>
  );
}
