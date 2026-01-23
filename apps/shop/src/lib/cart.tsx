"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { MAX_CART_ITEMS, CART_STORAGE_KEY } from "./constants";

export interface CartItem {
  productId: string;
  variantId?: string;
  stripePriceId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variantName?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    variantId?: string
  ) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const addToCart = useCallback((item: CartItem) => {
    setItems((prev) => {
      const currentTotal = prev.reduce((sum, i) => sum + i.quantity, 0);
      if (currentTotal >= MAX_CART_ITEMS) return prev;

      const canAdd = Math.min(item.quantity, MAX_CART_ITEMS - currentTotal);
      if (canAdd <= 0) return prev;

      const existingIndex = prev.findIndex(
        (i) => i.productId === item.productId && i.variantId === item.variantId
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += canAdd;
        return updated;
      }

      return [...prev, { ...item, quantity: canAdd }];
    });
  }, []);

  const removeFromCart = useCallback(
    (productId: string, variantId?: string) => {
      setItems((prev) =>
        prev.filter(
          (i) => !(i.productId === productId && i.variantId === variantId)
        )
      );
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number, variantId?: string) => {
      if (quantity <= 0) {
        removeFromCart(productId, variantId);
        return;
      }

      setItems((prev) => {
        const currentItem = prev.find(
          (i) => i.productId === productId && i.variantId === variantId
        );
        if (!currentItem) return prev;

        const otherItemsTotal = prev
          .filter((i) => !(i.productId === productId && i.variantId === variantId))
          .reduce((sum, i) => sum + i.quantity, 0);

        const maxAllowed = MAX_CART_ITEMS - otherItemsTotal;
        const clampedQuantity = Math.min(quantity, maxAllowed);

        return prev.map((i) =>
          i.productId === productId && i.variantId === variantId
            ? { ...i, quantity: clampedQuantity }
            : i
        );
      });
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    localStorage.removeItem(CART_STORAGE_KEY);
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
