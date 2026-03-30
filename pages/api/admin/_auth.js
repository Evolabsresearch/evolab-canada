/**
 * Admin API auth helper — checks Authorization header against ADMIN_SECRET env var
 * Usage: if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });
 */
export function isAdminAuthed(req) {
  const secret = process.env.ADMIN_SECRET || process.env.NEXT_PUBLIC_ADMIN_PW;
  if (!secret) return false;
  const auth = req.headers.authorization;
  if (!auth) return false;
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  return token === secret;
}
