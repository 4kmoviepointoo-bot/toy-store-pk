"use client";

import { useState, memo, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
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

    // Fly-to-cart animation
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
        setTimeout(() => setFlyParticle(null), 700);
      }
    }
  }, [addToCart, product]);

  const fullStars = Math.floor(product.rating);
  const hasHalf = product.rating % 1 >= 0.5;

  const imgSrc = safeSrc(product.image);
  const imgIsBase64 = isBase64(imgSrc);

  return (
    <div className="group relative flex flex-col rounded-2xl bg-[#0e2f2b] border border-[#184841] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/10">
      {/* Image Container */}
      <div className="relative aspect-[4/3]">
        <Link
          href={`/products/${product.slug}`}
          className="block h-full overflow-hidden bg-[#0e2f2b] focus:outline-none"
        >
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
            quality={imgIsBase64 ? undefined : 75}
            className="object-contain p-3 sm:p-4 transition-transform duration-300 ease-out group-hover:scale-105"
            unoptimized={imgIsBase64}
          />
        </Link>

        {/* Top-Left Badge */}
        {product.badge && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 bg-[#ecc94b] text-black font-bold text-[9px] sm:text-[10px] tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase">
            {product.badge}
          </div>
        )}

        {/* Top-Right Wishlist Heart */}
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          aria-label={isInWishlist(product.slug) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#0e2f2b]/80 backdrop-blur-sm border border-[#184841]/60 transition-all duration-200 hover:scale-110 active:scale-90"
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-200 ${
              isInWishlist(product.slug)
                ? "fill-red-500 text-red-500 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]"
                : "fill-none text-text-muted hover:text-white"
            }`}
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col p-3 sm:p-4 pt-2 sm:pt-3 flex-1">
        {/* Title */}
        <h3 className="text-xs sm:text-sm font-semibold text-text-primary line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Star Rating */}
        <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2" role="img" aria-label={`${product.rating} out of 5 stars, ${product.reviews} reviews`}>
          <div className="flex items-center gap-px" aria-hidden="true">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                  i < fullStars
                    ? "text-amber-400 fill-amber-400"
                    : i === fullStars && hasHalf
                    ? "text-amber-400 fill-amber-400/50"
                    : "text-zinc-600 fill-zinc-600"
                }`}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <span className="text-[10px] sm:text-[11px] text-text-muted">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
          <span className="text-base sm:text-lg font-bold text-text-primary">
            {product.price}
          </span>
          {product.originalPrice && (
            <span className="text-[10px] sm:text-[11px] text-text-muted line-through">
              {product.originalPrice}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={handleAddToCart}
          aria-label={addedItem === product.name ? `${product.name} added to cart` : `Add ${product.name} to cart`}
          className={`w-full mt-2 sm:mt-3 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 ${
            addedItem === product.name
              ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 scale-[1.02]"
              : "bg-brand hover:bg-brand-dark text-white active:scale-95"
          }`}
        >
          {addedItem === product.name ? (
            <>
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Added!
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
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
            animation: "flyToCart 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
            "--fly-end-x": `${flyParticle.endX - flyParticle.startX}px`,
            "--fly-end-y": `${flyParticle.endY - flyParticle.startY}px`,
          } as React.CSSProperties}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand shadow-lg shadow-brand/40">
            <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
});
