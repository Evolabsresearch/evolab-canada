import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';
import { SupabaseAdapter } from '@next-auth/supabase-adapter';
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';
import { triggerEvent, upsertContact } from '../../../lib/omnisend';

async function sendBrandedVerificationRequest({ identifier: email, url, provider }) {
  // Use SendGrid Web API — avoids SMTP 535 auth errors on free/trial accounts

  const escapedEmail = email.replace(/\./g, '&#8203;.');
  const brandColor = '#1B4D3E';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sign in to EVO Labs Research</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Logo Header -->
        <tr>
          <td align="center" style="padding:0 0 24px 0;">
            <img src="https://evolabsresearch.cam/images/evo-logo.png"
              alt="EVO Labs Research" width="120" height="auto"
              style="display:block;max-width:120px;" />
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

            <!-- Green top bar -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="background:${brandColor};height:5px;font-size:0;">&nbsp;</td></tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:40px 48px 32px;">
                  <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0f1117;letter-spacing:-0.02em;">
                    Sign in to EVO Labs Research
                  </h1>
                  <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6;">
                    Click the button below to securely sign in to your account.<br/>
                    This link expires in <strong>24 hours</strong> and can only be used once.
                  </p>

                  <!-- CTA Button -->
                  <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                    <tr>
                      <td style="background:${brandColor};border-radius:10px;">
                        <a href="${url}"
                          style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.01em;">
                          Sign In to My Account →
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0 0 6px;font-size:13px;color:#9ca3af;line-height:1.5;">
                    If you didn't request this email, you can safely ignore it — your account is secure.
                  </p>
                  <p style="margin:0;font-size:12px;color:#d1d5db;word-break:break-all;">
                    Or copy this link: <span style="color:#6b7280;">${url}</span>
                  </p>
                </td>
              </tr>
            </table>

            <!-- Divider -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="height:1px;background:#f3f4f6;font-size:0;">&nbsp;</td></tr>
            </table>

            <!-- Footer info -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:20px 48px 32px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding-right:16px;vertical-align:top;">
                        <div style="width:2px;height:40px;background:${brandColor};border-radius:1px;"></div>
                      </td>
                      <td style="vertical-align:top;">
                        <p style="margin:0;font-size:13px;font-weight:700;color:#0f1117;">EVO Labs Research LLC</p>
                        <p style="margin:2px 0 0;font-size:12px;color:#9ca3af;line-height:1.6;">
                          8270 Woodland Center Blvd, Tampa, FL 33614<br/>
                          support@evolabsresearch.cam
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Bottom note -->
        <tr>
          <td align="center" style="padding:20px 0 0;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">
              Sent to ${escapedEmail} · EVO Labs Research LLC · Tampa, FL 33614<br/>
              <a href="https://evolabsresearch.cam" style="color:#9ca3af;text-decoration:underline;">evolabsresearch.cam</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Sign in to EVO Labs Research\n\nClick this link to sign in:\n${url}\n\nThis link expires in 24 hours.\n\nIf you didn't request this, ignore this email.\n\n---\nEVO Labs Research LLC\n8270 Woodland Center Blvd, Tampa, FL 33614\nsupport@evolabsresearch.cam`;

  const fromRaw = process.env.EMAIL_FROM || 'EVO Labs Research <support@evolabsresearch.cam>';
  const fromMatch = fromRaw.match(/^(.*?)\s*<(.+)>$/);
  const fromName = fromMatch ? fromMatch[1].trim() : 'EVO Labs Research';
  const fromEmail = fromMatch ? fromMatch[2].trim() : fromRaw;

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email }] }],
      from: { email: fromEmail, name: fromName },
      subject: 'Sign in to EVO Labs Research',
      content: [
        { type: 'text/plain', value: text },
        { type: 'text/html', value: html },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SendGrid API error ${res.status}: ${body}`);
  }
}

export const authOptions = {
  providers: [
    // ── Admin credentials (allows admin to have a NextAuth session) ──────
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'evolabs13@gmail.com';
        const adminPw = process.env.NEXT_PUBLIC_ADMIN_PW || 'Baseball@123';
        if (
          credentials?.email?.toLowerCase() === adminEmail.toLowerCase() &&
          credentials?.password === adminPw
        ) {
          return { id: 'admin', email: adminEmail, name: 'Admin' };
        }
        return null;
      },
    }),

    // ── Email magic link (via SendGrid HTTP API) ─────────────────────────
    // Env vars needed in Vercel:
    //   SENDGRID_API_KEY=SG.xxxx
    //   EMAIL_FROM=EVO Labs Research <support@evolabsresearch.cam>
    EmailProvider({
      server: 'smtp://placeholder:placeholder@placeholder:587', // unused — sendVerificationRequest handles sending
      from: process.env.EMAIL_FROM || 'EVO Labs Research <support@evolabsresearch.cam>',
      sendVerificationRequest: sendBrandedVerificationRequest,
    }),

    // ── Phone OTP ────────────────────────────────────────────────────────
    CredentialsProvider({
      id: 'phone-otp',
      name: 'Phone OTP',
      credentials: {
        phone: { label: 'Phone', type: 'tel' },
        code: { label: 'Code', type: 'text' },
      },
      async authorize(credentials) {
        let { phone, code } = credentials || {};
        if (!phone || !code) return null;

        // NextAuth sends credentials as form-urlencoded, so '+' in phone
        // gets decoded as a space. Restore the '+' E.164 prefix.
        phone = phone.trim().replace(/^\s/, '+');
        if (!phone.startsWith('+')) phone = `+${phone}`;

        // Verify code via Twilio Verify
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        let check;
        try {
          check = await client.verify.v2
            .services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verificationChecks.create({ to: phone, code });
        } catch (err) {
          console.error('Twilio verify check error:', err);
          return null;
        }
        if (check.status !== 'approved') return null;

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Find or create a user record in Supabase keyed to their phone
        const pseudoEmail = `${phone.replace(/\+/g, '')}@phone.evolabsresearch.cam`;

        let { data: user } = await supabase
          .from('users')
          .select('id, email, name')
          .eq('email', pseudoEmail)
          .single();

        const isNewUser = !user;
        if (!user) {
          const { data: newUser } = await supabase
            .from('users')
            .insert({ email: pseudoEmail, name: phone })
            .select('id, email, name')
            .single();
          user = newUser;
        }

        // Fire welcome series for new phone users
        if (isNewUser && user) {
          try {
            await upsertContact({ email: pseudoEmail, phone });
            await triggerEvent(pseudoEmail, 'welcomeSeriesStart', {
              firstName: '',
              email: pseudoEmail,
              signupDate: new Date().toISOString(),
              discountCode: 'WELCOME10',
            });
          } catch (_) {}
        }

        return user ? { id: user.id, email: pseudoEmail, name: user.name, phone } : null;
      },
    }),
  ],

  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }),

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.phone = user.phone || null;

        // Fetch affiliate/partner data
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        const { data: partner } = await supabase
          .from('partners')
          .select('referral_code, commission_rate, status')
          .eq('user_id', user.id)
          .single();
        if (partner) {
          token.isPartner = true;
          token.referralCode = partner.referral_code;
          token.commissionRate = partner.commission_rate;
          token.partnerStatus = partner.status;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId;
      session.user.phone = token.phone || null;
      session.user.isPartner = token.isPartner || false;
      session.user.referralCode = token.referralCode || null;
      session.user.commissionRate = token.commissionRate || 0;
      return session;
    },
  },

  events: {
    async createUser({ user }) {
      // Fire welcome series when a new email/magic-link user is created
      const email = user.email;
      if (!email || email.endsWith('@phone.evolabsresearch.cam')) return;
      try {
        await upsertContact({ email });
        await triggerEvent(email, 'welcomeSeriesStart', {
          firstName: user.name?.split(' ')[0] || '',
          email,
          signupDate: new Date().toISOString(),
          discountCode: 'WELCOME10',
        });
      } catch (_) {}
    },
  },

  pages: {
    signIn: '/account/login',
    verifyRequest: '/account/verify-email',
    error: '/account/auth-error',
  },

  theme: {
    colorScheme: 'dark',
    brandColor: '#1B4D3E',
    logo: '/images/evo-logo.png',
  },
};

export default NextAuth(authOptions);
