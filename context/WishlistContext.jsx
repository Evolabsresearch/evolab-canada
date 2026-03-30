import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WishlistContext = createContext(null);

const STORAGE_KEY = 'evo_wishlist';

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]); // array of product slugs

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (Array.isArray(stored)) setWishlist(stored);
    } catch { /* ignore */ }
  }, []);

  const persist = useCallback((list) => {
    setWishlist(list);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* ignore */ }
  }, []);

  const toggle = useCallback((slug) => {
    setWishlist(prev => {
      const next = prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const isWishlisted = useCallback((slug) => wishlist.includes(slug), [wishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, toggle, isWishlisted, count: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
}
