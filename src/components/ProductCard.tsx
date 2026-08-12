"use client";

import { useState, memo, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { getCartIconPosition } from "@/components/Navbar";
import type { Product } from "@/lib/products";

const PLACEHOLDER = "/images/placeholder.svg";

function isBase64(src: string): boolean {
  return src.startsWith("data:");
}

function safeSrc(src: string | undefined | null): string {
  if (!src || typeof src !== "string" || src.trim() === "") return PLACEHOLDER;
  return src;
}

interface ProductCardProps {
  product: Product;
}

const BADGE_COLORS: Record<string, string> = {
  "New": "bg-emerald-500 text-white",
  "Popular": "bg-amber-400 text-amber-950",
  "Best Seller": "bg-violet-500 text-white",
  "Premium": "bg-rose-500 text-white",
  "Trending": "bg-cyan-500 text-white",
  "Sale": "bg-red-500 text-white",
};

export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [addedItem, setAddedItem] = useState<string | null>(null);
  const [flyParticle, setFlyParticle] = useState<{ id: number; startX: number; startY: number; endX: number; endY: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const particleIdRef = useRef(0);

  const handleAddToCart = useCallback(() => {
    addToCart({ name: product.name, price: product.price, image: product.image, isFreeDelivery: product.isFreeDelivery });
    setAddedItem(product.name);
    setTimeout(() => setAddedItem(null), 1500);

    if (buttonRef.current) {
      const btnRect = buttonRef.current.getBoundingClientRect();
      const cartPos = getCartIconPosition();
      if (cartPos) {
        const id = ++particleIdRef.current;
        setFlyParticle({
          id,
          startX: btnRect.left + btnRect.width / 2,
          startY: btnRect.top,
          endX: cartPos.x,
          endY: cartPos.y,
        });
        setTimeout(() => setFlyParticle(null), 900);
      }
    }
  }, [addToCart, product]);

  const fullStars = Math.floor(product.rating);
  const hasHalf = product.rating % 1 >= 0.5;

  const imgSrc = safeSrc(product.image);
  const imgIsBase64 = isBase64(imgSrc);

  const badgeClass = product.badge ? (BADGE_COLORS[product.badge] || "bg-surface-light text-text-secondary") : "";

  return (
    <div className="group relative flex flex-col rounded-2xl bg-surface border border-border/50 overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/15 transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-navy/40">
        <Link
          href={`/products/${product.slug}`}
          className="block h-full overflow-hidden focus:outline-none"
        >
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
            quality={imgIsBase64 ? undefined : 75}
            className="object-contain p-4 sm:p-5 transition-transform duration-500 ease-out group-hover:scale-110"
            unoptimized={imgIsBase64}
          />
        </Link>

        {/* Badge — top-left */}
        {product.badge && (
          <span className={`absolute top-2.5 left-2.5 z-10 text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-lg uppercase ${badgeClass}`}>
            {product.badge}
          </span>
        )}

        {/* Wishlist — top-right */}
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          aria-label={isInWishlist(product.slug) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm border border-black/5 transition-all duration-200 hover:scale-110 hover:bg-white active:scale-90"
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-4 w-4 transition-all duration-200 ${
              isInWishlist(product.slug)
                ? "fill-red-500 text-red-500"
                : "fill-none text-gray-400 hover:text-red-400"
            }`}
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 sm:p-4">
        {/* Title */}
        <h3 className="text-[13px] sm:text-sm font-bold text-text-primary line-clamp-2 leading-snug min-h-[2.5rem] sm:min-h-[2.75rem]">
          {product.name}
        </h3>

        {/* Star Rating */}
        <div className="flex items-center gap-1.5 mt-2" role="img" aria-label={`${product.rating} out of 5 stars, ${product.reviews} reviews`}>
          <div className="flex items-center gap-px" aria-hidden="true">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                  i < fullStars
                    ? "text-amber-400 fill-amber-400"
                    : i === fullStars && hasHalf
                    ? "text-amber-400 fill-amber-400/50"
                    : "text-gray-200 fill-gray-200"
                }`}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <span className="text-[10px] sm:text-[11px] text-text-muted font-medium">
            {product.rating}
          </span>
          <span className="text-[10px] sm:text-[11px] text-text-muted">
            ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2.5">
          <span className="text-base sm:text-lg font-extrabold text-text-primary">
            {product.price}
          </span>
          {product.originalPrice && (
            <span className="text-[11px] sm:text-xs text-text-muted line-through font-medium">
              {product.originalPrice}
            </span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Add to Cart — pill button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={handleAddToCart}
          aria-label={addedItem === product.name ? `${product.name} added to cart` : `Add ${product.name} to cart`}
          className={`w-full mt-3 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-2 transition-[transform,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            addedItem === product.name
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
              : "bg-brand text-white hover:bg-brand-dark hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md hover:shadow-brand/20"
          }`}
        >
          {addedItem === product.name ? (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Added!
            </>
          ) : (
            <>
              <ShoppingCart className="h-3.5 w-3.5" strokeWidth={2.5} />
              Add to Cart
            </>
          )}
        </button>
      </div>

      {/* Fly-to-cart particle */}
      {flyParticle && (
        <div
          key={flyParticle.id}
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: flyParticle.startX,
            top: flyParticle.startY,
            animation: "flyToCart 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
            "--fly-end-x": `${flyParticle.endX - flyParticle.startX}px`,
            "--fly-end-y": `${flyParticle.endY - flyParticle.startY}px`,
          } as React.CSSProperties}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand shadow-lg shadow-brand/40 ring-2 ring-white/30">
            <ShoppingCart className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </div>
        </div>
      )}
    </div>
  );
});
