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
          href="https://fonts.googleapis.com/css2?family=Anek+Telugu:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap"
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
        {/* Google Analytics 4 */}
        {GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}', { page_path: window.location.pathname });
                `,
              }}
            />
          </>
        )}
        {/* Omnisend web tracking */}
        {OMNISEND_BRAND_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.omnisend = window.omnisend || [];
                omnisend.push(["accountID", "${OMNISEND_BRAND_ID}"]);
                omnisend.push(["track", "$pageViewed"]);
                !function(){var e=document.createElement("script");e.type="text/javascript",e.async=!0,e.src="https://omnisend-webpush-and-forms.omnisend.com/omnisend.js",document.head.appendChild(e)}();
              `,
            }}
          />
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
