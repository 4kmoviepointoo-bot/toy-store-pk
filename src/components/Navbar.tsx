"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ShoppingCart, Search, Heart, User, Package, LogOut } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

const CartDrawer = dynamic(
  () => import("./CartDrawer").then((m) => m.CartDrawer),
  { ssr: false }
);

export function Navbar() {
  const router = useRouter();
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cartIconRef = useRef<HTMLButtonElement>(null);
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!accountOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside, { passive: true });
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountOpen]);

  const handleLogout = async () => {
    setAccountOpen(false);
    await logout();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (q) {
      router.push(`/shop?search=${encodeURIComponent(q)}`);
    }
  };

  return (
    <>
    <header className="sticky top-0 z-50 bg-navy/95 backdrop-blur-xl border-b border-border/40">
      <nav className="mx-auto max-w-[1400px] flex items-center gap-2 px-3 py-2 sm:px-5 sm:py-2.5 lg:px-8">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0 group">
          <span className="text-xl sm:text-2xl transition-transform duration-300 group-hover:scale-110" role="img" aria-label="teddy bear">
            🧸
          </span>
          <span className="text-[15px] sm:text-[17px] font-extrabold tracking-tight rainbow-text">
            ToyVerse
          </span>
        </a>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 min-w-0 mx-2 sm:mx-4 lg:mx-8">
          <div className={`relative flex items-center rounded-full border transition-all duration-300 ease-out ${
            searchFocused
              ? "border-brand/50 bg-surface shadow-[0_0_0_3px_rgba(28,120,101,0.1),0_4px_12px_rgba(0,0,0,0.15)]"
              : "border-border/60 bg-surface/70 shadow-sm hover:border-border/80 hover:bg-surface/90"
          }`}>
            <span className={`pl-3.5 sm:pl-4 shrink-0 transition-colors duration-200 ${searchFocused ? "text-brand" : "text-text-muted"}`}>
              <Search className="h-4 w-4" strokeWidth={2} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search for toys, games, and more..."
              className="w-full bg-transparent py-2.5 sm:py-3 pl-2.5 sm:pl-3 pr-0 text-sm text-text-primary placeholder:text-text-muted/70 outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="shrink-0 mr-1.5 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-dark active:scale-95 transition-all duration-200"
            >
              <Search className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
          </div>
        </form>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-1.5">
          <a
            href="/track-order"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-200"
          >
            <Package className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>Track</span>
          </a>
          <a
            href="/wishlist"
            className="relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-200"
          >
            <Heart className="h-[18px] w-[18px]" strokeWidth={2} />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-pink px-1 text-[9px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </a>
          {/* Account — Desktop */}
          <div className="relative" ref={dropdownRef}>
            {user ? (
              <button
                type="button"
                onClick={() => setAccountOpen(!accountOpen)}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-200"
              >
                <User className="h-[18px] w-[18px]" strokeWidth={2} />
                <span className="hidden xl:inline">{user.name.split(" ")[0]}</span>
                <svg className={`h-3 w-3 transition-transform duration-200 ${accountOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              </button>
            ) : (
              <a
                href="/account"
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-200"
              >
                <User className="h-[18px] w-[18px]" strokeWidth={2} />
                <span>Account</span>
              </a>
            )}
            {user && accountOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-surface border border-border/60 shadow-premium-lg py-2 z-50 animate-fade-in-up">
                <a
                  href="/account"
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
                >
                  <User className="h-4 w-4" />
                  Profile
                </a>
                <a
                  href="/account"
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
                >
                  <Package className="h-4 w-4" />
                  My Orders
                </a>
                <div className="my-1 border-t border-border/40" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
          {/* Cart — Desktop */}
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-200"
          >
            <div className="relative">
              <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Mobile Utility Icons */}
        <div className="flex lg:hidden items-center gap-0.5">
          <a
            href="/wishlist"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-200"
            aria-label="Wishlist"
          >
            <Heart className="h-[18px] w-[18px]" strokeWidth={2} />
            {wishlistCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-pink px-0.5 text-[8px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </a>
          <a
            href="/account"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-200"
            aria-label="Account"
          >
            <User className="h-[18px] w-[18px]" strokeWidth={2} />
          </a>
          <button
            ref={cartIconRef}
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-200"
            aria-label="Cart"
            id="nav-cart-icon"
          >
            <div className="relative">
              <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </div>
          </button>
        </div>
      </nav>
    </header>

    {/* Cart Drawer */}
    <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

export function getCartIconPosition(): { x: number; y: number } | null {
  if (typeof document === "undefined") return null;
  const el = document.getElementById("nav-cart-icon");
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}
