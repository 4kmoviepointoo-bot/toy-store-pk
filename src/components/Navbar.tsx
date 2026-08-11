"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ShoppingCart, Search, Heart, Menu, X, User, Package, LogOut, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

const CartDrawer = dynamic(
  () => import("./CartDrawer").then((m) => m.CartDrawer),
  { ssr: false }
);

export function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <header className="sticky top-0 z-50 bg-navy/90 backdrop-blur-xl border-b border-border/60 shadow-premium-sm">
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-3 lg:px-8">
        {/* Mobile Logo */}
        <a href="/" className="flex items-center gap-2.5 shrink-0 group lg:hidden">
          <span className="text-2xl transition-transform duration-300 group-hover:scale-110" role="img" aria-label="teddy bear">
            🧸
          </span>
          <span className="text-[18px] font-extrabold tracking-tight rainbow-text">
            ToyVerse
          </span>
        </a>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 min-w-0 mx-4 lg:mx-6">
          <div className="relative w-full group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
              <Search className="h-4 w-4" strokeWidth={2} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for toys, games, and more..."
              className="w-full rounded-full border border-border/80 bg-surface/80 py-2.5 pl-11 pr-12 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:bg-surface focus:ring-2 focus:ring-brand/10 transition-all duration-200"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-dark transition-colors duration-200"
            >
              <Search className="h-3.5 w-3.5" strokeWidth={2.5} />
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
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${accountOpen ? "rotate-180" : ""}`} />
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

        {/* Mobile Toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary hover:bg-brand-light hover:text-brand transition-all duration-200"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" strokeWidth={2} />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={2} />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border/60 bg-navy/98 backdrop-blur-xl animate-fade-in-up overflow-hidden">
          <div className="mx-auto max-w-7xl px-5 py-5 flex flex-col gap-1.5">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative mb-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                <Search className="h-4 w-4" strokeWidth={2} />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for toys..."
                className="w-full rounded-xl border border-border/80 bg-surface/80 py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 transition-all duration-200"
              />
            </form>
            {/* Mobile Actions */}
            <div className="mt-2 flex items-center gap-3 border-t border-border/40 pt-4">
              <a
                href="/track-order"
                className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-text-secondary hover:text-brand hover:bg-brand-light/60 transition-all duration-200"
                onClick={() => setMobileOpen(false)}
              >
                <Package className="h-5 w-5" strokeWidth={2} />
                Track Order
              </a>
              <a
                href="/wishlist"
                className="relative flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-text-secondary hover:text-brand hover:bg-brand-light/60 transition-all duration-200"
                onClick={() => setMobileOpen(false)}
              >
                <Heart className="h-5 w-5" strokeWidth={2} />
                Wishlist
                {wishlistCount > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white">
                    {wishlistCount}
                  </span>
                )}
              </a>
              {user ? (
                <>
                  <div className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand bg-brand-light/40">
                    <User className="h-5 w-5" strokeWidth={2} />
                    Hi, {user.name.split(" ")[0]}
                  </div>
                  <a
                    href="/account"
                    className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-text-secondary hover:text-brand hover:bg-brand-light/60 transition-all duration-200"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Package className="h-5 w-5" strokeWidth={2} />
                    My Orders
                  </a>
                  <button
                    type="button"
                    onClick={async () => { await handleLogout(); setMobileOpen(false); }}
                    className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all duration-200"
                  >
                    <LogOut className="h-5 w-5" strokeWidth={2} />
                    Logout
                  </button>
                </>
              ) : (
                <a
                  href="/account"
                  className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-text-secondary hover:text-brand hover:bg-brand-light/60 transition-all duration-200"
                  onClick={() => setMobileOpen(false)}
                >
                  <User className="h-5 w-5" strokeWidth={2} />
                  Account
                </a>
              )}
              <button
                type="button"
                onClick={() => { setCartOpen(true); setMobileOpen(false); }}
                className="relative flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-text-secondary hover:text-brand hover:bg-brand-light/60 transition-all duration-200"
              >
                <ShoppingCart className="h-5 w-5" strokeWidth={2} />
                Cart
                {cartCount > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>

    {/* Cart Drawer — rendered outside <header> to escape backdrop-blur stacking context */}
    <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
