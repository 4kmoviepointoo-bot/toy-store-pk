"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Check, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    cartCount,
    selectedItems,
    toggleItemSelect,
    selectedSubtotal,
    selectedCount,
    allSelected,
    toggleSelectAll,
  } = useCart();

  const selectedSet = new Set(selectedItems);

  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(3000);
  const [isThresholdEnabled, setIsThresholdEnabled] = useState(true);

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

  const hasFreeDeliveryItem = items.some((i) => i.isFreeDelivery);
  const meetsThreshold = isThresholdEnabled && selectedSubtotal >= freeDeliveryThreshold;
  const qualifiesForFree = hasFreeDeliveryItem || meetsThreshold;
  const remaining = isThresholdEnabled ? Math.max(0, freeDeliveryThreshold - selectedSubtotal) : 0;

  useEffect(() => {
    let raf: number;
    if (open) {
      raf = requestAnimationFrame(() => {
        document.body.style.overflow = "hidden";
      });
    } else {
      raf = requestAnimationFrame(() => {
        document.body.style.overflow = "";
      });
    }
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] bg-black/60 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`cart-drawer fixed inset-y-0 right-0 z-[101] h-dvh w-full sm:w-[480px] bg-navy shadow-[--4px_0_24px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-dvh flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl rainbow-gradient">
                <ShoppingBag className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-text-primary">Your Cart</h2>
                <p className="text-[12px] text-text-muted font-medium">
                  {cartCount} {cartCount === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-text-muted hover:bg-surface hover:text-text-primary transition-all duration-200"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          {/* Content */}
          {items.length === 0 ? (
            /* Empty State */
            <div className="flex flex-1 min-h-0 flex-col items-center justify-center bg-navy px-8 py-10 text-center">
              {/* Icon with glow */}
              <div className="relative mb-6">
                {/* Colorful glow rings */}
                <div className="absolute inset-0 -m-3 rounded-full bg-gradient-to-br from-purple/20 via-pink/10 to-cyan/15 blur-xl animate-glow-pulse" />
                <div className="absolute inset-0 -m-1.5 rounded-full bg-gradient-to-tr from-purple/10 to-pink/10 blur-md" />
                {/* Icon container */}
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-light to-surface border border-purple/15">
                  <ShoppingBag className="h-10 w-10 text-purple" strokeWidth={1.5} />
                </div>
                {/* Decorative sparkles */}
                <span className="absolute -top-1 -right-1 text-lg animate-sparkle" aria-hidden="true">✨</span>
                <span className="absolute top-0 -left-2 text-sm animate-sparkle [animation-delay:0.4s]" aria-hidden="true">⭐</span>
                <span className="absolute -bottom-0.5 right-1 text-xs animate-sparkle [animation-delay:0.8s]" aria-hidden="true">✨</span>
              </div>

              {/* Text content */}
              <h3 className="text-xl font-extrabold text-text-primary mb-2 tracking-tight">
                Your cart is empty
              </h3>
              <p className="text-sm text-text-secondary mb-8 max-w-[260px] leading-relaxed">
                Looks like you haven&apos;t added any toys yet. Let&apos;s find something fun!
              </p>

              {/* CTA */}
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2.5 rounded-2xl rainbow-gradient px-7 py-3.5 text-sm font-bold text-white shadow-premium-brand hover:shadow-lg hover:shadow-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-250"
              >
                Start Shopping
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              {/* Select All Bar */}
              <div className="cart-select-all flex items-center justify-between border-b border-border bg-surface/50 px-6 py-3">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2.5 text-[12px] font-semibold text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  <span
                    className={`cart-checkbox ${allSelected ? "cart-checkbox-checked" : ""}`}
                  >
                    {allSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  {allSelected ? "Deselect all" : "Select all"}
                </button>
                {selectedCount > 0 && (
                  <span className="text-[11px] font-bold text-purple">
                    {selectedCount} selected
                  </span>
                )}
              </div>

              {/* Items List */}
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
                <div className="flex flex-col gap-4">
                  {items.map((item) => {
                    const isSelected = selectedSet.has(item.name);
                    return (
                      <div
                        key={item.name}
                        className={`flex gap-4 rounded-2xl border p-4 transition-all duration-250 ${
                          isSelected
                            ? "cart-item-selected"
                            : "cart-item-deselected"
                        }`}
                      >
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={() => toggleItemSelect(item.name)}
                          className={`cart-checkbox mt-0.5 self-start ${isSelected ? "cart-checkbox-checked" : ""}`}
                          aria-label={isSelected ? `Deselect ${item.name}` : `Select ${item.name}`}
                        >
                          {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                        </button>

                        {/* Image */}
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface border border-border">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex flex-1 flex-col justify-between min-w-0">
                          <div>
                            <h4 className="text-[14px] font-bold text-text-primary leading-snug line-clamp-2">
                              {item.name}
                            </h4>
                            <p className="mt-1 text-[15px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink to-purple">
                              {item.price}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1 rounded-xl bg-surface border border-border shadow-sm">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.name, item.quantity - 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-l-xl text-text-muted hover:text-text-primary hover:bg-surface-light transition-all duration-200"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                              </button>
                              <span className="flex h-8 w-8 items-center justify-center text-[13px] font-bold text-text-primary border-x border-border">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.name, item.quantity + 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-r-xl text-text-muted hover:text-text-primary hover:bg-surface-light transition-all duration-200"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={() => removeItem(item.name)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-border bg-navy px-6 py-5 space-y-3">
                {/* Free Delivery Progress */}
                {selectedCount > 0 && isThresholdEnabled && !hasFreeDeliveryItem && (
                  <div className="rounded-xl bg-surface border border-border px-4 py-3">
                    {qualifiesForFree ? (
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green/20">
                          <Truck className="h-3.5 w-3.5 text-green" strokeWidth={2.5} />
                        </div>
                        <p className="text-[12px] font-bold text-green">
                          You&apos;ve unlocked FREE delivery!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-semibold text-text-secondary">
                            Add Rs. {remaining.toLocaleString()} more for FREE delivery!
                          </p>
                          <Truck className="h-3.5 w-3.5 text-text-muted" strokeWidth={2} />
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-surface-light overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-pink via-purple to-blue transition-all duration-500"
                            style={{ width: `${Math.min(100, (selectedSubtotal / freeDeliveryThreshold) * 100)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-text-muted">
                          Rs. {selectedSubtotal.toLocaleString()} / Rs. {freeDeliveryThreshold.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-secondary">
                    Subtotal ({selectedCount} {selectedCount === 1 ? "item" : "items"})
                  </span>
                  <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink to-purple">
                    Rs. {selectedSubtotal.toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted">
                  Shipping & taxes calculated at checkout
                </p>

                {/* Checkout Button */}
                <button
                  type="button"
                  onClick={() => { window.location.href = "/checkout"; }}
                  disabled={selectedCount === 0}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white shadow-premium-brand transition-all duration-300 ${
                    selectedCount > 0
                      ? "rainbow-gradient hover:shadow-lg hover:shadow-purple/20 hover:scale-[1.01] active:scale-[0.99]"
                      : "bg-gray-600 cursor-not-allowed shadow-none"
                  }`}
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </button>

                {/* Clear Cart */}
                <button
                  type="button"
                  onClick={clearCart}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-semibold text-text-muted hover:text-red-400 transition-all duration-200"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear Cart
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
