import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const KEY = "a2z-cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  function add(product, qty = 1) {
    setItems((current) => {
      const found = current.find((item) => item.id === product.id);
      if (found) {
        return current.map((item) => item.id === product.id ? { ...item, qty: item.qty + qty } : item);
      }
      return [...current, { id: product.id, name: product.name, price: product.price, image: product.image, qty }];
    });
  }

  function update(id, qty) {
    setItems((current) => current.flatMap((item) => {
      if (item.id !== id) return [item];
      return qty > 0 ? [{ ...item, qty }] : [];
    }));
  }

  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <CartContext.Provider value={{ items, add, update, count, total, clear: () => setItems([]) }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
