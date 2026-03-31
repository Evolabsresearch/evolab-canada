import "@/styles/globals.css";
import type { AppProps } from "next/app";

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}
import { useEffect } from "react";
import { useRouter } from "next/router";
import { SessionProvider } from "next-auth/react";
import { CartProvider, useCart } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import { RecentlyViewedProvider } from "../context/RecentlyViewedContext";
import { CompareProvider } from "../context/CompareContext";
import LoginGateModal from "../components/LoginGateModal";
import AgeGate from "../components/AgeGate";
import CookieConsent from "../components/CookieConsent";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const OMNISEND_BRAND_ID = process.env.NEXT_PUBLIC_OMNISEND_BRAND_ID;

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && GA_ID) {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push(args);
  }
}

// Renders the login gate modal using cart context
function GateModalWrapper() {
  const { gateOpen, setGateOpen } = useCart();
  return <LoginGateModal open={gateOpen} onClose={() => setGateOpen(false)} />;
}

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ ecommerce: null });
        window.dataLayer.push({
          event: 'page_view',
          page_title: document.title,
          page_path: url,
          page_url: window.location.origin + url,
        });
      }
      if (GA_ID) {
        gtag("event", "page_view", { page_path: url });
      }
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router.events]);

  // Capture affiliate/referral ref param on first visit and persist to sessionStorage
  useEffect(() => {
    const ref = router.query.ref as string | undefined;
    if (ref && typeof window !== "undefined") {
      sessionStorage.setItem("evo_ref", ref.toUpperCase());
    }
  }, [router.query.ref]);

  // Conditionally load GA4 and Omnisend after cookie consent
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadGAAndOmnisend = () => {
      const consent = localStorage.getItem("evo_cookie_consent");
      if (consent === "all") {
        // Load Google Analytics 4
        if (GA_ID) {
          const script1 = document.createElement("script");
          script1.async = true;
          script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
          document.head.appendChild(script1);

          const script2 = document.createElement("script");
          script2.textContent = `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { page_path: window.location.pathname });
            `;
          document.head.appendChild(script2);
        }

        // Load Omnisend
        if (OMNISEND_BRAND_ID) {
          const script3 = document.createElement("script");
          script3.textContent = `
              window.omnisend = window.omnisend || [];
              omnisend.push(["accountID", "${OMNISEND_BRAND_ID}"]);
              omnisend.push(["track", "$pageViewed"]);
              !function(){var e=document.createElement("script");e.type="text/javascript",e.async=!0,e.src="https://omnisend-webpush-and-forms.omnisend.com/omnisend.js",document.head.appendChild(e)}();
            `;
          document.head.appendChild(script3);
        }
      }
    };

    // Check on mount
    loadGAAndOmnisend();

    // Listen for consent grant event
    window.addEventListener("evo:cookie-consent-granted", loadGAAndOmnisend);
    return () => {
      window.removeEventListener("evo:cookie-consent-granted", loadGAAndOmnisend);
    };
  }, []);

  return (
    <SessionProvider session={session}>
      <CartProvider>
        <WishlistProvider>
          <RecentlyViewedProvider>
            <CompareProvider>
              <AgeGate />
              <Component {...pageProps} />
              <GateModalWrapper />
              <CookieConsent />
              <Analytics />
              <SpeedInsights />
            </CompareProvider>
          </RecentlyViewedProvider>
        </WishlistProvider>
      </CartProvider>
    </SessionProvider>
  );
}
