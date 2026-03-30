// Shared in-memory store for newsletter discount codes
// This module is a singleton — the same Map persists across all API routes
// in the same Node.js process. In production, replace with Supabase.

/** @type {Map<string, { code: string, ip: string, createdAt: string }>} */
export const usedEmails = new Map(); // email.toLowerCase() -> { code, ip, createdAt }

/** @type {Map<string, string>} */
const codeToEmail = new Map(); // code.toUpperCase() -> email

/**
 * Register a new email + code pair
 * @param {string} email
 * @param {string} code
 * @param {string} ip
 */
export function registerCode(email, code, ip) {
  const key = email.toLowerCase();
  usedEmails.set(key, { code, ip, createdAt: new Date().toISOString() });
  codeToEmail.set(code.toUpperCase(), key);
}

/**
 * Get stored data for an email, or null if not registered
 * @param {string} email
 */
export function getByEmail(email) {
  return usedEmails.get(email.toLowerCase()) || null;
}

/**
 * Check whether a discount code is a valid newsletter code
 * @param {string} code
 * @returns {boolean}
 */
export function getNewsletterCode(code) {
  return codeToEmail.has(code.toUpperCase());
}
