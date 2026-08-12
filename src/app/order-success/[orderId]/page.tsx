"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import {
  CheckCircle2,
  Package,
  CreditCard,
  MapPin,
  ArrowRight,
  Loader2,
  Navigation,
  Tag,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { InvoiceDownload } from "@/components/InvoiceDownload";

interface OrderItem {
  name: string;
  price: string;
  image: string;
  quantity: number;
}

interface OrderData {
  _id?: string;
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  couponCode: string | null;
  couponDiscount: number;
  total: number;
  customer?: { name: string; phone: string; email: string | null };
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  delivery?: { address: string; city: string };
  paymentMethod: string;
  paymentLabel: string;
  paymentIcon?: string;
  status: string;
  userId?: string;
}

const STORAGE_KEY = "toyverse-last-order";
const RECENT_ORDERS_KEY = "toyverse_recent_orders";
const LEGACY_ACTIVE_KEY = "toyverse_active_order";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923037663472";

function getWhatsAppUrl(o: OrderData): string {
  const customerName = o.name || o.customer?.name || "";
  const customerPhone = o.phone || o.customer?.phone || "";
  const items = o.items.map((i) => `• ${i.quantity}x ${i.name} — ${i.price}`).join("%0A");
  const msg = [
    `Hi ToyVerse! 🧸`,
    ``,
    `I just placed an order and want to confirm it.`,
    ``,
    `Order ID: ${o.orderId}`,
    `Name: ${customerName}`,
    `Phone: ${customerPhone}`,
    ``,
    `Items:`,
    items,
    ``,
    `Total: Rs. ${o.total.toLocaleString()}`,
    `Payment: ${o.paymentLabel}`,
    ``,
    `Thank you!`,
  ].join("%0A");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}

function normalizeOrder(raw: Record<string, unknown>): OrderData {
  const customer = raw.customer as { name?: string; phone?: string; email?: string | null } | undefined;
  const delivery = raw.delivery as { address?: string; city?: string } | undefined;
  return {
    _id: (raw._id as string) || undefined,
    orderId: (raw.orderId as string) || "",
    items: (raw.items as OrderItem[]) || [],
    subtotal: (raw.subtotal as number) || 0,
    shipping: (raw.shipping as number) || 0,
    couponCode: (raw.couponCode as string) || null,
    couponDiscount: (raw.couponDiscount as number) || 0,
    total: (raw.total as number) || 0,
    customer: customer ? { name: customer.name || "", phone: customer.phone || "", email: customer.email || null } : undefined,
    name: (raw.name as string) || customer?.name || "",
    phone: (raw.phone as string) || customer?.phone || "",
    email: (raw.email as string) || customer?.email || "",
    address: (raw.address as string) || delivery?.address || "",
    city: (raw.city as string) || delivery?.city || "",
    delivery: delivery ? { address: delivery.address || "", city: delivery.city || "" } : undefined,
    paymentMethod: (raw.paymentMethod as string) || "cod",
    paymentLabel: (raw.paymentLabel as string) || "Cash on Delivery",
    paymentIcon: (raw.paymentIcon as string) || "💵",
    status: (raw.status as string) || "pending",
    userId: (raw.userId as string) || undefined,
  };
}

export default function OrderSuccessPage(props: { params: Promise<{ orderId: string }> }) {
  const params = use(props.params);
  const orderId = params.orderId;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const { clearCart } = useCart();
  const { user } = useAuth();

  // Account creation state
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountSuccess, setAccountSuccess] = useState(false);

  // Modal state
  const [showAccountModal, setShowAccountModal] = useState(false);

  useEffect(() => {
    // Try sessionStorage first
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.orderId === orderId) {
          const normalized = normalizeOrder(parsed);
          setOrder(normalized);

          // Migrate legacy single order key if it exists
          try {
            const legacyRaw = localStorage.getItem(LEGACY_ACTIVE_KEY);
            if (legacyRaw) {
              const legacy: { orderId?: string; phone?: string } = JSON.parse(legacyRaw);
              if (legacy.orderId && legacy.phone) {
                const existing = JSON.parse(localStorage.getItem(RECENT_ORDERS_KEY) || "[]");
                if (!existing.some((o: { orderId: string }) => o.orderId === legacy.orderId)) {
                  existing.unshift({ orderId: legacy.orderId, phone: legacy.phone, createdAt: "" });
                  localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(existing));
                }
              }
              localStorage.removeItem(LEGACY_ACTIVE_KEY);
            }
          } catch {}

          // Append new order to recent orders (newest first, skip duplicates)
          const recent: Array<{ orderId: string; phone: string; createdAt: string }> = JSON.parse(
            localStorage.getItem(RECENT_ORDERS_KEY) || "[]"
          );
          if (!recent.some((o) => o.orderId === normalized.orderId)) {
            recent.unshift({
              orderId: normalized.orderId,
              phone: normalized.phone || "",
              createdAt: new Date().toISOString(),
            });
            localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(recent));
          }

          clearCart();
          setLoaded(true);
          return;
        }
      } catch {
        // invalid data, fall through to API
      }
    }

    // Fallback: fetch from API
    fetch(`/api/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Order not found");
        return res.json();
      })
      .then((data) => {
        if (data.success && data.data) {
          const normalized = normalizeOrder(data.data);
          setOrder(normalized);
          clearCart();
        } else {
          setFetchError(true);
        }
      })
      .catch(() => {
        setFetchError(true);
      })
      .finally(() => {
        setLoaded(true);
      });
  }, [orderId, clearCart]);

  // Auto-show modal for guest users after order loads
  useEffect(() => {
    if (loaded && order && !user && !accountSuccess && !order.userId) {
      const timer = setTimeout(() => setShowAccountModal(true), 800);
      return () => clearTimeout(timer);
    }
  }, [loaded, order, user, accountSuccess]);

  const handleCreateAccount = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!order || !password.trim() || password.length < 6 || isCreating) return;

      setIsCreating(true);
      setAccountError(null);

      try {
        const res = await fetch("/api/auth/convert-guest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.orderId, password: password.trim() }),
          signal: AbortSignal.timeout(15000),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to create account");
        }

        setAccountSuccess(true);
        setPassword("");
        // Close modal after short delay
        setTimeout(() => setShowAccountModal(false), 1200);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setAccountError(message);
      } finally {
        setIsCreating(false);
      }
    },
    [order, password, isCreating]
  );

  const closeModal = useCallback(() => {
    setShowAccountModal(false);
    setAccountError(null);
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-dvh flex flex-col bg-navy">

        <main className="flex-1 flex items-center justify-center px-5 py-16">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2 className="h-5 w-5 animate-spin text-purple" />
            <span className="text-sm">Loading your order…</span>
          </div>
        </main>
      </div>
    );
  }

  if (!order || fetchError) {
    return (
      <div className="min-h-dvh flex flex-col bg-navy">

        <main className="flex-1 flex items-center justify-center px-5 py-16">
          <div className="text-center max-w-md">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0e2f2b]">
                <Package className="h-10 w-10 text-brand" strokeWidth={1.5} />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-2">
              No Order Found
            </h1>
            <p className="text-sm text-text-secondary mb-8">
              We couldn&apos;t find any recent order details. Please place an order first.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#1c7865] px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#228e78] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Start Shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const customerName = order.name || order.customer?.name || "";
  const customerPhone = order.phone || order.customer?.phone || "";
  const customerEmail = order.email || order.customer?.email || "";
  const deliveryAddress = order.address || order.delivery?.address || "";
  const deliveryCity = order.city || order.delivery?.city || "";
  const hasAccount = !!order.userId || accountSuccess;

  return (
    <div className="min-h-dvh flex flex-col bg-navy">

      <main className="flex-1">
        <div className="mx-auto max-w-[900px] px-5 sm:px-6 lg:px-10 py-8 sm:py-12">
          {/* Success Header */}
          <div className="text-center mb-10">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#0e2f2b]">
                  <CheckCircle2 className="h-12 w-12 text-[#1c7865]" strokeWidth={1.5} />
                </div>
                <span className="absolute -top-2 -right-2 text-2xl animate-float">🧸</span>
                <span className="absolute -bottom-1 -left-3 text-xl animate-float [animation-delay:0.3s]">🎲</span>
                <span className="absolute top-0 -left-4 text-lg animate-float [animation-delay:0.6s]">🎨</span>
                <span className="absolute -bottom-2 right-0 text-lg animate-float [animation-delay:0.9s]">🪀</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-sm text-text-secondary mb-1">
              Thank you for shopping with ToyVerse Pakistan!
            </p>
            <p className="text-[12px] text-text-muted">
              We&apos;ll send you a confirmation shortly.
            </p>
          </div>

          {/* Order ID Card */}
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#1c7865] to-[#38a169] p-[1px]">
            <div className="rounded-2xl bg-[#0e2f2b] px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6b9f97] mb-0.5">
                  Order ID
                </p>
                <p className="text-xl font-extrabold text-[#e6fffa] tracking-wide">
                  {order.orderId}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6b9f97] mb-0.5">
                  Total Amount
                </p>
                <p className="text-lg font-extrabold text-[#ecc94b]">
                  Rs. {order.total.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            {/* Left — Details */}
            <div className="space-y-5">
              {/* Customer Info */}
              <div className="rounded-2xl bg-[#0e2f2b] border border-[#184841] shadow-premium-sm p-5 sm:p-6">
                <h2 className="text-sm font-extrabold text-[#e6fffa] mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#1c7865]/20 text-[11px]">👤</span>
                  Customer Details
                </h2>
                <div className="grid gap-3 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-[#a0b4b0]">Name</span>
                    <span className="font-semibold text-[#e6fffa]">{customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a0b4b0]">Phone</span>
                    <span className="font-semibold text-[#e6fffa]">{customerPhone}</span>
                  </div>
                  {customerEmail && (
                    <div className="flex justify-between">
                      <span className="text-[#a0b4b0]">Email</span>
                      <span className="font-semibold text-[#e6fffa]">{customerEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="rounded-2xl bg-[#0e2f2b] border border-[#184841] shadow-premium-sm p-5 sm:p-6">
                <h2 className="text-sm font-extrabold text-[#e6fffa] mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#38a169]" strokeWidth={2} />
                  Delivery Address
                </h2>
                <p className="text-[13px] text-[#a0b4b0] leading-relaxed">
                  {deliveryAddress}
                </p>
                <p className="text-[13px] font-semibold text-[#e6fffa] mt-1">
                  {deliveryCity}
                </p>
              </div>

              {/* Payment Method */}
              <div className="rounded-2xl bg-[#0e2f2b] border border-[#184841] shadow-premium-sm p-5 sm:p-6">
                <h2 className="text-sm font-extrabold text-[#e6fffa] mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[#1c7865]" strokeWidth={2} />
                  Payment Method
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{order.paymentIcon || "💵"}</span>
                  <div>
                    <p className="text-[13px] font-bold text-[#e6fffa]">{order.paymentLabel}</p>
                    <p className="text-[11px] text-[#6b9f97]">
                      {order.paymentMethod === "cod"
                        ? "Pay when your order arrives"
                        : "Payment details will be shared after order confirmation"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Order Summary */}
            <div className="lg:sticky lg:top-24 lg:self-start space-y-5">
              {/* Order Summary */}
              <div className="rounded-2xl bg-[#0e2f2b] border border-[#184841] shadow-premium-sm overflow-hidden">
                <div className="border-b border-[#184841] px-5 py-4">
                  <h2 className="text-sm font-extrabold text-[#e6fffa] flex items-center gap-2">
                    <Package className="h-4 w-4 text-[#ecc94b]" strokeWidth={2} />
                    Order Summary
                  </h2>
                </div>

                {/* Items */}
                <div className="px-5 py-4">
                  <div className="flex flex-col gap-4">
                    {order.items.map((item) => (
                      <div key={item.name} className="flex gap-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#123d37] border border-[#184841]">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                            unoptimized={item.image.startsWith("data:")}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[12px] font-bold text-[#e6fffa] leading-snug line-clamp-2">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-[#6b9f97]">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-[11px] font-bold text-[#ecc94b]">
                              {item.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-[#184841] px-5 py-4 space-y-2">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#a0b4b0]">Subtotal</span>
                    <span className="font-semibold text-[#e6fffa]">Rs. {order.subtotal.toLocaleString()}</span>
                  </div>
                  {order.couponCode && order.couponDiscount > 0 && (
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#38a169] font-medium flex items-center gap-1.5">
                        <Tag className="h-3 w-3" strokeWidth={2} />
                        {order.couponCode}
                      </span>
                      <span className="font-semibold text-[#38a169]">- Rs. {order.couponDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#a0b4b0]">Shipping</span>
                    <span className={`font-semibold ${order.shipping === 0 ? "text-[#38a169]" : "text-[#e6fffa]"}`}>
                      {order.shipping === 0 ? "FREE" : `Rs. ${order.shipping.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="h-px bg-[#184841] my-1" />
                  <div className="flex justify-between">
                    <span className="text-sm font-bold text-[#e6fffa]">Total Paid</span>
                    <span className="text-lg font-extrabold text-[#ecc94b]">
                      Rs. {order.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 space-y-3">
                  <a
                    href={getWhatsAppUrl(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] py-3.5 text-sm font-bold text-white shadow-lg hover:shadow-[#25D366]/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 1.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Confirm via WhatsApp
                  </a>
                  <div className="flex w-full">
                    <InvoiceDownload order={order} />
                  </div>
                  <Link
                    href="/track-order"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1c7865] py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#228e78] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
                  >
                    <Navigation className="h-4 w-4" />
                    Track Your Order
                  </Link>
                  <Link
                    href="/"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#184841] bg-[#123d37] py-3.5 text-sm font-bold text-[#a0b4b0] hover:text-[#e6fffa] hover:border-[#1c7865]/40 transition-all duration-300"
                  >
                    Continue Shopping
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Account Created Success (inline, after modal closes) */}
              {accountSuccess && !showAccountModal && (
                <div className="rounded-2xl bg-[#0e2f2b] border border-[#1c7865]/30 shadow-premium-sm p-5 text-center animate-fade-in-up">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1c7865]/20 mx-auto mb-3">
                    <CheckCircle2 className="h-6 w-6 text-[#1c7865]" strokeWidth={2} />
                  </div>
                  <h3 className="text-sm font-extrabold text-[#e6fffa] mb-1">Account Created!</h3>
                  <p className="text-[11px] text-[#a0b4b0]">
                    You can now track your orders and enjoy a faster checkout experience.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ========== Account Creation Modal ========== */}
      {showAccountModal && !hasAccount && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in-up"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="relative w-full max-w-md bg-[#0e2f2b] border border-[#1c7865] rounded-2xl shadow-2xl overflow-hidden">
            {/* Close Button */}
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#123d37] border border-[#184841] text-[#a0b4b0] hover:text-[#e6fffa] hover:bg-[#184841] transition-all duration-200"
              aria-label="Close"
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>

            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-[#184841]">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1c7865]/20">
                  <UserPlus className="h-5 w-5 text-[#1c7865]" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#e6fffa]">
                    Track Your Order Easily
                  </h2>
                  <p className="text-[11px] text-[#a0b4b0]">
                    Save your details for faster checkout
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateAccount} className="p-6 space-y-4">
              {/* Auto-filled info (read-only) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl bg-[#123d37] border border-[#184841] px-3 py-2.5">
                  <span className="text-[11px] text-[#6b9f97]">Email</span>
                  <span className="text-[12px] font-semibold text-[#e6fffa] truncate ml-2 max-w-[200px]">
                    {customerEmail || "Not provided"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#123d37] border border-[#184841] px-3 py-2.5">
                  <span className="text-[11px] text-[#6b9f97]">Phone</span>
                  <span className="text-[12px] font-semibold text-[#e6fffa]">
                    {customerPhone}
                  </span>
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="modal-account-password" className="block text-[12px] font-bold text-[#e6fffa] mb-1.5">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b9f97]" strokeWidth={2} />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="modal-account-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setAccountError(null); }}
                    placeholder="Min. 6 characters"
                    className="w-full rounded-xl border border-[#184841] bg-[#123d37] pl-10 pr-10 py-3 text-sm text-[#e6fffa] placeholder:text-[#6b9f97] focus:bg-[#0e2f2b] focus:outline-none focus:ring-2 focus:ring-[#1c7865]/30 focus:border-[#1c7865]/50 transition-all duration-300"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b9f97] hover:text-[#a0b4b0] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={2} /> : <Eye className="h-4 w-4" strokeWidth={2} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {accountError && (
                <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-red-400 leading-snug">{accountError}</p>
                </div>
              )}

              {/* Success inside modal */}
              {accountSuccess && (
                <div className="flex items-center gap-2 rounded-xl bg-[#1c7865]/10 border border-[#1c7865]/20 px-3 py-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#1c7865] shrink-0" />
                  <p className="text-[11px] text-[#1c7865] font-medium">Account created successfully!</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!password.trim() || password.length < 6 || isCreating || accountSuccess}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition-all duration-300 ${
                  password.trim() && password.length >= 6 && !isCreating && !accountSuccess
                    ? "bg-[#1c7865] hover:bg-[#228e78] shadow-lg hover:shadow-[#1c7865]/20 hover:scale-[1.01] active:scale-[0.99]"
                    : "bg-[#184841] cursor-not-allowed"
                }`}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : accountSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Done!
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Save Account &amp; Track Order
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-[#6b9f97]">
                You can track orders, save addresses, and checkout faster next time.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
