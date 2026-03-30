import { useState, useRef, useEffect } from 'react';

const CHAT_ICON = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const CLOSE_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const SEND_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m the EVO Labs AI assistant. How can I help you today? I can answer questions about our peptides, shipping, COAs, and more.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [atBottom, setAtBottom] = useState(false); // true when sticky Add-to-Cart bar is visible
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Track mobile breakpoint to avoid overlapping mobile bottom nav
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Task 6.4: Move chat widget when sticky Add-to-Cart bar is visible
  useEffect(() => {
    const target = document.getElementById('sticky-add-to-cart');
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setAtBottom(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      // Only send role+content pairs (exclude the initial greeting for API)
      const apiMessages = updated
        .filter((_, i) => i > 0 || updated[0].role === 'user')
        .map(m => ({ role: m.role, content: m.content }));

      // Ensure first message to API is from user
      const firstUserIdx = apiMessages.findIndex(m => m.role === 'user');
      const trimmed = firstUserIdx >= 0 ? apiMessages.slice(firstUserIdx) : apiMessages;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: trimmed }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.error || 'Sorry, something went wrong. Please try again.' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Simple markdown-like link rendering for /products/... paths
  function renderContent(text) {
    return text.replace(/\/products\/[\w-]+/g, match => match);
  }

  return (
    <>
      {/* Floating button — moves to top-right when sticky cart bar is visible */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open AI chat assistant"
          style={{
            position: 'fixed',
            bottom: atBottom ? 'auto' : (isMobile ? 88 : 24),
            top: atBottom ? 80 : 'auto',
            right: 24,
            zIndex: 9997,
            width: 56, height: 56, borderRadius: '50%',
            background: '#1B4D3E', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(27,77,62,0.4)',
            cursor: 'pointer', border: 'none',
            transition: 'bottom 0.3s ease, top 0.3s ease, transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 32px rgba(27,77,62,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(27,77,62,0.4)'; }}
        >
          {CHAT_ICON}
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: isMobile ? 88 : 24, right: isMobile ? 0 : 24, zIndex: 9999,
          width: 380, maxWidth: isMobile ? '100vw' : 'calc(100vw - 32px)',
          height: 520, maxHeight: isMobile ? 'calc(100vh - 160px)' : 'calc(100vh - 48px)',
          background: '#fff', borderRadius: 20,
          boxShadow: '0 12px 60px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'chatSlideUp 0.25s ease-out',
          fontFamily: "'Anek Telugu', system-ui, sans-serif",
        }}>
          {/* Header */}
          <div style={{
            background: '#1B4D3E', color: '#fff',
            padding: '16px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>EVO Labs Assistant</div>
                <div style={{ fontSize: 11, opacity: 0.7, fontFamily: "'Poppins', sans-serif" }}>Powered by AI</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4, opacity: 0.8 }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
            >
              {CLOSE_ICON}
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{
            flex: 1, overflowY: 'auto', padding: '16px 16px 8px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '82%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? '#1B4D3E' : '#f3f4f6',
                  color: msg.role === 'user' ? '#fff' : '#111827',
                  fontSize: 14,
                  lineHeight: 1.55,
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}>
                  {renderContent(msg.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: '16px 16px 16px 4px',
                  background: '#f3f4f6', color: '#9ca3af',
                  fontSize: 14, display: 'flex', gap: 4, alignItems: 'center',
                }}>
                  <span style={{ animation: 'dotPulse 1.2s infinite', animationDelay: '0s' }}>.</span>
                  <span style={{ animation: 'dotPulse 1.2s infinite', animationDelay: '0.2s' }}>.</span>
                  <span style={{ animation: 'dotPulse 1.2s infinite', animationDelay: '0.4s' }}>.</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 16px', borderTop: '1px solid #f0f0f0',
            display: 'flex', gap: 8, alignItems: 'center',
            flexShrink: 0, background: '#fff',
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about our peptides..."
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 12,
                border: '1.5px solid #e5e7eb', fontSize: 14,
                outline: 'none', fontFamily: 'inherit',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#1B4D3E'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: input.trim() && !loading ? '#1B4D3E' : '#e5e7eb',
                color: input.trim() && !loading ? '#fff' : '#9ca3af',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              {SEND_ICON}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(1); }
          40% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </>
  );
}
