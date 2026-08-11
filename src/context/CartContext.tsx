"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from "react";

export interface CartItem {
  name: string;
  price: string;
  image: string;
  quantity: number;
  isFreeDelivery?: boolean;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (name: string) => void;
  updateQuantity: (name: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  loaded: boolean;
  selectedItems: string[];
  toggleItemSelect: (name: string) => void;
  selectedSubtotal: number;
  selectedCount: number;
  allSelected: boolean;
  toggleSelectAll: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "toyverse-cart";
const SELECTED_KEY = "toyverse-selected";
const DEBOUNCE_MS = 300;

function parsePrice(price: string): number {
  return parseInt(price.replace(/[^0-9]/g, ""), 10) || 0;
}

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadSelected(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SELECTED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // silently fail
  }
}

function persistSelected(selected: string[]) {
  try {
    localStorage.setItem(SELECTED_KEY, JSON.stringify(selected));
  } catch {
    // silently fail
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  const cartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingCartRef = useRef<CartItem[] | null>(null);
  const pendingSelectedRef = useRef<string[] | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const cart = loadCart();
    const savedSelected = loadSelected();
    setItems(cart);
    // Only keep selections that still exist in cart
    const validNames = new Set(cart.map((i) => i.name));
    setSelected(savedSelected.filter((n) => validNames.has(n)));
    setLoaded(true);
  }, []);

  // Debounced localStorage persistence for cart items
  useEffect(() => {
    if (!loaded) return;

    if (cartTimerRef.current) {
      clearTimeout(cartTimerRef.current);
    }

    pendingCartRef.current = items;

    cartTimerRef.current = setTimeout(() => {
      if (pendingCartRef.current !== null) {
        persistCart(pendingCartRef.current);
        pendingCartRef.current = null;
      }
      cartTimerRef.current = null;
    }, DEBOUNCE_MS);

    return () => {
      if (cartTimerRef.current) {
        clearTimeout(cartTimerRef.current);
      }
    };
  }, [items, loaded]);

  // Debounced localStorage persistence for selected items
  useEffect(() => {
    if (!loaded) return;

    if (selectedTimerRef.current) {
      clearTimeout(selectedTimerRef.current);
    }

    pendingSelectedRef.current = selected;

    selectedTimerRef.current = setTimeout(() => {
      if (pendingSelectedRef.current !== null) {
        persistSelected(pendingSelectedRef.current);
        pendingSelectedRef.current = null;
      }
      selectedTimerRef.current = null;
    }, DEBOUNCE_MS);

    return () => {
      if (selectedTimerRef.current) {
        clearTimeout(selectedTimerRef.current);
      }
    };
  }, [selected, loaded]);

  // Flush pending writes on unmount
  useEffect(() => {
    return () => {
      if (pendingCartRef.current !== null) {
        persistCart(pendingCartRef.current);
      }
      if (pendingSelectedRef.current !== null) {
        persistSelected(pendingSelectedRef.current);
      }
    };
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.name === item.name);
      if (existing) {
        return prev.map((i) =>
          i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    // Auto-select newly added items
    setSelected((prev) => {
      if (prev.includes(item.name)) return prev;
      return [...prev, item.name];
    });
  }, []);

  const removeItem = useCallback((name: string) => {
    setItems((prev) => prev.filter((i) => i.name !== name));
    setSelected((prev) => prev.filter((n) => n !== name));
  }, []);

  const updateQuantity = useCallback((name: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.name !== name));
      setSelected((prev) => prev.filter((n) => n !== name));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.name === name ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setSelected([]);
  }, []);

  const toggleItemSelect = useCallback((name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }, []);

  // Memoized derived values
  const allSelected = useMemo(
    () => items.length > 0 && selected.length === items.length,
    [items.length, selected.length]
  );

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) => {
      if (items.length > 0 && prev.length === items.length) {
        return [];
      }
      return items.map((i) => i.name);
    });
  }, [items]);

  const cartCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + parsePrice(i.price) * i.quantity, 0),
    [items]
  );

  const selectedCount = useMemo(() => {
    const selectedSet = new Set(selected);
    return items
      .filter((i) => selectedSet.has(i.name))
      .reduce((sum, i) => sum + i.quantity, 0);
  }, [items, selected]);

  const selectedSubtotal = useMemo(() => {
    const selectedSet = new Set(selected);
    return items
      .filter((i) => selectedSet.has(i.name))
      .reduce((sum, i) => sum + parsePrice(i.price) * i.quantity, 0);
  }, [items, selected]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo<CartContextType>(
    () => ({
      items,
      addToCart,
      removeItem,
      updateQuantity,
      clearCart,
      cartCount,
      subtotal,
      loaded,
      selectedItems: selected,
      toggleItemSelect,
      selectedSubtotal,
      selectedCount,
      allSelected,
      toggleSelectAll,
    }),
    [
      items,
      addToCart,
      removeItem,
      updateQuantity,
      clearCart,
      cartCount,
      subtotal,
      loaded,
      selected,
      toggleItemSelect,
      selectedSubtotal,
      selectedCount,
      allSelected,
      toggleSelectAll,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
