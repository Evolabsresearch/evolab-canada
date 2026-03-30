/**
 * POST /api/admin/upload
 * Accepts a multipart file upload and stores it in Supabase Storage.
 * Returns { url } — the public CDN URL.
 */
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { getSupabaseAdmin } from '../../../lib/supabase';
import { isAdminAuthed } from './_auth';

export const config = { api: { bodyParser: false } };

const ALLOWED = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!isAdminAuthed(req)) return res.status(401).json({ error: 'Unauthorized' });

  const form = new IncomingForm({ maxFileSize: MAX_SIZE, keepExtensions: true });

  form.parse(req, async (err, _fields, files) => {
    if (err) return res.status(400).json({ error: err.message });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) return res.status(400).json({ error: 'No file provided' });

    const mime = file.mimetype || '';
    const ext = ALLOWED[mime];
    if (!ext) return res.status(400).json({ error: 'Unsupported file type. Use JPG, PNG, WEBP, or GIF.' });

    try {
      const buffer = fs.readFileSync(file.filepath);
      const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      const supabase = getSupabaseAdmin();

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, buffer, { contentType: mime, upsert: false });

      if (uploadError) return res.status(500).json({ error: uploadError.message });

      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
      return res.status(200).json({ url: data.publicUrl });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
}
