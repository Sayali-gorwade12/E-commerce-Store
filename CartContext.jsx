import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const SHIPPING_FEE = 99;
const FREE_SHIPPING_THRESHOLD = 999;

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('shopsphere_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('shopsphere_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    if (!product || product.stock <= 0) return false;

    setItems((prevItems) => {
      const existing = prevItems.find((it) => it.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prevItems.map((it) =>
          it.id === product.id ? { ...it, quantity: newQty } : it
        );
      } else {
        const qty = Math.min(product.stock, Math.max(1, quantity));
        return [
          ...prevItems,
          {
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image_url: product.image_url,
            stock: product.stock,
            category: product.category,
            quantity: qty
          }
        ];
      }
    });

    return true;
  };

  const updateQuantity = (productId, newQuantity) => {
    setItems((prevItems) => {
      if (newQuantity <= 0) {
        return prevItems.filter((it) => it.id !== productId);
      }
      return prevItems.map((it) => {
        if (it.id === productId) {
          const clamped = Math.min(it.stock, newQuantity);
          return { ...it, quantity: clamped };
        }
        return it;
      });
    });
  };

  const removeFromCart = (productId) => {
    setItems((prevItems) => prevItems.filter((it) => it.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem('shopsphere_cart');
    } catch (e) {}
  };

  // Safe subtotal calculation using integer paise
  const subtotalPaise = items.reduce((acc, it) => {
    const unitPaise = Math.round(Number(it.price) * 100);
    return acc + unitPaise * it.quantity;
  }, 0);

  const subtotal = Number((subtotalPaise / 100).toFixed(2));
  const cartCount = items.reduce((acc, it) => acc + it.quantity, 0);
  const shippingFee = cartCount > 0 ? (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE) : 0;
  const total = Number((subtotal + shippingFee).toFixed(2));

  const formatPrice = (amount) => {
    const num = Number(amount) || 0;
    return `₹${num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        subtotal,
        shippingFee,
        total,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        formatPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
