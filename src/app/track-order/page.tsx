"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { InvoiceDownload } from "@/components/InvoiceDownload";

interface OrderItem {
  title: string;
  price: string;
  quantity: number;
  image: string;
}

interface OrderData {
  orderId: string;
  date: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  total: number;
  delivery: {
    address: string;
    city: string;
  };
  currentLocation: string;
  paymentMethod: string;
}

interface RecentOrder {
  orderId: string;
  phone: string;
  createdAt: string;
}

const STATUS_STEPS = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Package },
] as const;

const STATUS_INDEX: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  shipped: 2,
  delivered: 3,
  cancelled: -1,
};

const STATUS_BADGE: Record<string, { text: string; color: string }> = {
  pending: {
    text: "📍 Order Received & Processing at Warehouse",
    color: "text-orange bg-orange/10 border-orange/30",
  },
  confirmed: {
    text: "📍 Packed & Ready for Dispatch",
    color: "text-blue bg-blue/10 border-blue/30",
  },
  shipped: {
    text: "📍 On the Way (In Transit to Your City)",
    color: "text-purple bg-purple/10 border-purple/30",
  },
  delivered: {
    text: "📍 Delivered to Destination",
    color: "text-green bg-green/10 border-green/30",
  },
};

const RECENT_ORDERS_KEY = "toyverse_recent_orders";
const LEGACY_ACTIVE_KEY = "toyverse_active_order";

export default function TrackOrderPage() {
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fetchOrder = useCallback(async (id: string, ph: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id.trim(), phone: ph.trim() }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Order not found");
      setOrder(data.data?.order || data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load recent orders from localStorage (with backward compatibility)
  useEffect(() => {
    try {
      // Migrate legacy single key
      const legacyRaw = localStorage.getItem(LEGACY_ACTIVE_KEY);
      if (legacyRaw) {
        const legacy: { orderId?: string; phone?: string } = JSON.parse(legacyRaw);
        if (legacy.orderId && legacy.phone) {
          const existing = JSON.parse(localStorage.getItem(RECENT_ORDERS_KEY) || "[]");
          if (!existing.some((o: RecentOrder) => o.orderId === legacy.orderId)) {
            existing.unshift({ orderId: legacy.orderId, phone: legacy.phone, createdAt: "" });
            localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(existing));
          }
        }
        localStorage.removeItem(LEGACY_ACTIVE_KEY);
      }

      const raw = localStorage.getItem(RECENT_ORDERS_KEY);
      if (raw) {
        const parsed: RecentOrder[] = JSON.parse(raw);
        if (parsed.length > 0) {
          setRecentOrders(parsed);
          setSelectedId(parsed[0].orderId);
          fetchOrder(parsed[0].orderId, parsed[0].phone);
          return;
        }
      }

      // Fallback: check sessionStorage for direct checkout flow
      const sessionRaw = sessionStorage.getItem("toyverse-last-order");
      if (sessionRaw) {
        const parsed = JSON.parse(sessionRaw);
        if (parsed.orderId && parsed.phone) {
          const fallback: RecentOrder = {
            orderId: parsed.orderId,
            phone: parsed.phone,
            createdAt: new Date().toISOString(),
          };
          setRecentOrders([fallback]);
          setSelectedId(fallback.orderId);
          fetchOrder(fallback.orderId, fallback.phone);
          return;
        }
      }
    } catch {}
    setLoading(false);
  }, [fetchOrder]);

  const handleSelectOrder = (orderId: string) => {
    if (orderId === selectedId) {
      setDropdownOpen(false);
      return;
    }
    const found = recentOrders.find((o) => o.orderId === orderId);
    if (found) {
      setSelectedId(found.orderId);
      setOrder(null);
      setDropdownOpen(false);
      fetchOrder(found.orderId, found.phone);
    }
  };

  const currentStep = order ? STATUS_INDEX[order.status] ?? -1 : -1;
  const isCancelled = order?.status === "cancelled";
  const statusBadge = order ? STATUS_BADGE[order.status] : null;
  const selectedOrder = recentOrders.find((o) => o.orderId === selectedId);
  const hasMultiple = recentOrders.length > 1;

  return (
    <div className="min-h-dvh flex flex-col bg-navy">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-[700px] px-5 sm:px-6 lg:px-10 py-8 sm:py-12">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-brand transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Store
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Your Orders
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {order
                ? "Here's the latest on your delivery."
                : loading
                ? "Loading your order details…"
                : "View your active orders and track their status."}
            </p>
          </div>

          {/* Order Selector — only when multiple orders exist */}
          {hasMultiple && !loading && (
            <div className="mb-6 relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between gap-3 rounded-2xl bg-surface border border-border shadow-premium-sm px-5 py-4 text-left transition-all duration-200 hover:border-brand/40"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
                    <Package className="h-5 w-5 text-brand" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-0.5">
                      Select Order
                    </p>
                    <p className="text-sm font-extrabold text-text-primary tracking-wide truncate">
                      {selectedOrder?.orderId}
                    </p>
                    {selectedOrder?.createdAt && (
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {new Date(selectedOrder.createdAt).toLocaleDateString("en-PK", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-text-muted shrink-0 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-surface border border-border shadow-premium-lg overflow-hidden animate-fade-in-up">
                  {recentOrders.map((ro) => (
                    <button
                      key={ro.orderId}
                      type="button"
                      onClick={() => handleSelectOrder(ro.orderId)}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-all duration-150 ${
                        ro.orderId === selectedId
                          ? "bg-brand/10 border-l-2 border-brand"
                          : "hover:bg-surface-light border-l-2 border-transparent"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold tracking-wide ${ro.orderId === selectedId ? "text-brand" : "text-text-primary"}`}>
                          {ro.orderId}
                        </p>
                        {ro.createdAt && (
                          <p className="text-[11px] text-text-muted mt-0.5">
                            {new Date(ro.createdAt).toLocaleDateString("en-PK", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                      {ro.orderId === selectedId && (
                        <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Single order tab — shown when only 1 order */}
          {!hasMultiple && selectedOrder && !loading && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-surface border border-border shadow-premium-sm px-5 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
                <Package className="h-5 w-5 text-brand" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-0.5">
                  Tracking Order
                </p>
                <p className="text-sm font-extrabold text-text-primary tracking-wide">
                  {selectedOrder.orderId}
                </p>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3 text-text-secondary">
                <Loader2 className="h-5 w-5 animate-spin text-purple" />
                <span className="text-sm">Loading your order…</span>
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-2xl bg-surface border border-border shadow-premium-sm p-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                  <AlertCircle className="h-8 w-8 text-red-400" strokeWidth={1.5} />
                </div>
              </div>
              <h2 className="text-lg font-bold text-text-primary mb-1">
                Unable to Load Order
              </h2>
              <p className="text-sm text-text-secondary mb-6">{error}</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-2xl rainbow-gradient px-8 py-3.5 text-sm font-bold text-white shadow-premium-brand hover:shadow-lg hover:shadow-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                Shop Now
              </Link>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && !order && recentOrders.length === 0 && (
            <div className="rounded-2xl rainbow-gradient p-[1px]">
              <div className="rounded-2xl bg-surface p-8 sm:p-10 text-center">
                <div className="mb-5 flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple/10">
                    <Package className="h-10 w-10 text-purple" strokeWidth={1.5} />
                  </div>
                </div>
                <h2 className="text-xl font-extrabold text-text-primary mb-2">
                  No Active Order Found
                </h2>
                <p className="text-sm text-text-secondary mb-8 max-w-sm mx-auto">
                  You haven&apos;t placed any order yet or your session expired.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-2xl rainbow-gradient px-8 py-3.5 text-sm font-bold text-white shadow-premium-brand hover:shadow-lg hover:shadow-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  Shop Now
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Order Details */}
          {!loading && order && (
            <div className="space-y-6">
              {/* Live Location Update Card */}
              {order.currentLocation && (
                <div className="rounded-2xl bg-surface border border-border shadow-premium-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan/20 to-blue/20 px-5 py-3 border-b border-border/50">
                    <h2 className="text-sm font-extrabold text-text-primary flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green" />
                      </span>
                      Live Location Update
                    </h2>
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green/10">
                        <MapPin className="h-5 w-5 text-green" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
                          Current Location
                        </p>
                        <p className="text-[14px] font-bold text-text-primary leading-snug">
                          📍 {order.currentLocation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Destination Card */}
              <div className="rounded-2xl bg-surface border border-border shadow-premium-sm overflow-hidden">
                <div className="rainbow-gradient px-5 py-3">
                  <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <MapPin className="h-4 w-4" strokeWidth={2} />
                    Delivery Destination
                  </h2>
                </div>
                <div className="p-5 sm:p-6 space-y-4">
                  {statusBadge && (
                    <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 ${statusBadge.color}`}>
                      <span className="text-lg">📍</span>
                      <span className="text-[13px] font-bold">{statusBadge.text}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan/10">
                      <MapPin className="h-5 w-5 text-cyan" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
                        Shipping To
                      </p>
                      <p className="text-[13px] text-text-secondary leading-relaxed">
                        {order.delivery.address}
                      </p>
                      <p className="text-[14px] font-bold text-text-primary mt-0.5">
                        {order.delivery.city}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Tracker */}
              <div className="rounded-2xl bg-surface border border-border shadow-premium-sm p-5 sm:p-6">
                <h2 className="text-sm font-extrabold text-text-primary mb-6 flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple" strokeWidth={2} />
                  Order Progress
                </h2>

                {isCancelled ? (
                  <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                    <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-red-400">Order Cancelled</p>
                      <p className="text-[12px] text-red-400/70">
                        This order has been cancelled.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
                    <div
                      className="absolute top-5 left-0 h-0.5 bg-green transition-all duration-500"
                      style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                    />
                    <div className="relative flex items-start justify-between gap-2">
                      {STATUS_STEPS.map((step, i) => {
                        const Icon = step.icon;
                        const isActive = i <= currentStep;
                        const isCurrent = i === currentStep;
                        return (
                          <div key={step.key} className="flex-1 flex flex-col items-center text-center">
                            <div
                              className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                                isActive
                                  ? "border-green bg-green/10 text-green"
                                  : "border-border bg-surface-light text-text-muted"
                              } ${isCurrent ? "ring-2 ring-green/30 scale-110 shadow-lg shadow-green/20" : ""}`}
                            >
                              <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                              {isCurrent && (
                                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green border-2 border-surface animate-pulse" />
                              )}
                            </div>
                            <span
                              className={`mt-2 text-[11px] font-semibold ${
                                isActive ? "text-green" : "text-text-muted"
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Details */}
              <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                {/* Left — Info */}
                <div className="space-y-5">
                  {/* Order ID & Date */}
                  <div className="rounded-2xl rainbow-gradient p-[1px]">
                    <div className="rounded-2xl bg-surface px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-0.5">
                          Order ID
                        </p>
                        <p className="text-xl font-extrabold text-text-primary tracking-wide">
                          {order.orderId}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-0.5">
                          Order Date
                        </p>
                        <p className="text-sm font-semibold text-text-primary">
                          {new Date(order.date).toLocaleDateString("en-PK", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="rounded-2xl bg-surface border border-border shadow-premium-sm p-5 sm:p-6">
                    <h2 className="text-sm font-extrabold text-text-primary mb-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-purple" strokeWidth={2} />
                      Payment Method
                    </h2>
                    <p className="text-[13px] font-semibold text-text-primary">
                      {order.paymentMethod}
                    </p>
                  </div>
                </div>

                {/* Right — Items */}
                <div className="lg:sticky lg:top-24 lg:self-start">
                  <div className="rounded-2xl bg-surface border border-border shadow-premium-sm overflow-hidden">
                    <div className="border-b border-border px-5 py-4">
                      <h2 className="text-sm font-extrabold text-text-primary flex items-center gap-2">
                        <Package className="h-4 w-4 text-orange" strokeWidth={2} />
                        Items Ordered
                      </h2>
                    </div>

                    <div className="px-5 py-4 space-y-4">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-light border border-border">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              sizes="56px"
                              className="object-cover"
                              unoptimized={item.image.startsWith("data:")}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[12px] font-bold text-text-primary leading-snug line-clamp-2">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-text-muted">
                                Qty: {item.quantity}
                              </span>
                              <span className="text-[11px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink to-purple">
                                {item.price}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border px-5 py-4">
                      <div className="flex justify-between">
                        <span className="text-sm font-bold text-text-primary">Total</span>
                        <span className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink to-purple">
                          Rs. {order.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <InvoiceDownload
                      order={{
                        orderId: order.orderId,
                        date: order.date,
                        items: order.items.map((item) => ({ name: item.title, price: item.price, quantity: item.quantity })),
                        subtotal: order.total,
                        shipping: 0,
                        couponCode: null,
                        couponDiscount: 0,
                        total: order.total,
                        delivery: order.delivery,
                        paymentLabel: order.paymentMethod,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Continue Shopping */}
              <div className="pt-2">
                <Link
                  href="/"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl rainbow-gradient py-3.5 text-sm font-bold text-white shadow-premium-brand hover:shadow-lg hover:shadow-purple/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
                >
                  Continue Shopping
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
