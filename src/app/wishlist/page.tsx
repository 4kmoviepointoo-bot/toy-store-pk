"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2, ArrowLeft, Star, Check } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";

export default function WishlistPage() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [addedItem, setAddedItem] = useState<string | null>(null);

  const handleAddToCart = (item: typeof items[number]) => {
    addToCart({ name: item.name, price: item.price, image: item.image });
    removeFromWishlist(item.slug);
    setAddedItem(item.name);
    setTimeout(() => setAddedItem(null), 1200);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-navy">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-10 py-8 sm:py-12">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-brand transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Store
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-light">
                <Heart className="h-5 w-5 text-pink" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                  My Wishlist
                </h1>
                <p className="text-sm text-text-secondary mt-0.5">
                  {items.length > 0
                    ? `${items.length} ${items.length === 1 ? "item" : "items"} saved`
                    : "Your favorite toys, all in one place"}
                </p>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {items.length === 0 && (
            <div className="rounded-2xl rainbow-gradient p-[1px]">
              <div className="rounded-2xl bg-surface p-8 sm:p-12 text-center">
                <div className="mb-5 flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-pink/10">
                    <Heart className="h-10 w-10 text-pink" strokeWidth={1.5} />
                  </div>
                </div>
                <h2 className="text-xl font-extrabold text-text-primary mb-2">
                  Your Wishlist is Empty
                </h2>
                <p className="text-sm text-text-secondary mb-8 max-w-sm mx-auto">
                  Browse our collection and tap the heart icon to save your favorite toys here.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-2xl rainbow-gradient px-8 py-3.5 text-sm font-bold text-white shadow-premium-brand hover:shadow-lg hover:shadow-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  Explore Toys
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Wishlist Grid */}
          {items.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {items.map((item) => {
                const fullStars = Math.floor(item.rating);
                const hasHalf = item.rating % 1 >= 0.5;

                return (
                  <div
                    key={item.slug}
                    className="group relative flex flex-col rounded-[1.25rem] sm:rounded-[1.5rem] bg-surface border border-border/60 shadow-premium-sm overflow-hidden"
                  >
                    {/* Image */}
                    <Link
                      href={`/products/${item.slug}`}
                      className="relative block aspect-square overflow-hidden bg-gradient-to-br from-navy-light to-surface"
                    >
                      <Image
                        src={item.image}
                        alt={`${item.name} — ToyVerse Pakistan`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        quality={item.image.startsWith("data:") ? undefined : 75}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized={item.image.startsWith("data:")}
                      />
                      {/* Badge */}
                      <div className={`absolute top-2 left-2 sm:top-3 sm:left-3 z-10 rounded-md sm:rounded-lg ${item.badgeColor} px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-sm`}>
                        {item.badge}
                      </div>
                    </Link>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(item.slug)}
                      aria-label={`Remove ${item.name} from wishlist`}
                      className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-red-500/90 text-white shadow-sm transition-all duration-200 hover:scale-110 hover:bg-red-500 active:scale-90"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    {/* Content */}
                    <div className="flex flex-1 flex-col gap-1.5 sm:gap-2 p-3 sm:p-4">
                      <Link href={`/products/${item.slug}`}>
                        <h3 className="text-[12px] sm:text-[13px] lg:text-sm font-bold text-text-primary leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] hover:text-brand transition-colors">
                          {item.name}
                        </h3>
                      </Link>

                      {/* Rating */}
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <div className="flex items-center gap-px">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                                i < fullStars
                                  ? "text-yellow fill-yellow"
                                  : i === fullStars && hasHalf
                                  ? "text-yellow fill-yellow/50"
                                  : "text-surface-light fill-surface-light"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-semibold text-text-secondary">
                          {item.rating}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-1.5 sm:gap-2 mt-auto pt-0.5">
                        <span className="text-sm sm:text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink to-purple">
                          {item.price}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-medium text-text-muted line-through">
                          {item.originalPrice}
                        </span>
                      </div>

                      {/* Add to Cart */}
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className={`mt-2 flex w-full items-center justify-center gap-1.5 sm:gap-2 rounded-xl py-2.5 sm:py-3 text-[11px] sm:text-xs font-bold text-white shadow-premium-brand transition-all duration-250 active:scale-[0.97] ${
                          addedItem === item.name
                            ? "bg-green scale-[1.02]"
                            : "bg-gradient-to-r from-pink via-purple to-blue hover:shadow-lg hover:shadow-purple/20"
                        }`}
                      >
                        {addedItem === item.name ? (
                          <>
                            <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            Added!
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
