import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { SessionProvider } from "next-auth/react";
import { CartProvider, useCart } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import { RecentlyViewedProvider } from "../context/RecentlyViewedContext";
import { CompareProvider } from "../context/CompareContext";
import LoginGateModal from "../components/LoginGateModal";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

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

  return (
    <SessionProvider session={session}>
      <CartProvider>
        <WishlistProvider>
          <RecentlyViewedProvider>
            <CompareProvider>
              <Component {...pageProps} />
              <GateModalWrapper />
              <Analytics />
              <SpeedInsights />
            </CompareProvider>
          </RecentlyViewedProvider>
        </WishlistProvider>
      </CartProvider>
    </SessionProvider>
  );
}
