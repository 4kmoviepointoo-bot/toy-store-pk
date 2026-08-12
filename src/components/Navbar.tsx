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

  const getCartIconRect = useCallback(() => {
    return cartIconRef.current?.getBoundingClientRect() || null;
  }, []);

  return (
    <>
    <header className="sticky top-0 z-50 bg-navy/90 backdrop-blur-xl border-b border-border/60 shadow-premium-sm">
      {/* Main nav row */}
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Mobile Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0 group lg:hidden">
          <span className="text-xl transition-transform duration-300 group-hover:scale-110" role="img" aria-label="teddy bear">
            🧸
          </span>
          <span className="text-[16px] font-extrabold tracking-tight rainbow-text">
            ToyVerse
          </span>
        </a>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 min-w-0 mx-2 sm:mx-4 lg:mx-6">
          <div className="relative w-full group">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
              <Search className="h-4 w-4" strokeWidth={2} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for toys, games, and more..."
              className="w-full rounded-full border border-border/80 bg-surface/80 py-2 pl-10 pr-10 sm:pr-12 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:bg-surface focus:ring-2 focus:ring-brand/10 transition-all duration-200"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-dark transition-colors duration-200"
            >
              <Search className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={2.5} />
            </button>
          </div>
        </form>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2">
          <a
            href="/track-order"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-text-secondary hover:text-brand hover:bg-brand-light transition-all duration-200"
          >
            <Package className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>Track Order</span>
          </a>
          <a
            href="/wishlist"
            className="relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-text-secondary hover:text-brand hover:bg-brand-light transition-all duration-200"
          >
            <Heart className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>Wishlist</span>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white">
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
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-text-secondary hover:text-brand hover:bg-brand-light transition-all duration-200"
              >
                <User className="h-[18px] w-[18px]" strokeWidth={2} />
                <span className="hidden xl:inline">Hi, {user.name.split(" ")[0]}</span>
                <svg className={`h-3 w-3 transition-transform duration-200 ${accountOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              </button>
            ) : (
              <a
                href="/account"
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-text-secondary hover:text-brand hover:bg-brand-light transition-all duration-200"
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
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-brand hover:bg-brand-light/60 transition-all"
                >
                  <User className="h-4 w-4" />
                  Profile
                </a>
                <a
                  href="/account"
                  onClick={() => setAccountOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-brand hover:bg-brand-light/60 transition-all"
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
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-text-secondary hover:text-brand hover:bg-brand-light transition-all duration-200"
          >
            <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={2} />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Utility Icons — always visible, no hamburger needed */}
        <div className="flex lg:hidden items-center gap-1">
          <a
            href="/track-order"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary hover:text-brand hover:bg-brand-light/60 transition-all duration-200"
            aria-label="Track Order"
          >
            <Package className="h-[18px] w-[18px]" strokeWidth={2} />
          </a>
          <a
            href="/wishlist"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary hover:text-brand hover:bg-brand-light/60 transition-all duration-200"
            aria-label="Wishlist"
          >
            <Heart className="h-[18px] w-[18px]" strokeWidth={2} />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-brand px-0.5 text-[8px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </a>
          <a
            href="/account"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary hover:text-brand hover:bg-brand-light/60 transition-all duration-200"
            aria-label="Account"
          >
            <User className="h-[18px] w-[18px]" strokeWidth={2} />
          </a>
          <button
            ref={cartIconRef}
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary hover:text-brand hover:bg-brand-light/60 transition-all duration-200"
            aria-label="Cart"
            id="nav-cart-icon"
          >
            <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={2} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-brand px-0.5 text-[8px] font-bold text-white">
                {cartCount}
              </span>
            )}
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
