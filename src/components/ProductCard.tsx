"use client";

import { useState, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import type { Product } from "@/lib/products";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [addedItem, setAddedItem] = useState<string | null>(null);

  const handleAddToCart = () => {
    addToCart({ name: product.name, price: product.price, image: product.image, isFreeDelivery: product.isFreeDelivery });
    setAddedItem(product.name);
    setTimeout(() => setAddedItem(null), 1200);
  };

  const fullStars = Math.floor(product.rating);
  const hasHalf = product.rating % 1 >= 0.5;

  return (
    <div className="group relative flex flex-col rounded-2xl bg-[#0e2f2b] border border-[#184841] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/10">
      {/* Image Container */}
      <div className="relative aspect-[4/3]">
        <Link
          href={`/products/${product.slug}`}
          className="block h-full overflow-hidden bg-[#0e2f2b] focus:outline-none"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
            quality={75}
            className="object-contain p-4 transition-transform duration-300 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Top-Left Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10 bg-[#ecc94b] text-black font-bold text-[10px] tracking-wider px-2.5 py-1 rounded-full uppercase">
            {product.badge}
          </div>
        )}

        {/* Top-Right Wishlist Heart */}
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          aria-label={isInWishlist(product.slug) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#0e2f2b]/80 backdrop-blur-sm border border-[#184841]/60 transition-all duration-200 hover:scale-110 active:scale-90"
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-4 w-4 transition-all duration-200 ${
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
      <div className="flex flex-col p-4 pt-3 flex-1">
        {/* Title */}
        <h3 className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Star Rating */}
        <div className="flex items-center gap-1.5 mt-2" role="img" aria-label={`${product.rating} out of 5 stars, ${product.reviews} reviews`}>
          <div className="flex items-center gap-px" aria-hidden="true">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-3.5 w-3.5 ${
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
          <span className="text-[11px] text-text-muted">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-lg font-bold text-text-primary">
            {product.price}
          </span>
          {product.originalPrice && (
            <span className="text-[11px] text-text-muted line-through">
              {product.originalPrice}
            </span>
          )}
        </div>

        {/* Add to Cart Button — full width */}
        <button
          type="button"
          onClick={handleAddToCart}
          aria-label={addedItem === product.name ? `${product.name} added to cart` : `Add ${product.name} to cart`}
          className={`w-full mt-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
            addedItem === product.name
              ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
              : "bg-brand hover:bg-brand-dark text-white"
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
    </div>
  );
});
