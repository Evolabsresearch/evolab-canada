import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const RecentlyViewedContext = createContext(null);
const STORAGE_KEY = 'evo_recently_viewed';
const MAX_ITEMS = 6;

export function RecentlyViewedProvider({ children }) {
  const [recentSlugs, setRecentSlugs] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (Array.isArray(stored)) setRecentSlugs(stored);
    } catch { /* ignore */ }
  }, []);

  const track = useCallback((slug) => {
    setRecentSlugs(prev => {
      const filtered = prev.filter(s => s !== slug);
      const next = [slug, ...filtered].slice(0, MAX_ITEMS);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return (
    <RecentlyViewedContext.Provider value={{ recentSlugs, track }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error('useRecentlyViewed must be inside RecentlyViewedProvider');
  return ctx;
}
