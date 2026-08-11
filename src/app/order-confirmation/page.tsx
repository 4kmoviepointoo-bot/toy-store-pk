"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Package, CreditCard, MapPin, ArrowRight, Loader2, Navigation, Tag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";

interface OrderItem {
  name: string;
  price: string;
  image: string;
  quantity: number;
}

interface OrderData {
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  couponCode: string | null;
  couponDiscount: number;
  total: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  paymentMethod: string;
  paymentLabel: string;
  paymentIcon: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
}

const STORAGE_KEY = "toyverse-last-order";
const RECENT_ORDERS_KEY = "toyverse_recent_orders";
const LEGACY_ACTIVE_KEY = "toyverse_active_order";

function generateOrderId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "TV-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923037663472";

function getWhatsAppUrl(o: OrderData): string {
  const items = o.items.map((i) => `• ${i.quantity}x ${i.name} — ${i.price}`).join("%0A");
  const msg = [
    `Hi ToyVerse! 🧸`,
    ``,
    `I just placed an order and want to confirm it.`,
    ``,
    `Order ID: ${o.orderId}`,
    `Name: ${o.name}`,
    `Phone: ${o.phone}`,
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

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const { clearCart } = useCart();

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setOrder(parsed);

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
        if (!recent.some((o) => o.orderId === parsed.orderId)) {
          recent.unshift({
            orderId: parsed.orderId,
            phone: parsed.phone,
            createdAt: new Date().toISOString(),
          });
          localStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(recent));
        }

        clearCart();
      } catch {
        // invalid data
      }
    }
    setLoaded(true);
  }, [clearCart]);

  if (!loaded) {
    return (
      <div className="min-h-dvh flex flex-col bg-navy">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-5 py-16">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2 className="h-5 w-5 animate-spin text-purple" />
            <span className="text-sm">Loading your order…</span>
          </div>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-dvh flex flex-col bg-navy">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-5 py-16">
          <div className="text-center max-w-md">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-light">
                <Package className="h-10 w-10 text-purple" strokeWidth={1.5} />
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
              className="inline-flex items-center gap-2 rounded-2xl rainbow-gradient px-8 py-3.5 text-sm font-bold text-white shadow-premium-brand hover:shadow-lg hover:shadow-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Start Shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-navy">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-[900px] px-5 sm:px-6 lg:px-10 py-8 sm:py-12">
          {/* Success Header */}
          <div className="text-center mb-10">
            {/* Toy-themed illustration */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-light">
                  <CheckCircle2 className="h-12 w-12 text-green" strokeWidth={1.5} />
                </div>
                {/* Decorative toys around the checkmark */}
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
          <div className="mb-6 rounded-2xl rainbow-gradient p-[1px]">
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
                  {new Date().toLocaleDateString("en-PK", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            {/* Left — Details */}
            <div className="space-y-5">
              {/* Customer Info */}
              <div className="rounded-2xl bg-surface border border-border shadow-premium-sm p-5 sm:p-6">
                <h2 className="text-sm font-extrabold text-text-primary mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-pink-light text-[11px]">👤</span>
                  Customer Details
                </h2>
                <div className="grid gap-3 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Name</span>
                    <span className="font-semibold text-text-primary">{order.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Phone</span>
                    <span className="font-semibold text-text-primary">{order.phone}</span>
                  </div>
                  {order.email && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Email</span>
                      <span className="font-semibold text-text-primary">{order.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="rounded-2xl bg-surface border border-border shadow-premium-sm p-5 sm:p-6">
                <h2 className="text-sm font-extrabold text-text-primary mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-cyan" strokeWidth={2} />
                  Delivery Address
                </h2>
                <p className="text-[13px] text-text-secondary leading-relaxed">
                  {order.address}
                </p>
                <p className="text-[13px] font-semibold text-text-primary mt-1">
                  {order.city}
                </p>
              </div>

              {/* Payment Method */}
              <div className="rounded-2xl bg-surface border border-border shadow-premium-sm p-5 sm:p-6">
                <h2 className="text-sm font-extrabold text-text-primary mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-purple" strokeWidth={2} />
                  Payment Method
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{order.paymentIcon}</span>
                  <div>
                    <p className="text-[13px] font-bold text-text-primary">{order.paymentLabel}</p>
                    <p className="text-[11px] text-text-muted">
                      {order.paymentMethod === "cod"
                        ? "Pay when your order arrives"
                        : "Payment details will be shared after order confirmation"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Order Summary */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl bg-surface border border-border shadow-premium-sm overflow-hidden">
                <div className="border-b border-border px-5 py-4">
                  <h2 className="text-sm font-extrabold text-text-primary flex items-center gap-2">
                    <Package className="h-4 w-4 text-orange" strokeWidth={2} />
                    Order Summary
                  </h2>
                </div>

                {/* Items */}
                <div className="px-5 py-4">
                  <div className="flex flex-col gap-4">
                    {order.items.map((item) => (
                      <div key={item.name} className="flex gap-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-light border border-border">
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
                          <h4 className="text-[12px] font-bold text-text-primary leading-snug line-clamp-2">
                            {item.name}
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
                </div>

                {/* Totals */}
                <div className="border-t border-border px-5 py-4 space-y-2">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-text-secondary">Subtotal</span>
                    <span className="font-semibold text-text-primary">Rs. {order.subtotal.toLocaleString()}</span>
                  </div>
                  {order.couponCode && order.couponDiscount > 0 && (
                    <div className="flex justify-between text-[13px]">
                      <span className="text-green font-medium flex items-center gap-1.5">
                        <Tag className="h-3 w-3" strokeWidth={2} />
                        {order.couponCode}
                      </span>
                      <span className="font-semibold text-green">- Rs. {order.couponDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[13px]">
                    <span className="text-text-secondary">Shipping</span>
                    <span className={`font-semibold ${order.shipping === 0 ? "text-green" : "text-text-primary"}`}>
                      {order.shipping === 0 ? "FREE" : `Rs. ${order.shipping.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="h-px bg-border my-1" />
                  <div className="flex justify-between">
                    <span className="text-sm font-bold text-text-primary">Total Paid</span>
                    <span className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink to-purple">
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
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Confirm via WhatsApp
                  </a>
                  <Link
                    href="/track-order"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl rainbow-gradient py-3.5 text-sm font-bold text-white shadow-premium-brand hover:shadow-lg hover:shadow-purple/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
                  >
                    <Navigation className="h-4 w-4" />
                    Track Your Order
                  </Link>
                  <Link
                    href="/"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3.5 text-sm font-bold text-text-secondary hover:text-text-primary hover:border-brand/40 hover:bg-brand-light/30 transition-all duration-300"
                  >
                    Continue Shopping
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
