import { Html, Head, Main, NextScript } from "next/document";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const OMNISEND_BRAND_ID = process.env.NEXT_PUBLIC_OMNISEND_BRAND_ID;

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer = window.dataLayer || [];` }} />
        {/* Google reCAPTCHA v3 — invisible, zero friction */}
        {RECAPTCHA_SITE_KEY && (
          <script
            async
            src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
          />
        )}
        {/* Google Analytics 4 and Omnisend are loaded conditionally in _app.tsx after cookie consent */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
