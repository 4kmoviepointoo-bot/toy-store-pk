"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, CheckCircle2, AlertCircle, Loader2, Tag, X, Check, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";

const shippingFee = 150;

const paymentMethods = [
  { id: "cod", label: "Cash on Delivery", icon: "💵", description: "Pay when your order arrives" },
  { id: "jazzcash", label: "JazzCash", icon: "📱", description: "Mobile account transfer" },
  { id: "easypaisa", label: "Easypaisa", icon: "📱", description: "Mobile account transfer" },
  { id: "bank", label: "Bank Transfer", icon: "🏦", description: "Direct bank deposit" },
];

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
}

function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-]/g, "");
  return /^03\d{9}$/.test(cleaned);
}

function validateEmail(email: string): boolean {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function CheckoutPage() {
  const { items, loaded, selectedItems, selectedSubtotal, clearCart } = useCart();
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponShippingAdj, setCouponShippingAdj] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(3000);
  const [isThresholdEnabled, setIsThresholdEnabled] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((resData) => {
        const data = resData.data || resData;
        if (data.freeDeliveryThreshold !== undefined) setFreeDeliveryThreshold(data.freeDeliveryThreshold);
        if (data.isThresholdEnabled !== undefined) setIsThresholdEnabled(data.isThresholdEnabled);
      })
      .catch(() => {});
  }, []);

  const selectedSet = new Set(selectedItems);
  const checkoutItems = items.filter((i) => selectedSet.has(i.name));
  const subtotal = selectedSubtotal;
  const hasFreeDeliveryItem = checkoutItems.some((i) => i.isFreeDelivery);
  const meetsThreshold = isThresholdEnabled && subtotal >= freeDeliveryThreshold;
  const baseShipping = (hasFreeDeliveryItem || meetsThreshold) ? 0 : shippingFee;
  const shipping = Math.max(0, baseShipping + couponShippingAdj);
  const total = Math.max(0, subtotal - couponDiscount + shipping);

  const errors: FormErrors = useMemo(() => {
    const e: FormErrors = {};
    if (touched.name && !name.trim()) {
      e.name = "Please enter your full name";
    }
    if (touched.phone) {
      if (!phone.trim()) {
        e.phone = "Please enter your phone number";
      } else if (!validatePhone(phone)) {
        e.phone = "Enter a valid Pakistani number (03XXXXXXXXX)";
      }
    }
    if (touched.email && email && !validateEmail(email)) {
      e.email = "Please enter a valid email address";
    }
    if (touched.address && !address.trim()) {
      e.address = "Please enter your delivery address";
    }
    if (touched.city && !city.trim()) {
      e.city = "Please enter your city";
    }
    return e;
  }, [name, phone, email, address, city, touched]);

  const isValid = useMemo(() => {
    return (
      name.trim() !== "" &&
      validatePhone(phone) &&
      validateEmail(email) &&
      address.trim() !== "" &&
      city.trim() !== ""
    );
  }, [name, phone, email, address, city]);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleApplyCoupon = useCallback(async () => {
    const code = couponInput.trim();
    if (!code) return;

    setCouponLoading(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
        signal: AbortSignal.timeout(10000),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setCouponError(data.message || "Invalid coupon code");
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponShippingAdj(0);
        return;
      }

      setAppliedCoupon(code.toUpperCase());
      setCouponDiscount(data.discountAmount);
      setCouponShippingAdj(data.shippingAdjustment);
      setCouponSuccess(data.message);
      setCouponError(null);
    } catch {
      setCouponError("Failed to validate coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  }, [couponInput, subtotal]);

  const handleRemoveCoupon = useCallback(() => {
    setCouponInput("");
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponShippingAdj(0);
    setCouponError(null);
    setCouponSuccess(null);
  }, []);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, phone: true, email: true, address: true, city: true });
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setOrderError(null);

    const selectedMethod = paymentMethods.find((m) => m.id === selectedPayment);
    const orderData = {
      orderId: `TV-${Array.from({ length: 6 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]).join("")}`,
      items: [...checkoutItems],
      subtotal,
      shipping,
      couponCode: appliedCoupon,
      couponDiscount,
      total,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      paymentMethod: selectedPayment,
      paymentLabel: selectedMethod?.label || "Cash on Delivery",
      paymentIcon: selectedMethod?.icon || "💵",
      status: "pending" as const,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to save order");
      }

      sessionStorage.setItem("toyverse-last-order", JSON.stringify(orderData));
      localStorage.setItem("toyverse_active_order", JSON.stringify({
        orderId: orderData.orderId,
        phone: orderData.phone,
      }));
      clearCart();
      router.push(`/order-tracking?id=${orderData.orderId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      console.error("Order save failed:", err);
      setOrderError(message);
      setIsSubmitting(false);
    }
  };

  if (!loaded) {
    return (
      <div className="min-h-dvh flex flex-col bg-navy">

        <main className="flex-1 flex items-center justify-center px-5 py-16">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2 className="h-5 w-5 animate-spin text-purple" />
            <span className="text-sm">Loading your cart…</span>
          </div>
        </main>
      </div>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-dvh flex flex-col bg-navy">

        <main className="flex-1 flex items-center justify-center px-5 py-16">
          <div className="text-center max-w-md">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-light">
                <ShoppingBag className="h-10 w-10 text-purple" strokeWidth={1.5} />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-2">
              Your cart is empty
            </h1>
            <p className="text-sm text-text-secondary mb-8">
              Add some toys to your cart before checking out.
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

      <main className="flex-1">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-10 py-8 sm:py-12">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-brand transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Shop
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Checkout
            </h1>
          </div>

          <form onSubmit={handlePlaceOrder} noValidate>
            <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
              {/* Left — Form */}
              <div className="space-y-6">
                {/* Customer Information */}
                <div className="rounded-2xl bg-surface border border-border shadow-premium-sm p-5 sm:p-6">
                  <h2 className="text-base font-extrabold text-text-primary mb-5 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg rainbow-gradient text-[12px] font-bold text-white">1</span>
                    Customer Information
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="name" className="block text-[12px] font-bold text-text-primary mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={() => handleBlur("name")}
                        placeholder="Enter your full name"
                        className={`w-full rounded-xl border bg-surface-light px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:bg-surface focus:outline-none focus:ring-2 transition-all duration-300 ${
                          errors.name
                            ? "border-red-400 focus:border-red-400 focus:ring-red-500/10"
                            : "border-border focus:border-brand/40 focus:ring-brand/10"
                        }`}
                      />
                      {errors.name && (
                        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-400">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-[12px] font-bold text-text-primary mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onBlur={() => handleBlur("phone")}
                        placeholder="03XX XXXXXXX"
                        className={`w-full rounded-xl border bg-surface-light px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:bg-surface focus:outline-none focus:ring-2 transition-all duration-300 ${
                          errors.phone
                            ? "border-red-400 focus:border-red-400 focus:ring-red-500/10"
                            : "border-border focus:border-brand/40 focus:ring-brand/10"
                        }`}
                      />
                      {errors.phone && (
                        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-400">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {errors.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-[12px] font-bold text-text-primary mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => handleBlur("email")}
                        placeholder="you@example.com"
                        className={`w-full rounded-xl border bg-surface-light px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:bg-surface focus:outline-none focus:ring-2 transition-all duration-300 ${
                          errors.email
                            ? "border-red-400 focus:border-red-400 focus:ring-red-500/10"
                            : "border-border focus:border-brand/40 focus:ring-brand/10"
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-400">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="rounded-2xl bg-surface border border-border shadow-premium-sm p-5 sm:p-6">
                  <h2 className="text-base font-extrabold text-text-primary mb-5 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg rainbow-gradient text-[12px] font-bold text-white">2</span>
                    Delivery Address
                  </h2>
                  <div className="grid gap-4">
                    <div>
                      <label htmlFor="address" className="block text-[12px] font-bold text-text-primary mb-1.5">
                        Complete Address *
                      </label>
                      <textarea
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        onBlur={() => handleBlur("address")}
                        rows={3}
                        placeholder="House/Flat number, street, area, landmark"
                        className={`w-full rounded-xl border bg-surface-light px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:bg-surface focus:outline-none focus:ring-2 transition-all duration-300 resize-none ${
                          errors.address
                            ? "border-red-400 focus:border-red-400 focus:ring-red-500/10"
                            : "border-border focus:border-brand/40 focus:ring-brand/10"
                        }`}
                      />
                      {errors.address && (
                        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-400">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {errors.address}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-[12px] font-bold text-text-primary mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        onBlur={() => handleBlur("city")}
                        placeholder="e.g. Karachi, Lahore, Islamabad"
                        className={`w-full rounded-xl border bg-surface-light px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:bg-surface focus:outline-none focus:ring-2 transition-all duration-300 ${
                          errors.city
                            ? "border-red-400 focus:border-red-400 focus:ring-red-500/10"
                            : "border-border focus:border-brand/40 focus:ring-brand/10"
                        }`}
                      />
                      {errors.city && (
                        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-red-400">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {errors.city}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="rounded-2xl bg-surface border border-border shadow-premium-sm p-5 sm:p-6">
                  <h2 className="text-base font-extrabold text-text-primary mb-5 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg rainbow-gradient text-[12px] font-bold text-white">3</span>
                    Payment Method
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                          selectedPayment === method.id
                            ? "border-brand bg-brand-light shadow-premium-sm"
                            : "border-border bg-surface-light hover:border-border"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={selectedPayment === method.id}
                          onChange={() => setSelectedPayment(method.id)}
                          className="sr-only"
                        />
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <span className="block text-[13px] font-bold text-text-primary">
                            {method.label}
                          </span>
                          <span className="block text-[11px] text-text-muted">
                            {method.description}
                          </span>
                        </div>
                        {selectedPayment === method.id && (
                          <CheckCircle2 className="ml-auto h-5 w-5 text-brand shrink-0" strokeWidth={2} />
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right — Order Summary */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                <div className="rounded-2xl bg-surface border border-border shadow-premium-sm overflow-hidden">
                  <div className="border-b border-border px-5 py-4">
                    <h2 className="text-base font-extrabold text-text-primary flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-purple" strokeWidth={2} />
                      Order Summary
                    </h2>
                  </div>

                  {/* Items */}
                  <div className="max-h-[320px] overflow-y-auto px-5 py-4">
                    <div className="flex flex-col gap-4">
                      {checkoutItems.map((item) => (
                        <div key={item.name} className="flex gap-3">
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-light border border-border">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                              unoptimized={item.image.startsWith("data:")}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[12px] font-bold text-text-primary leading-snug line-clamp-2">
                              {item.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
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

                  {/* Summary */}
                  <div className="border-t border-border px-5 py-4 space-y-2.5">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-text-secondary">Subtotal</span>
                      <span className="font-semibold text-text-primary">Rs. {subtotal.toLocaleString()}</span>
                    </div>

                    {/* Coupon Section */}
                    <div className="pt-1">
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between rounded-xl bg-green/10 border border-green/20 px-3 py-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green/20">
                              <Check className="h-3.5 w-3.5 text-green" strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[12px] font-bold text-green truncate">{appliedCoupon}</p>
                              <p className="text-[10px] text-green/70 truncate">{couponSuccess}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full hover:bg-green/20 transition-colors"
                            aria-label="Remove coupon"
                          >
                            <X className="h-3.5 w-3.5 text-green" strokeWidth={2} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" strokeWidth={2} />
                            <input
                              type="text"
                              value={couponInput}
                              onChange={(e) => { setCouponInput(e.target.value); setCouponError(null); }}
                              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleApplyCoupon(); } }}
                              placeholder="Coupon code"
                              className="w-full rounded-xl border border-border bg-surface-light pl-9 pr-3 py-2.5 text-[12px] font-semibold text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={!couponInput.trim() || couponLoading}
                            className="shrink-0 rounded-xl border-2 border-brand px-4 py-2.5 text-[12px] font-bold text-brand hover:bg-brand-light disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                          >
                            {couponLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              "Apply"
                            )}
                          </button>
                        </div>
                      )}
                      {couponError && (
                        <p className="mt-1.5 text-[11px] font-medium text-red-400 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {couponError}
                        </p>
                      )}
                    </div>

                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-[13px]">
                        <span className="text-green font-medium">Discount</span>
                        <span className="font-semibold text-green">- Rs. {couponDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[13px]">
                      <span className="text-text-secondary flex items-center gap-1.5">
                        Shipping
                        {hasFreeDeliveryItem && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-green/10 px-1.5 py-0.5 text-[9px] font-bold text-green border border-green/20">
                            <Truck className="h-2.5 w-2.5" strokeWidth={2.5} />
                            Free Delivery
                          </span>
                        )}
                        {!hasFreeDeliveryItem && meetsThreshold && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-green/10 px-1.5 py-0.5 text-[9px] font-bold text-green border border-green/20">
                            <Truck className="h-2.5 w-2.5" strokeWidth={2.5} />
                            Free Delivery
                          </span>
                        )}
                      </span>
                      <span className={`font-semibold ${shipping === 0 ? "text-green" : "text-text-primary"}`}>
                        {shipping === 0 ? "FREE" : `Rs. ${shipping.toLocaleString()}`}
                      </span>
                    </div>
                    {shipping === 0 && !hasFreeDeliveryItem && meetsThreshold && (
                      <p className="text-[10px] text-green font-medium -mt-0.5">
                        Free delivery unlocked for orders above Rs. {freeDeliveryThreshold.toLocaleString()}!
                      </p>
                    )}
                    <div className="h-px bg-border my-1" />
                    <div className="flex justify-between">
                      <span className="text-sm font-bold text-text-primary">Total</span>
                      <span className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink to-purple">
                        Rs. {total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Place Order */}
                  <div className="px-5 pb-5">
                    <button
                      type="submit"
                      disabled={!isValid || isSubmitting}
                      className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white shadow-premium-brand transition-all duration-300 ${
                        isValid && !isSubmitting
                          ? "rainbow-gradient hover:shadow-lg hover:shadow-purple/20 hover:scale-[1.01] active:scale-[0.99]"
                          : "bg-gray-600 cursor-not-allowed shadow-none"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Place Order — Rs. {total.toLocaleString()}
                        </>
                      )}
                    </button>
                    {orderError && (
                      <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-[12px] text-red-400 leading-snug">{orderError}</p>
                      </div>
                    )}
                    <p className="mt-3 text-center text-[10px] text-text-muted">
                      By placing this order you agree to our terms & conditions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
