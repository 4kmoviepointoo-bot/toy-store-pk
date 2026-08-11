"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Star,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  Package,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Navbar } from "@/components/Navbar";
import { ProductReviews } from "@/components/ProductReviews";

const TABS = ["Description", "Product Details", "Reviews", "Shipping & Returns"];

interface DbProduct {
  slug: string;
  name: string;
  price: string;
  originalPrice: string;
  rating: number;
  reviews: number;
  badge: string;
  badgeColor: string;
  image: string;
  images: string[];
  description: string;
  highlights: string[];
  brand: string;
  material: string;
  pieces: string;
  ageRange: string;
  isFreeDelivery: boolean;
  ageGroup: string;
  category: string;
  tags: string[];
}

export function ProductDetail({ slug }: { slug: string }) {
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/products?format=frontend`, { signal: controller.signal, cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const products = data.data || [];
        const found = products.find((p: DbProduct) => p.slug === slug);
        setProduct(found || null);
        setRelatedProducts(products.filter((p: DbProduct) => p.slug !== slug).slice(0, 3));
      })
      .catch(() => {
        setProduct(null);
        setRelatedProducts([]);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [slug]);

  const handleAddToCart = useCallback(() => {
    if (added || !product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart({
        name: product.name,
        price: product.price,
        image: product.image,
        isFreeDelivery: product.isFreeDelivery,
      });
    }
    setAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setAdded(false);
      timerRef.current = null;
    }, 2000);
  }, [added, quantity, addToCart, product]);

  if (loading) {
    return (
      <div className="min-h-dvh flex flex-col bg-[#0b2420]">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 sm:py-6">
            <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:gap-8">
              <div className="space-y-3">
                <div className="aspect-square rounded-2xl bg-[#0e2f2b] animate-pulse" />
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square rounded-xl bg-[#0e2f2b] animate-pulse" />
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-6 w-20 rounded bg-[#0e2f2b] animate-pulse" />
                <div className="h-8 w-3/4 rounded bg-[#0e2f2b] animate-pulse" />
                <div className="h-5 w-32 rounded bg-[#0e2f2b] animate-pulse" />
                <div className="h-24 rounded-xl bg-[#0e2f2b] animate-pulse" />
                <div className="h-20 rounded-xl bg-[#0e2f2b] animate-pulse" />
                <div className="h-12 rounded-xl bg-[#0e2f2b] animate-pulse" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-dvh flex flex-col bg-[#0b2420]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-5 py-16">
          <div className="text-center max-w-md">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0e2f2b]">
                <ShoppingCart className="h-10 w-10 text-[#1c7865]" strokeWidth={1.5} />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Product Not Found</h1>
            <p className="text-sm text-[#a0b4b0] mb-8">
              The product you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1c7865] px-8 py-3 text-sm font-bold text-white hover:bg-[#228e78] transition-all"
            >
              Start Shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const fullStars = Math.floor(product.rating);
  const hasHalf = product.rating % 1 >= 0.5;

  const priceNum = parseInt(product.price.replace(/[^0-9]/g, "")) || 0;
  const originalPriceNum = parseInt(product.originalPrice.replace(/[^0-9]/g, "")) || 0;
  const discountPct = originalPriceNum > 0 ? Math.round((1 - priceNum / originalPriceNum) * 100) : 0;
  const savings = originalPriceNum - priceNum;

  const productHighlights =
    product.highlights && product.highlights.length > 0
      ? product.highlights
      : product.description
          .split(/[.!]+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 10)
          .slice(0, 4);

  const productSpecs = [
    { label: "Brand", value: product.brand || "ToyVerse" },
    { label: "Material", value: product.material || "ABS Plastic" },
    { label: "Pieces", value: product.pieces || "N/A" },
    { label: "Age Range", value: product.ageRange || "3+ Years" },
  ];

  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.image, product.image, product.image, product.image];

  return (
    <div className="min-h-dvh flex flex-col bg-[#0b2420]">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 sm:py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#6b8f88] mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="hover:text-white transition-colors cursor-pointer">
              Toys &amp; Games
            </span>
            <ChevronRight className="h-3 w-3" />
            <span className="hover:text-white transition-colors cursor-pointer">
              {product.category}
            </span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#e6fffa] font-medium">{product.name}</span>
          </nav>

          {/* Top Grid */}
          <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:gap-8">
            {/* LEFT — Image & Thumbnails */}
            <div>
              {/* Back Button */}
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#a0b4b0] hover:text-white transition-colors mb-3"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Store
              </Link>

              {/* Main Image Card */}
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#0e2f2b] border border-[#184841] shadow-lg">
                <Image
                  src={productImages[selectedImage] || product.image}
                  alt={`${product.name} — ToyVerse Pakistan`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 380px"
                  quality={85}
                  className="object-cover p-6"
                  priority
                />
                {/* Top-Left Badge */}
                <div
                  className={`absolute top-3 left-3 rounded-lg px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider shadow-lg ${product.badgeColor}`}
                >
                  {product.badge}
                </div>
                {/* Top-Right Discount */}
                <div className="absolute top-3 right-3 rounded-lg bg-red-500 px-2.5 py-1 text-[9px] font-bold text-white shadow-lg">
                  Save {discountPct}%
                </div>
                {/* Bottom-Left Free Delivery */}
                {product.isFreeDelivery && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-lg bg-[#1c7865]/90 backdrop-blur-sm px-2.5 py-1 text-white shadow-lg">
                    <Truck className="h-3 w-3" strokeWidth={2.5} />
                    <span className="text-[9px] font-bold">Free Delivery</span>
                  </div>
                )}
                {/* Bottom-Right Wishlist */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product as unknown as import("@/lib/products").Product)}
                  aria-label={
                    isInWishlist(product.slug)
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                  className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#0b2420]/70 backdrop-blur-sm border border-[#184841] shadow-lg transition-all duration-200 hover:scale-110 active:scale-90"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-4 w-4 transition-all duration-200 ${
                      isInWishlist(product.slug)
                        ? "fill-pink text-pink drop-shadow-[0_0_6px_rgba(236,72,153,0.5)]"
                        : "fill-none text-[#a0b4b0]"
                    }`}
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                    />
                  </svg>
                </button>
              </div>

              {/* Thumbnails Gallery */}
              <div className="grid grid-cols-4 gap-2 mt-3">
                {productImages.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                      selectedImage === i
                        ? "border-[#1c7865] shadow-md"
                        : "border-[#184841] hover:border-[#1c7865]/50"
                    } bg-[#0e2f2b]`}
                  >
                    <Image
                      src={src}
                      alt={`${product.name} thumbnail ${i + 1}`}
                      fill
                      sizes="80px"
                      quality={60}
                      className="object-cover p-1"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT — Product Info */}
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Top Badge */}
              <div>
                <span
                  className={`inline-block rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${product.badgeColor}`}
                >
                  {product.badge}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-white leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div
                className="flex items-center gap-2"
                role="img"
                aria-label={`${product.rating} out of 5 stars, ${product.reviews} reviews`}
              >
                <div className="flex items-center gap-0.5" aria-hidden="true">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < fullStars
                          ? "text-[#ecc94b] fill-[#ecc94b]"
                          : i === fullStars && hasHalf
                          ? "text-[#ecc94b] fill-[#ecc94b]/50"
                          : "text-[#184841] fill-[#184841]"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-white" aria-hidden="true">
                  {product.rating}
                </span>
                <span className="text-xs text-[#a0b4b0]" aria-hidden="true">
                  ({product.reviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="rounded-xl bg-[#0e2f2b] border border-[#184841] p-3 sm:p-4">
                <div className="flex items-baseline gap-3 mb-0.5">
                  <span className="text-xl font-bold text-[#ecc94b]">
                    {product.price}
                  </span>
                  <span className="text-sm font-medium text-[#6b8f88] line-through">
                    {product.originalPrice}
                  </span>
                </div>
                <p className="text-[11px] text-[#1c7865] font-semibold">
                  You save {savings.toLocaleString()} PKR
                </p>
              </div>

              {/* About this toy */}
              <div className="rounded-xl bg-[#0e2f2b] border border-[#184841] p-3 sm:p-4">
                <h2 className="text-sm font-semibold text-white mb-1.5 flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#184841] text-[10px]">
                    🧸
                  </span>
                  About this toy
                </h2>
                <p className="text-xs sm:text-sm text-[#a0b4b0] leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Quantity */}
              <div className="rounded-xl bg-[#0e2f2b] border border-[#184841] p-3 sm:p-4">
                <h2 className="text-sm font-semibold text-white mb-2">
                  Quantity
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[#184841] bg-[#0b2420] text-[#a0b4b0] hover:border-[#1c7865] hover:text-[#1c7865] transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span
                    className="min-w-[2.5rem] text-center text-lg font-bold text-white"
                    aria-live="polite"
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    disabled={quantity >= 10}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[#184841] bg-[#0b2420] text-[#a0b4b0] hover:border-[#1c7865] hover:text-[#1c7865] transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={added}
                aria-live="polite"
                className={`group relative flex w-full items-center justify-center gap-2 rounded-xl py-3 sm:py-3.5 text-sm font-bold text-white transition-all duration-300 overflow-hidden ${
                  added
                    ? "bg-[#1c7865] shadow-lg shadow-[#1c7865]/25"
                    : "bg-[#1c7865] hover:bg-[#228e78] hover:shadow-lg hover:shadow-[#1c7865]/20 active:scale-[0.98]"
                }`}
              >
                {!added && (
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                    aria-hidden="true"
                  />
                )}
                {added ? (
                  <>
                    <Check className="h-4 w-4" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart — {product.price}
                  </>
                )}
              </button>

              {/* Micro Features */}
              <div className="flex items-center justify-center gap-4 pt-1">
                {product.isFreeDelivery ? (
                  <div className="flex items-center gap-1 text-[10px] text-[#1c7865] font-semibold">
                    <Truck className="h-3 w-3" />
                    <span>Free Delivery</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] text-[#6b8f88]">
                    <Truck className="h-3 w-3" />
                    <span>Fast Delivery</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-[10px] text-[#6b8f88]">
                  <Shield className="h-3 w-3 text-[#1c7865]" />
                  <span>Safe &amp; Secure</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#6b8f88]">
                  <RotateCcw className="h-3 w-3 text-[#1c7865]" />
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabbed Specifications Card */}
          <div className="mt-8 rounded-2xl bg-[#0e2f2b] border border-[#184841] overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-[#184841] overflow-x-auto">
              {TABS.map((tab, i) => {
                const label =
                  tab === "Reviews"
                    ? `${tab} (${product.reviews})`
                    : tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(i)}
                    className={`relative whitespace-nowrap px-5 py-3.5 text-xs sm:text-sm font-semibold transition-colors ${
                      activeTab === i
                        ? "text-[#ecc94b]"
                        : "text-[#6b8f88] hover:text-[#a0b4b0]"
                    }`}
                  >
                    {label}
                    {activeTab === i && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ecc94b]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="p-5 sm:p-6">
              {activeTab === 0 && (
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Left: Description */}
                  <div>
                    <p className="text-sm text-[#a0b4b0] leading-relaxed mb-4">
                      {product.description}
                    </p>
                    <ul className="space-y-2.5">
                      {productHighlights.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-2 text-sm text-[#a0b4b0]"
                        >
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1c7865]/20">
                            <Check className="h-2.5 w-2.5 text-[#1c7865]" strokeWidth={3} />
                          </span>
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Right: Specs */}
                  <div className="rounded-xl bg-[#0b2420] border border-[#184841] p-4">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-1.5">
                      <Package className="h-4 w-4 text-[#1c7865]" />
                      Product Specifications
                    </h3>
                    <dl className="space-y-2.5">
                      {productSpecs.map((spec) => (
                        <div
                          key={spec.label}
                          className="flex items-center justify-between"
                        >
                          <dt className="text-xs text-[#6b8f88]">{spec.label}</dt>
                          <dd className="text-xs font-semibold text-white">
                            {spec.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              )}

              {activeTab === 1 && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-[#a0b4b0] leading-relaxed mb-4">
                      This {product.name} is designed for kids who love to explore and create.
                      Made from high-quality, non-toxic materials to ensure safety during play.
                    </p>
                    <ul className="space-y-2.5">
                      {productHighlights.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-2 text-sm text-[#a0b4b0]"
                        >
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1c7865]/20">
                            <Check className="h-2.5 w-2.5 text-[#1c7865]" strokeWidth={3} />
                          </span>
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl bg-[#0b2420] border border-[#184841] p-4">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-1.5">
                      <Package className="h-4 w-4 text-[#1c7865]" />
                      Product Specifications
                    </h3>
                    <dl className="space-y-2.5">
                      {productSpecs.map((spec) => (
                        <div
                          key={spec.label}
                          className="flex items-center justify-between"
                        >
                          <dt className="text-xs text-[#6b8f88]">{spec.label}</dt>
                          <dd className="text-xs font-semibold text-white">
                            {spec.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              )}

              {activeTab === 2 && (
                <div>
                  <ProductReviews slug={slug} />
                </div>
              )}

              {activeTab === 3 && (
                <div className="max-w-2xl space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1.5">
                      Shipping
                    </h3>
                    <p className="text-xs sm:text-sm text-[#a0b4b0] leading-relaxed">
                      We offer fast delivery across Pakistan. Standard delivery takes 3-5 business
                      days. Free shipping on orders above Rs. 2,500.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1.5">
                      Returns
                    </h3>
                    <p className="text-xs sm:text-sm text-[#a0b4b0] leading-relaxed">
                      Not satisfied? Return unused items within 7 days for a full refund.
                      Contact our support team via WhatsApp for hassle-free returns.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* You May Also Like */}
          {relatedProducts.length > 0 && (
            <section className="mt-8 sm:mt-10" aria-labelledby="related-heading">
              <div className="mb-4">
                <h2
                  id="related-heading"
                  className="text-base sm:text-lg font-bold text-white tracking-tight"
                >
                  More Toys to{" "}
                  <span className="text-[#ecc94b]">Explore</span>
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {relatedProducts.map((related) => (
                    <Link
                      key={related.slug}
                      href={`/products/${related.slug}`}
                      className="group flex flex-col rounded-xl bg-[#0e2f2b] border border-[#184841] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#1c7865]/10"
                    >
                      <div className="relative aspect-square overflow-hidden bg-[#0b2420]">
                        <Image
                          src={related.image}
                          alt={`${related.name} — ToyVerse Pakistan`}
                          fill
                          sizes="(max-width: 640px) 50vw, 33vw"
                          quality={75}
                          className="object-cover p-3 transition-transform duration-300 group-hover:scale-105"
                        />
                        <div
                          className={`absolute top-1.5 left-1.5 rounded-md px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider shadow-sm ${related.badgeColor}`}
                        >
                          {related.badge}
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col gap-1 p-2.5">
                        <h3 className="text-[11px] sm:text-xs font-bold text-white leading-snug line-clamp-2 min-h-[2rem]">
                          {related.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          <div className="flex items-center gap-px">
                            {[...Array(5)].map((_, i) => {
                              const relFull = Math.floor(related.rating);
                              const relHalf = related.rating % 1 >= 0.5;
                              return (
                                <Star
                                  key={i}
                                  className={`h-2.5 w-2.5 ${
                                    i < relFull
                                      ? "text-[#ecc94b] fill-[#ecc94b]"
                                      : i === relFull && relHalf
                                      ? "text-[#ecc94b] fill-[#ecc94b]/50"
                                      : "text-[#184841] fill-[#184841]"
                                  }`}
                                />
                              );
                            })}
                          </div>
                          <span className="text-[9px] font-semibold text-[#a0b4b0]">
                            {related.rating}
                          </span>
                        </div>
                        <div className="mt-auto pt-0.5">
                          <span className="text-xs sm:text-sm font-bold text-[#ecc94b]">
                            {related.price}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
