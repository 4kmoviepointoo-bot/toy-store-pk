"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { Product } from "@/lib/products";

export type WishlistItem = Product;

interface WishlistContextType {
  items: WishlistItem[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (slug: string) => boolean;
  removeFromWishlist: (slug: string) => void;
  wishlistCount: number;
  loaded: boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

const STORAGE_KEY = "toyverse_wishlist";

function loadWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistWishlist(items: WishlistItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(loadWishlist());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) persistWishlist(items);
  }, [items, loaded]);

  const toggleWishlist = useCallback((product: Product) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.slug === product.slug);
      if (exists) return prev.filter((i) => i.slug !== product.slug);
      return [product, ...prev];
    });
  }, []);

  const isInWishlist = useCallback(
    (slug: string) => items.some((i) => i.slug === slug),
    [items]
  );

  const removeFromWishlist = useCallback((slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  }, []);

  const wishlistCount = useMemo(() => items.length, [items]);

  const contextValue = useMemo<WishlistContextType>(
    () => ({ items, toggleWishlist, isInWishlist, removeFromWishlist, wishlistCount, loaded }),
    [items, toggleWishlist, isInWishlist, removeFromWishlist, wishlistCount, loaded]
  );

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
