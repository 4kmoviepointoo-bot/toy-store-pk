"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Phone, MapPin, Package, LogOut, Loader2, Eye, EyeOff } from "lucide-react";

interface Order {
  _id: string;
  orderId: string;
  customer: { name: string; phone: string; email: string | null };
  items: Array<{ name: string; price: string; image: string; quantity: number }>;
  total: number;
  status: string;
  createdAt: string;
}

export default function AccountPage() {
  const { user, loading, login, register, logout } = useAuth();
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginShowPw, setLoginShowPw] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regCity, setRegCity] = useState("");
  const [regShowPw, setRegShowPw] = useState(false);
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/auth/me/orders");
      const data = await res.json();
      if (data.success && data.data?.orders) {
        setOrders(data.data.orders);
      }
    } catch {
      // silently fail
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user, fetchOrders]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    const result = await login(loginEmail, loginPassword);
    setLoginLoading(false);
    if (result.error) setLoginError(result.error);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegLoading(true);
    const result = await register({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      address: regAddress,
      city: regCity,
    });
    setRegLoading(false);
    if (result.error) setRegError(result.error);
  };

  const handleLogout = async () => {
    await logout();
    setOrders([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <Loader2 className="h-8 w-8 text-brand animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-navy py-12 px-5">
        <div className="mx-auto max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-4xl">🧸</span>
            <h1 className="mt-3 text-2xl font-extrabold text-text-primary">
              Welcome to ToyVerse
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Sign in to manage your profile and track orders
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-2xl bg-surface border border-border/60 p-1 mb-6">
            <button
              type="button"
              onClick={() => { setAuthTab("login"); setLoginError(""); setRegError(""); }}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all duration-200 ${
                authTab === "login"
                  ? "bg-brand text-white shadow-md"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthTab("register"); setLoginError(""); setRegError(""); }}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all duration-200 ${
                authTab === "register"
                  ? "bg-brand text-white shadow-md"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Login Form */}
          {authTab === "login" && (
            <form onSubmit={handleLogin} className="rounded-2xl bg-surface border border-border/60 p-6 space-y-4">
              {loginError && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                  {loginError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Email or Phone</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com or 03XXXXXXXXX"
                    className="w-full rounded-xl border border-border/80 bg-navy/60 py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={loginShowPw ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full rounded-xl border border-border/80 bg-navy/60 py-2.5 pl-4 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setLoginShowPw(!loginShowPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                  >
                    {loginShowPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white hover:bg-brand-dark transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loginLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign In
              </button>
            </form>
          )}

          {/* Register Form */}
          {authTab === "register" && (
            <form onSubmit={handleRegister} className="rounded-2xl bg-surface border border-border/60 p-6 space-y-4">
              {regError && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                  {regError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ali Khan"
                    className="w-full rounded-xl border border-border/80 bg-navy/60 py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@example.com (optional)"
                    className="w-full rounded-xl border border-border/80 bg-navy/60 py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Phone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="03XXXXXXXXX"
                    className="w-full rounded-xl border border-border/80 bg-navy/60 py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Password *</label>
                <div className="relative">
                  <input
                    type={regShowPw ? "text" : "password"}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full rounded-xl border border-border/80 bg-navy/60 py-2.5 pl-4 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setRegShowPw(!regShowPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                  >
                    {regShowPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                  <textarea
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Street address (optional)"
                    rows={2}
                    className="w-full rounded-xl border border-border/80 bg-navy/60 py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 transition-all resize-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">City</label>
                <input
                  type="text"
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value)}
                  placeholder="Lahore (optional)"
                  className="w-full rounded-xl border border-border/80 bg-navy/60 py-2.5 px-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={regLoading}
                className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white hover:bg-brand-dark transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {regLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Account
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Authenticated view
  return (
    <div className="min-h-screen bg-navy py-10 px-5">
      <div className="mx-auto max-w-3xl">
        {/* Profile Header */}
        <div className="rounded-2xl bg-surface border border-border/60 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15 text-brand">
                <User className="h-7 w-7" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-text-primary">
                  Hi, {user.name.split(" ")[0]}
                </h1>
                <p className="text-sm text-text-secondary">{user.email || user.phone}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-border/60 px-4 py-2.5 text-sm font-semibold text-text-secondary hover:text-red-400 hover:border-red-500/30 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Profile Details */}
        <div className="rounded-2xl bg-surface border border-border/60 p-6 mb-6">
          <h2 className="text-base font-bold text-text-primary mb-4">Profile Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl bg-navy/60 border border-border/40 px-4 py-3">
              <User className="h-4 w-4 text-brand shrink-0" />
              <div>
                <span className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider">Name</span>
                <span className="block text-sm font-medium text-text-primary">{user.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-navy/60 border border-border/40 px-4 py-3">
              <Mail className="h-4 w-4 text-cyan shrink-0" />
              <div>
                <span className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider">Email</span>
                <span className="block text-sm font-medium text-text-primary">{user.email || "Not provided"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-navy/60 border border-border/40 px-4 py-3">
              <Phone className="h-4 w-4 text-green shrink-0" />
              <div>
                <span className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider">Phone</span>
                <span className="block text-sm font-medium text-text-primary">{user.phone}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-navy/60 border border-border/40 px-4 py-3">
              <MapPin className="h-4 w-4 text-yellow shrink-0" />
              <div>
                <span className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider">City</span>
                <span className="block text-sm font-medium text-text-primary">{user.city || "Not provided"}</span>
              </div>
            </div>
          </div>
          {user.address && (
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-navy/60 border border-border/40 px-4 py-3">
              <MapPin className="h-4 w-4 text-yellow shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider">Address</span>
                <span className="block text-sm font-medium text-text-primary">{user.address}</span>
              </div>
            </div>
          )}
        </div>

        {/* Order History */}
        <div className="rounded-2xl bg-surface border border-border/60 p-6">
          <h2 className="text-base font-bold text-text-primary mb-4">Order History</h2>
          {ordersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 text-brand animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-10 w-10 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-secondary">No orders yet</p>
              <a
                href="/shop"
                className="mt-3 inline-block rounded-xl bg-brand px-5 py-2 text-xs font-bold text-white hover:bg-brand-dark transition-colors"
              >
                Start Shopping
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="rounded-xl bg-navy/60 border border-border/40 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-brand">#{order.orderId}</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        order.status === "delivered"
                          ? "bg-green/15 text-green"
                          : order.status === "cancelled"
                          ? "bg-red-500/15 text-red-400"
                          : "bg-yellow/15 text-yellow"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="text-xs text-text-secondary mb-1">
                    {new Date(order.createdAt).toLocaleDateString("en-PK", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-xs text-text-muted mb-2">
                    {order.items.length} item{order.items.length > 1 ? "s" : ""} — Rs. {order.total.toLocaleString()}
                  </div>
                  <a
                    href={`/order-success/${order.orderId}`}
                    className="text-[11px] font-bold text-brand hover:text-green transition-colors"
                  >
                    View Details →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
