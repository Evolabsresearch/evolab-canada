import { createContext, useContext, useState, useCallback } from 'react';

const CompareContext = createContext();

export function CompareProvider({ children }) {
  const [compareList, setCompareList] = useState([]); // max 3 product slugs
  const [open, setOpen] = useState(false);

  const addToCompare = useCallback((slug) => {
    setCompareList(prev => {
      if (prev.includes(slug)) return prev;
      const next = [...prev, slug].slice(-3); // max 3
      return next;
    });
    setOpen(true);
  }, []);

  const removeFromCompare = useCallback((slug) => {
    setCompareList(prev => prev.filter(s => s !== slug));
  }, []);

  const isInCompare = useCallback((slug) => compareList.includes(slug), [compareList]);

  const clearCompare = useCallback(() => {
    setCompareList([]);
    setOpen(false);
  }, []);

  return (
    <CompareContext.Provider value={{
      compareList,
      open,
      setOpen,
      addToCompare,
      removeFromCompare,
      isInCompare,
      clearCompare,
    }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
