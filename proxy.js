import { NextResponse } from 'next/server';

/**
 * Global middleware — runs on every request.
 *
 * 1. Affiliate cookie: if ?ref=CODE is in the URL, set __evo_aff cookie (30 days).
 *    The cookie is then read at checkout / WooCommerce webhook to credit the partner.
 *
 * 2. (Future) Rate limiting, geo-blocking, etc.
 */
export function proxy(request) {
  const { searchParams } = new URL(request.url);
  const refCode = searchParams.get('ref');

  const response = NextResponse.next();

  if (refCode) {
    const normalized = refCode.toUpperCase().slice(0, 32);
    const cookieOpts = {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    };
    // Set both cookie names for backward-compat
    response.cookies.set('__evo_aff', normalized, cookieOpts);
    response.cookies.set('evo_ref',   normalized, cookieOpts);
  }

  return response;
}

// Run on all pages but skip static files and Next internals
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
};
