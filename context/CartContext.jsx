import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { data: session } = useSession();
  const [cart, setCart] = useState([]);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [catalogMode, setCatalogMode] = useState('gated');

  // Load cart from localStorage on mount + fetch catalog mode
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('evo_cart') || '[]');
      setCart(saved);
    } catch {}
    // Fetch catalog mode from public settings API
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => { if (data.catalogMode) setCatalogMode(data.catalogMode); })
      .catch(() => {});
  }, []);

  // Persist to localStorage on change
  const persist = useCallback((newCart) => {
    setCart(newCart);
    localStorage.setItem('evo_cart', JSON.stringify(newCart));
  }, []);

  const addItem = useCallback((product, options = {}) => {
    // Compliance: gated shopping — require login before adding to cart
    // In open_catalog and full_open modes, guests can add to cart
    const productsOpen = catalogMode === 'open_catalog' || catalogMode === 'full_open';
    if (!session && !productsOpen) {
      setGateOpen(true);
      return;
    }
    const { dosage = '', bundleCount = 1, variantPrice = null } = options;
    // Check if same product + dosage already in cart
    const existing = cart.findIndex(
      (item) => item.slug === product.slug && item.dosage === dosage
    );
    if (existing >= 0) {
      const next = cart.map((item, i) =>
        i === existing ? { ...item, qty: item.qty + bundleCount } : item
      );
      persist(next);
    } else {
      persist([...cart, {
        slug: product.slug,
        name: product.name,
        // Use variant price as the effective price for accurate cart totals
        price: variantPrice || product.price,
        salePrice: variantPrice ? null : (product.salePrice || null),
        image: product.image,
        category: product.category,
        dosage,
        qty: bundleCount,
      }]);
    }
    // Omnisend: track add-to-cart
    try {
      const itemPrice = parseFloat(((variantPrice || product.salePrice || product.price) || '0').toString().replace(/[^0-9.]/g, ''));
      if (typeof window !== 'undefined' && window.omnisend) {
        window.omnisend.push(['track', '$addedProductToCart', {
          $productID: product.slug || String(product.id),
          $variantID: dosage || 'default',
          $currency: 'CAD',
          $price: itemPrice,
          $quantity: bundleCount,
          $imageUrl: product.image ? `https://evolabsresearch.ca${product.image}` : '',
          $productUrl: `https://evolabsresearch.ca/products/${product.slug}`,
          $title: product.name,
        }]);
      }
    } catch (_) {}
    setMiniCartOpen(true);
  }, [cart, persist, session, catalogMode]);

  const removeItem = useCallback((idx) => {
    persist(cart.filter((_, i) => i !== idx));
  }, [cart, persist]);

  const updateQty = useCallback((idx, qty) => {
    if (qty < 1) {
      persist(cart.filter((_, i) => i !== idx));
      return;
    }
    persist(cart.map((item, i) => i === idx ? { ...item, qty } : item));
  }, [cart, persist]);

  const clearCart = useCallback(() => {
    persist([]);
  }, [persist]);

  const itemCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  const subtotal = cart.reduce((sum, item) => {
    const price = parseFloat((item.salePrice || item.price || '0').replace(/[^0-9.]/g, ''));
    return sum + price * (item.qty || 1);
  }, 0);

  // Volume discount: 5% off for qty 2, 10% off for qty 3+ (per line item)
  const volumeDiscount = cart.reduce((sum, item) => {
    const qty = item.qty || 1;
    if (qty < 2) return sum;
    const price = parseFloat((item.salePrice || item.price || '0').replace(/[^0-9.]/g, ''));
    const pct = qty >= 3 ? 0.10 : 0.05;
    return sum + parseFloat((price * qty * pct).toFixed(2));
  }, 0);

  const subtotalAfterVolume = Math.max(0, subtotal - volumeDiscount);
  const shipping = subtotalAfterVolume >= 300 ? 0 : 14.99;
  const total = subtotalAfterVolume + shipping;

  return (
    <CartContext.Provider value={{
      cart,
      itemCount,
      subtotal,
      volumeDiscount,
      subtotalAfterVolume,
      shipping,
      total,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      miniCartOpen,
      setMiniCartOpen,
      gateOpen,
      setGateOpen,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
