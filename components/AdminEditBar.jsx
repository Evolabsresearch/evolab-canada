import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';

const STORAGE_KEY       = 'evo_content_edits';
const COLOR_KEY         = 'evo_color_edits';
const RECENT_COLORS_KEY = 'evo_recent_colors';
const UNDO_KEY          = 'evo_undo_stack';
const ADMIN_EMAIL       = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'evolabs13@gmail.com';

const EDITABLE_TAGS = new Set([
  'H1','H2','H3','H4','H5','H6','P','SPAN','A','LI','BUTTON','LABEL',
  'STRONG','EM','TD','TH','CAPTION','FIGCAPTION','BLOCKQUOTE','DIV',
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

function isAdminUser(session) {
  if (typeof window === 'undefined') return false;
  const hasPw = !!localStorage.getItem('evo_admin_pw');
  const hasCookie = document.cookie.includes('evo_admin=1');
  // Both localStorage AND cookie must be present — prevents stale toolbar after logout
  if (hasPw && hasCookie) return true;
  if (session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() && hasCookie) return true;
  return false;
}

function getPageKey() { return window.location.pathname; }

function getElementPath(el) {
  if (el.id) return '#' + el.id;
  const path = [];
  let node = el;
  while (node && node.nodeType === 1 && node !== document.body) {
    const parent = node.parentElement;
    if (!parent) break;
    const tag = node.tagName.toLowerCase();
    const siblings = Array.from(parent.children).filter(c => c.tagName === node.tagName);
    const idx = siblings.indexOf(node) + 1;
    path.unshift(siblings.length > 1 ? `${tag}:nth-of-type(${idx})` : tag);
    node = parent;
  }
  return path.join('>');
}

// Content edits (text / image src)
function loadPageEdits() {
  try { return (JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'))[getPageKey()] || {}; }
  catch { return {}; }
}
function savePageEdit(selector, type, value) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const pk = getPageKey();
    if (!all[pk]) all[pk] = {};
    all[pk][selector] = { type, value };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}
}
function clearPageEdits() {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    delete all[getPageKey()];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

// Color edits
function loadColorEdits() {
  try { return (JSON.parse(localStorage.getItem(COLOR_KEY) || '{}'))[getPageKey()] || {}; }
  catch { return {}; }
}
function saveColorEdit(selector, prop, value) {
  try {
    const all = JSON.parse(localStorage.getItem(COLOR_KEY) || '{}');
    const pk = getPageKey();
    if (!all[pk]) all[pk] = {};
    if (!all[pk][selector]) all[pk][selector] = {};
    all[pk][selector][prop] = value;
    localStorage.setItem(COLOR_KEY, JSON.stringify(all));
  } catch {}
}
function clearColorEdits() {
  try {
    const all = JSON.parse(localStorage.getItem(COLOR_KEY) || '{}');
    delete all[getPageKey()];
    localStorage.setItem(COLOR_KEY, JSON.stringify(all));
  } catch {}
}

// Recent colors
function loadRecentColors() {
  try { return JSON.parse(localStorage.getItem(RECENT_COLORS_KEY) || '[]'); }
  catch { return []; }
}
function pushRecentColor(hex) {
  try {
    let r = loadRecentColors().filter(c => c !== hex);
    r.unshift(hex);
    localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(r.slice(0, 12)));
  } catch {}
}

// Undo stack
function loadUndoStack() {
  try { return JSON.parse(localStorage.getItem(UNDO_KEY) || '[]'); } catch { return []; }
}
function pushUndo(entry) {
  try {
    const stack = loadUndoStack();
    stack.push(entry);
    localStorage.setItem(UNDO_KEY, JSON.stringify(stack.slice(-30))); // max 30
  } catch {}
}
function popUndo() {
  try {
    const stack = loadUndoStack();
    const entry = stack.pop();
    localStorage.setItem(UNDO_KEY, JSON.stringify(stack));
    return entry;
  } catch { return null; }
}
function getUndoCount() {
  return loadUndoStack().filter(e => e.page === getPageKey()).length;
}

// Color utils
function rgbToHex(rgb) {
  const m = rgb.match(/\d+/g);
  if (!m || m.length < 3) return '';
  return '#' + m.slice(0, 3).map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
}
function getComputedHex(el, prop) {
  const s = window.getComputedStyle(el);
  const raw = prop === 'text' ? s.color : prop === 'background' ? s.backgroundColor : s.borderTopColor;
  return rgbToHex(raw) || '#000000';
}
function isValidHex(h) { return /^#[0-9a-fA-F]{6}$/.test(h); }

// Apply saved edits on page load
function applyAllEdits() {
  // Text / image
  const edits = loadPageEdits();
  Object.entries(edits).forEach(([sel, edit]) => {
    try {
      const el = document.querySelector(sel);
      if (!el) return;
      if (edit.type === 'text') el.innerHTML = edit.value;
      else if (edit.type === 'img' && el.tagName === 'IMG') el.src = edit.value;
    } catch {}
  });
  // Colors
  const colors = loadColorEdits();
  Object.entries(colors).forEach(([sel, props]) => {
    try {
      const el = document.querySelector(sel);
      if (!el) return;
      if (props.text)       el.style.color = props.text;
      if (props.background) el.style.backgroundColor = props.background;
      if (props.border)     el.style.borderColor = props.border;
    } catch {}
  });
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AdminEditBar() {
  const { data: session } = useSession();

  const [adminMode,    setAdminMode]    = useState(false);
  const [guestPreview, setGuestPreview] = useState(false);
  const [editMode,     setEditMode]     = useState(false);
  const [editCount,    setEditCount]    = useState(0);
  const [undoCount,    setUndoCount]    = useState(0);
  const [saving,       setSaving]       = useState(false);
  const [savedToSite,  setSavedToSite]  = useState(false);
  const [toast,        setToast]        = useState('');

  // Lightbox
  const [lightbox, setLightbox] = useState(null); // { src, el }

  // Color panel
  const [colorPanel,  setColorPanel]  = useState(null); // { x, y, el }
  const [colorProp,   setColorProp]   = useState('text');
  const [pickerColor, setPickerColor] = useState('#000000');
  const [hexInput,    setHexInput]    = useState('000000');
  const [recentColors,setRecentColors]= useState([]);

  const activeElRef     = useRef(null);
  const fileInputRef    = useRef(null);
  const pendingImgRef   = useRef(null);
  const barRef          = useRef(null);
  const colorPanelRef   = useRef(null);
  const clickTimerRef   = useRef(null);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const checkAdmin = () => {
      setAdminMode(isAdminUser(session));
      setGuestPreview(!!sessionStorage.getItem('evo_preview_guest'));
    };
    checkAdmin();
    setRecentColors(loadRecentColors());
    // Re-check when window regains focus (catches logout in another tab)
    window.addEventListener('focus', checkAdmin);
    return () => window.removeEventListener('focus', checkAdmin);
  }, [session]);

  useEffect(() => {
    if (!adminMode) return;
    const t = setTimeout(() => {
      applyAllEdits();
      setEditCount(Object.keys(loadPageEdits()).length + Object.keys(loadColorEdits()).length);
      setUndoCount(getUndoCount());
    }, 600);
    return () => clearTimeout(t);
  }, [adminMode]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const notify = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }, []);

  const refreshCounts = useCallback(() => {
    setEditCount(Object.keys(loadPageEdits()).length + Object.keys(loadColorEdits()).length);
    setUndoCount(getUndoCount());
    setSavedToSite(false);
  }, []);

  const finalizeActive = useCallback(() => {
    const el = activeElRef.current;
    if (!el) return;
    el.contentEditable = 'false';
    el.style.outline = '';
    el.style.outlineOffset = '';
    const selector = getElementPath(el);
    const oldHtml = el.dataset.originalHtml || '';
    savePageEdit(selector, 'text', el.innerHTML);
    pushUndo({ page: getPageKey(), type: 'text', selector, oldValue: oldHtml, newValue: el.innerHTML });
    delete el.dataset.originalHtml;
    refreshCounts();
    activeElRef.current = null;
  }, [refreshCounts]);

  // ── Guest view toggle ─────────────────────────────────────────────────────
  function toggleGuestView() {
    if (guestPreview) {
      sessionStorage.removeItem('evo_preview_guest');
    } else {
      sessionStorage.setItem('evo_preview_guest', '1');
      setEditMode(false);
    }
    window.location.reload();
  }

  // ── Color panel ───────────────────────────────────────────────────────────
  function openColorPanel(e, el) {
    const rect = el.getBoundingClientRect();
    let x = Math.min(e.clientX - 130, window.innerWidth - 275);
    let y = rect.bottom + 10;
    if (y + 340 > window.innerHeight) y = Math.max(8, rect.top - 348);
    x = Math.max(8, x);

    const current = getComputedHex(el, colorProp);
    setPickerColor(current);
    setHexInput(current.replace('#', ''));
    setColorPanel({ x, y, el });
  }

  function handleHexInput(raw) {
    const v = raw.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
    setHexInput(v);
    if (v.length === 6) setPickerColor('#' + v);
  }

  function applyColor() {
    if (!colorPanel?.el) return;
    const el = colorPanel.el;
    const hex = isValidHex(pickerColor) ? pickerColor : '#' + hexInput;
    if (!isValidHex(hex)) { notify('Enter a valid hex color'); return; }

    if (colorProp === 'text')       el.style.color = hex;
    if (colorProp === 'background') el.style.backgroundColor = hex;
    if (colorProp === 'border')     el.style.borderColor = hex;

    const selector = getElementPath(el);
    const oldColor = getComputedHex(el, colorProp);
    saveColorEdit(selector, colorProp, hex);
    pushUndo({ page: getPageKey(), type: 'color', selector, prop: colorProp, oldValue: oldColor, newValue: hex });
    pushRecentColor(hex);
    setRecentColors(loadRecentColors());
    refreshCounts();
    notify('Color applied ✓');
    setColorPanel(null);
  }

  // ── Event: single click → color panel ────────────────────────────────────
  const handleClick = useCallback((e) => {
    if (!editMode) return;
    if (barRef.current?.contains(e.target)) return;
    if (colorPanelRef.current?.contains(e.target)) return;

    // Close color panel on click-outside
    if (colorPanel) { setColorPanel(null); return; }

    const el = e.target;
    if (['INPUT','TEXTAREA','SELECT'].includes(el.tagName)) return;

    // Debounce: ignore if dblclick is coming
    if (clickTimerRef.current) return;
    clickTimerRef.current = setTimeout(() => {
      clickTimerRef.current = null;
      openColorPanel(e, el);
    }, 260);
  }, [editMode, colorPanel, colorProp]);

  // Cancel the single-click timer when dblclick fires
  const cancelClickTimer = useCallback(() => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
  }, []);

  // ── Event: dblclick → text edit / image lightbox ──────────────────────────
  const handleDblClick = useCallback((e) => {
    if (!editMode) return;
    if (barRef.current?.contains(e.target)) return;
    cancelClickTimer();

    const el = e.target;

    if (el.tagName === 'IMG') {
      e.preventDefault();
      e.stopPropagation();
      pendingImgRef.current = el;
      setLightbox({ src: el.src, el });
      return;
    }

    if (!EDITABLE_TAGS.has(el.tagName)) return;
    const hasBlock = Array.from(el.children).some(c =>
      ['DIV','SECTION','ARTICLE','HEADER','FOOTER','ASIDE','MAIN','NAV','UL','OL','TABLE','FORM'].includes(c.tagName)
    );
    if (hasBlock) return;

    e.preventDefault();
    e.stopPropagation();
    finalizeActive();

    el.dataset.originalHtml = el.innerHTML; // for undo
    el.contentEditable = 'true';
    el.style.outline = '2px dashed #06b6d4';
    el.style.outlineOffset = '2px';
    el.focus();
    activeElRef.current = el;

    try {
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } catch {}
  }, [editMode, finalizeActive, cancelClickTimer]);

  // ── Event: blur → save text ───────────────────────────────────────────────
  const handleBlur = useCallback((e) => {
    const el = e.target;
    if (el.contentEditable !== 'true') return;
    if (barRef.current?.contains(el)) return;

    el.contentEditable = 'false';
    el.style.outline = '';
    el.style.outlineOffset = '';

    const selector = getElementPath(el);
    const oldHtml = el.dataset.originalHtml || '';
    savePageEdit(selector, 'text', el.innerHTML);
    pushUndo({ page: getPageKey(), type: 'text', selector, oldValue: oldHtml, newValue: el.innerHTML });
    delete el.dataset.originalHtml;
    refreshCounts();
    notify('Text saved ✓');
    if (activeElRef.current === el) activeElRef.current = null;
  }, [notify]);

  // ── Attach listeners ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!adminMode) return;
    document.addEventListener('click',    handleClick,    true);
    document.addEventListener('dblclick', handleDblClick, true);
    document.addEventListener('blur',     handleBlur,     true);
    return () => {
      document.removeEventListener('click',    handleClick,    true);
      document.removeEventListener('dblclick', handleDblClick, true);
      document.removeEventListener('blur',     handleBlur,     true);
    };
  }, [adminMode, handleClick, handleDblClick, handleBlur]);

  // ── Edit mode cursor ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!adminMode) return;
    document.body.style.cursor = editMode ? 'crosshair' : '';
    if (!editMode) { finalizeActive(); setColorPanel(null); }
    return () => { document.body.style.cursor = ''; };
  }, [editMode, adminMode, finalizeActive]);

  // ── Sync pickerColor → hexInput ───────────────────────────────────────────
  useEffect(() => {
    setHexInput(pickerColor.replace('#', ''));
  }, [pickerColor]);

  // ── Sync colorProp → update currentColor display ─────────────────────────
  useEffect(() => {
    if (!colorPanel?.el) return;
    const current = getComputedHex(colorPanel.el, colorProp);
    setPickerColor(current);
    setHexInput(current.replace('#', ''));
  }, [colorProp]);

  // ── Image file picker ─────────────────────────────────────────────────────
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file || !pendingImgRef.current) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      const imgEl = pendingImgRef.current;
      const oldSrc = imgEl.src;
      imgEl.src = dataUrl;
      imgEl.style.outline = '2px solid #06b6d4';
      setTimeout(() => { imgEl.style.outline = ''; }, 1500);

      const selector = getElementPath(imgEl);
      savePageEdit(selector, 'img', dataUrl);
      pushUndo({ page: getPageKey(), type: 'img', selector, oldValue: oldSrc, newValue: dataUrl });
      refreshCounts();
      notify('Image updated ✓');
      pendingImgRef.current = null;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  async function saveToSite() {
    setSaving(true);
    const pw = localStorage.getItem('evo_admin_pw') || '';
    try {
      const selectors = loadPageEdits();
      const colors    = loadColorEdits();
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${pw}`,
        },
        body: JSON.stringify({ page: getPageKey(), selectors, colors }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
      setSavedToSite(true);
      notify('Saved to site ✓');
    } catch (err) {
      notify('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleUndo() {
    const entry = popUndo();
    if (!entry || entry.page !== getPageKey()) { notify('Nothing to undo'); return; }

    try {
      const el = document.querySelector(entry.selector);
      if (!el) { notify('Element not found'); return; }

      if (entry.type === 'text') {
        el.innerHTML = entry.oldValue;
        savePageEdit(entry.selector, 'text', entry.oldValue);
      } else if (entry.type === 'img') {
        el.src = entry.oldValue;
        savePageEdit(entry.selector, 'img', entry.oldValue);
      } else if (entry.type === 'color') {
        if (entry.prop === 'text')       el.style.color = entry.oldValue;
        if (entry.prop === 'background') el.style.backgroundColor = entry.oldValue;
        if (entry.prop === 'border')     el.style.borderColor = entry.oldValue;
        saveColorEdit(entry.selector, entry.prop, entry.oldValue);
      }
      refreshCounts();
      notify('Undone ✓');
    } catch { notify('Undo failed'); }
  }

  function handleReset() {
    if (!confirm('Reset all edits on this page to defaults? This will also clear the saved version.')) return;
    const pw = localStorage.getItem('evo_admin_pw') || '';
    fetch('/api/admin/content?page=' + encodeURIComponent(getPageKey()), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${pw}` },
    }).catch(() => {});
    clearPageEdits();
    clearColorEdits();
    localStorage.setItem(UNDO_KEY, JSON.stringify(loadUndoStack().filter(e => e.page !== getPageKey())));
    setEditCount(0);
    setUndoCount(0);
    window.location.reload();
  }

  if (!adminMode) return null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif"
        style={{ display: 'none' }} onChange={handleFileChange} />

      {/* ── Image Lightbox ── */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{
          position: 'fixed', inset: 0, zIndex: 100001,
          background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 24, fontFamily: "'DM Sans', sans-serif",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            position: 'relative', maxWidth: '90vw',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          }}>
            <button onClick={() => setLightbox(null)} style={{
              position: 'absolute', top: -14, right: -14, zIndex: 2,
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>

            <img src={lightbox.src} alt="Preview" style={{
              maxWidth: '85vw', maxHeight: '68vh',
              objectFit: 'contain', borderRadius: 12,
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)', display: 'block',
            }} />

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setLightbox(null); fileInputRef.current?.click(); }} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                background: '#0F2A4A', color: '#06b6d4',
                border: '1px solid rgba(6,182,212,0.3)',
                borderRadius: 100, padding: '10px 22px',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Replace Image
              </button>
              <button onClick={() => setLightbox(null)} style={{
                background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 100, padding: '10px 20px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Cancel</button>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0 }}>Click outside to close</p>
          </div>
        </div>
      )}

      {/* ── Color Panel ── */}
      {colorPanel && (
        <div ref={colorPanelRef} style={{
          position: 'fixed', left: colorPanel.x, top: colorPanel.y,
          zIndex: 100002, width: 256,
          background: '#1a1d27', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 16, padding: 16,
          boxShadow: '0 16px 48px rgba(0,0,0,0.65)',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', marginBottom: 10 }}>
            COLOR EDITOR
          </div>

          {/* Property tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
            {[['text','Text'],['background','BG'],['border','Border']].map(([val, label]) => (
              <button key={val} onClick={() => setColorProp(val)} style={{
                flex: 1, padding: '6px 0', borderRadius: 7, border: 'none',
                background: colorProp === val ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.05)',
                color: colorProp === val ? '#06b6d4' : 'rgba(255,255,255,0.45)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}>{label}</button>
            ))}
          </div>

          {/* Current color */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
            background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '8px 10px' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, flexShrink: 0,
              background: isValidHex(pickerColor) ? pickerColor : '#888',
              border: '1px solid rgba(255,255,255,0.12)',
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>CURRENT</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#fff', fontFamily: 'monospace' }}>{pickerColor.toUpperCase()}</span>
                <button onClick={() => {
                  navigator.clipboard?.writeText(pickerColor.toUpperCase()).then(() => notify('Copied!'));
                }} style={{ background: 'none', border: 'none', color: '#06b6d4', fontSize: 11, cursor: 'pointer', padding: 0 }}>
                  copy
                </button>
              </div>
            </div>
          </div>

          {/* Picker + hex */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <input type="color" value={isValidHex(pickerColor) ? pickerColor : '#000000'}
              onChange={e => setPickerColor(e.target.value)}
              style={{ width: 44, height: 38, borderRadius: 8, border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}
            />
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.07)',
              borderRadius: 8, padding: '0 10px', flex: 1, height: 38 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginRight: 4 }}>#</span>
              <input type="text" value={hexInput} onChange={e => handleHexInput(e.target.value)}
                maxLength={6} placeholder="RRGGBB"
                style={{ background: 'none', border: 'none', color: '#fff',
                  fontSize: 13, fontFamily: 'monospace', outline: 'none', width: '100%',
                  letterSpacing: '0.05em' }}
              />
            </div>
          </div>

          {/* Recent colors */}
          {recentColors.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 6,
                fontWeight: 600, letterSpacing: '0.06em' }}>RECENT</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {recentColors.map(c => (
                  <button key={c} onClick={() => setPickerColor(c)} title={c} style={{
                    width: 24, height: 24, borderRadius: 6, background: c,
                    border: pickerColor === c ? '2px solid #06b6d4' : '1px solid rgba(255,255,255,0.12)',
                    cursor: 'pointer', padding: 0, flexShrink: 0,
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setColorPanel(null)} style={{
              flex: 1, padding: '9px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)', background: 'none',
              color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer',
            }}>Cancel</button>
            <button onClick={applyColor} style={{
              flex: 1, padding: '9px', borderRadius: 8, border: 'none',
              background: '#0F2A4A', color: '#06b6d4', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>Apply</button>
          </div>
        </div>
      )}

      {/* ── Floating Admin Bar ── */}
      <div ref={barRef} style={{
        position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 99999, display: 'flex', alignItems: 'center', gap: 6,
        background: '#0f1117', border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: 100, padding: '7px 14px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
        fontFamily: "'DM Sans', sans-serif", userSelect: 'none', whiteSpace: 'nowrap',
      }}>
        {/* Admin badge */}
        <span style={{
          fontSize: 10, fontWeight: 800, color: guestPreview ? '#fb923c' : '#06b6d4',
          letterSpacing: '0.12em', textTransform: 'uppercase',
          paddingRight: 10, borderRight: '1px solid rgba(255,255,255,0.1)',
        }}>
          {guestPreview ? 'GUEST VIEW' : 'ADMIN'}
        </span>

        {/* Edit mode toggle (hidden during guest view) */}
        {!guestPreview && (
          <button onClick={() => setEditMode(m => !m)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: editMode ? '#0F2A4A' : 'rgba(255,255,255,0.07)',
            color: editMode ? '#06b6d4' : 'rgba(255,255,255,0.65)',
            border: editMode ? '1px solid rgba(6,182,212,0.35)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: 100, padding: '6px 14px',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            {editMode ? 'Editing On' : 'Edit Mode'}
          </button>
        )}

        {editMode && !guestPreview && (
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
            click=color · dblclick=text/img
          </span>
        )}

        {/* Guest view toggle */}
        <button onClick={toggleGuestView} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: guestPreview ? 'rgba(251,146,60,0.15)' : 'rgba(255,255,255,0.07)',
          color: guestPreview ? '#fb923c' : 'rgba(255,255,255,0.55)',
          border: guestPreview ? '1px solid rgba(251,146,60,0.35)' : '1px solid rgba(255,255,255,0.08)',
          borderRadius: 100, padding: '6px 14px',
          fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          {guestPreview ? 'Exit Guest View' : 'Guest View'}
        </button>

        {/* Save / Undo / Reset */}
        {editCount > 0 && !guestPreview && (
          <>
            <span style={{ fontSize: 11, color: savedToSite ? 'rgba(6,182,212,0.5)' : 'rgba(251,191,36,0.7)', paddingLeft: 2 }}>
              {editCount} edit{editCount !== 1 ? 's' : ''}{savedToSite ? ' · saved' : ' · unsaved'}
            </span>

            {/* Save to Site */}
            <button onClick={saveToSite} disabled={saving || savedToSite} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: savedToSite ? 'rgba(6,182,212,0.08)' : 'rgba(6,182,212,0.18)',
              color: savedToSite ? 'rgba(6,182,212,0.45)' : '#06b6d4',
              border: '1px solid rgba(6,182,212,0.25)',
              borderRadius: 100, padding: '5px 12px',
              fontSize: 11, fontWeight: 700, cursor: saving ? 'wait' : savedToSite ? 'default' : 'pointer',
            }}>
              {saving ? '…' : savedToSite ? '✓ Saved' : '↑ Save to Site'}
            </button>

            {/* Undo */}
            {undoCount > 0 && (
              <button onClick={handleUndo} title="Undo last edit" style={{
                background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)', fontSize: 11, cursor: 'pointer',
                borderRadius: 100, padding: '5px 10px',
              }}>↩ Undo</button>
            )}

            {/* Reset */}
            <button onClick={handleReset} title="Reset all edits on this page" style={{
              background: 'none', border: 'none',
              color: 'rgba(255,100,100,0.4)', fontSize: 11, cursor: 'pointer', padding: '4px 6px',
            }}>✕</button>
          </>
        )}

        {/* Back to admin */}
        <a href="/admin" style={{
          display: 'flex', alignItems: 'center', gap: 5,
          color: 'rgba(255,255,255,0.32)', textDecoration: 'none', fontSize: 12,
          paddingLeft: 10, borderLeft: '1px solid rgba(255,255,255,0.1)',
        }}>⬡ Admin</a>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 74, left: '50%', transform: 'translateX(-50%)',
          zIndex: 100000, background: '#0F2A4A', color: '#06b6d4',
          borderRadius: 100, padding: '8px 22px', fontSize: 13, fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          animation: 'evoToastIn 0.18s ease', pointerEvents: 'none',
        }}>{toast}</div>
      )}

      {/* ── Edit mode CSS hints ── */}
      {editMode && (
        <style>{`
          img:hover {
            outline: 2px dashed rgba(6,182,212,0.6) !important;
            outline-offset: 3px !important;
            cursor: crosshair !important;
          }
          h1:not([contenteditable="true"]):hover,
          h2:not([contenteditable="true"]):hover,
          h3:not([contenteditable="true"]):hover,
          h4:not([contenteditable="true"]):hover,
          h5:not([contenteditable="true"]):hover,
          h6:not([contenteditable="true"]):hover,
          p:not([contenteditable="true"]):hover,
          span:not([contenteditable="true"]):hover,
          li:not([contenteditable="true"]):hover {
            outline: 1px dashed rgba(6,182,212,0.25) !important;
            outline-offset: 1px !important;
            cursor: crosshair !important;
          }
          @keyframes evoToastIn {
            from { opacity: 0; transform: translateX(-50%) translateY(6px); }
            to   { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
        `}</style>
      )}
    </>
  );
}
