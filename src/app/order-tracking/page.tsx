"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Package,
  Truck,
  Check,
  Loader2,
  AlertCircle,
  ArrowLeft,
  MapPin,
  Phone,
  CreditCard,
  ShoppingBag,
} from "lucide-react";

interface OrderItem {
  name: string;
  price: string;
  image: string;
  quantity: number;
}

interface OrderData {
  orderId: string;
  date: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  delivery: { address: string; city: string };
  customer?: { name: string; phone: string; email: string | null };
  paymentLabel: string;
}

const STAGES = [
  { label: "Order Placed", icon: "📦" },
  { label: "Processing", icon: "⚙️" },
  { label: "Dispatched", icon: "🚚" },
  { label: "Delivered", icon: "🎉" },
];

function getStageIndex(status?: string): number {
  switch ((status || "").toLowerCase()) {
    case "placed":
    case "pending":
      return 0;
    case "confirmed":
    case "processing":
      return 1;
    case "shipped":
    case "dispatched":
      return 2;
    case "delivered":
      return 3;
    default:
      return 0;
  }
}

function isBase64(src?: string): boolean {
  return !!src && src.startsWith("data:");
}

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderData | null>(null);

  const runSearch = useCallback(
    async (raw: string) => {
      const q = raw.trim();
      if (!q) return;
      setLoading(true);
      setError(null);
      setOrder(null);

      const isPhone = /^\d/.test(q);
      const param = isPhone ? "phone" : "orderId";

      try {
        const res = await fetch(`/api/orders?${param}=${encodeURIComponent(q)}`, {
          signal: AbortSignal.timeout(15000),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Order not found");

        const found: OrderData | null = data.order || (data.orders && data.orders[0]) || null;
        if (!found) throw new Error("No order found for this lookup");

        setOrder(found);
        router.replace(`/order-tracking?id=${found.orderId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setQuery(id);
      runSearch(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  const isCancelled = order?.status?.toLowerCase() === "cancelled";
  const currentStage = isCancelled ? -1 : getStageIndex(order?.status);

  return (
    <div className="min-h-dvh flex flex-col bg-navy">
      <main className="flex-1">
        <div className="mx-auto max-w-[760px] px-5 sm:px-6 lg:px-10 py-8 sm:py-12">
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
              Track Your Order
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Enter your Order ID or phone number to see live status.
            </p>
          </div>

          {/* Search Box */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-surface border border-border shadow-premium-sm p-3 sm:p-4 flex items-center gap-2 sm:gap-3"
          >
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Search className="h-5 w-5" strokeWidth={2} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Order ID (e.g. TV-AB12CD) or phone (03XXXXXXXXX)"
              aria-label="Order ID or phone number"
              className="w-full bg-transparent text-sm sm:text-[15px] text-text-primary placeholder:text-text-muted outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="shrink-0 flex items-center gap-2 rounded-xl bg-brand px-4 sm:px-5 py-2.5 sm:py-3 text-[13px] sm:text-sm font-bold text-white hover:bg-brand-dark active:scale-[0.98] transition-all duration-200 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4" strokeWidth={2.5} />
                  Track
                </>
              )}
            </button>
          </form>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3 text-text-secondary">
                <Loader2 className="h-5 w-5 animate-spin text-brand" />
                <span className="text-sm">Looking up your order…</span>
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="mt-6 rounded-2xl bg-surface border border-border shadow-premium-sm p-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                  <AlertCircle className="h-8 w-8 text-red-400" strokeWidth={1.5} />
                </div>
              </div>
              <h2 className="text-lg font-bold text-text-primary mb-1">Couldn&apos;t find your order</h2>
              <p className="text-sm text-text-secondary mb-6">{error}</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-2xl rainbow-gradient px-8 py-3.5 text-sm font-bold text-white shadow-premium-brand hover:shadow-lg hover:shadow-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                Shop Now
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Result */}
          {!loading && order && (
            <div className="mt-6 space-y-6">
              {/* Stepper */}
              <div className="rounded-2xl bg-surface border border-border shadow-premium-sm p-6 sm:p-8">
                {isCancelled ? (
                  <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-4">
                    <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                    <p className="text-sm font-bold text-red-400">This order has been cancelled.</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div
                      className="absolute top-7 h-1 bg-surface-light rounded-full"
                      style={{ left: "12.5%", right: "12.5%" }}
                    />
                    <div
                      className="step-line-fill absolute top-7 h-1 bg-brand rounded-full"
                      style={{ left: "12.5%", width: `${(Math.min(currentStage, 3) / 3) * 75}%` }}
                    />
                    <div className="relative flex items-start justify-between gap-2">
                      {STAGES.map((s, i) => {
                        const completed = i < currentStage;
                        const active = i === currentStage;
                        return (
                          <div
                            key={s.label}
                            className="step-node flex-1 flex flex-col items-center text-center"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          >
                            <div
                              className={`relative flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                                completed
                                  ? "border-amber-400 bg-amber-400/10"
                                  : active
                                  ? "border-brand bg-brand/15 shadow-[0_0_0_4px_rgba(28,120,101,0.18),0_0_22px_rgba(28,120,101,0.45)]"
                                  : "border-border bg-surface"
                              }`}
                            >
                              {completed ? (
                                <Check className="h-6 w-6 text-amber-400" strokeWidth={3} />
                              ) : (
                                <span className="text-xl" aria-hidden="true">
                                  {s.icon}
                                </span>
                              )}
                              {active && (
                                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 rounded-full bg-brand border-2 border-surface animate-pulse" />
                              )}
                            </div>
                            <p
                              className={`mt-3 text-[11px] sm:text-xs font-semibold ${
                                completed ? "text-amber-400" : active ? "text-brand" : "text-text-muted"
                              }`}
                            >
                              {s.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Order Info + Delivery */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-surface border border-border shadow-premium-sm p-5">
                  <h2 className="text-sm font-extrabold text-text-primary mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand" strokeWidth={2} />
                    Delivery Details
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-text-muted shrink-0 w-20">Order ID</span>
                      <span className="font-bold text-text-primary">{order.orderId}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-text-muted shrink-0 w-20">Name</span>
                      <span className="text-text-primary">{order.customer?.name || "—"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-text-muted shrink-0 w-20">Phone</span>
                      <span className="text-text-primary">{order.customer?.phone || "—"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-text-muted shrink-0 w-20">Address</span>
                      <span className="text-text-primary">
                        {order.delivery?.address}
                        {order.delivery?.city ? `, ${order.delivery.city}` : ""}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-text-muted shrink-0 w-20">Payment</span>
                      <span className="text-text-primary">{order.paymentLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-surface border border-border shadow-premium-sm p-5">
                  <h2 className="text-sm font-extrabold text-text-primary mb-4 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-brand" strokeWidth={2} />
                    Order Summary
                  </h2>
                  <div className="space-y-3 text-sm">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-light border border-border">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                            unoptimized={isBase64(item.image)}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-bold text-text-primary leading-snug line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-text-muted">
                            Qty: {item.quantity} × {item.price}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-border pt-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-text-secondary">Grand Total</span>
                      <span className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink to-purple">
                        Rs. {order.total?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Empty / help note */}
              <div className="flex items-center justify-center gap-2 text-[12px] text-text-muted">
                <Package className="h-4 w-4" />
                Need help? Contact us on WhatsApp for live updates.
              </div>
            </div>
          )}

          {/* Empty initial state */}
          {!loading && !error && !order && (
            <div className="mt-6 rounded-2xl bg-surface border border-border shadow-premium-sm p-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
                  <Truck className="h-8 w-8 text-brand" strokeWidth={1.5} />
                </div>
              </div>
              <h2 className="text-lg font-bold text-text-primary mb-1">Track any order</h2>
              <p className="text-sm text-text-secondary max-w-sm mx-auto">
                Use the search above with your Order ID or the phone number used at checkout.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center text-text-secondary">
          Loading…
        </div>
      }
    >
      <OrderTrackingContent />
    </Suspense>
  );
}
