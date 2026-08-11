"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/products";

export function FeaturedToys() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/products?format=frontend", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setProducts(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  return (
    <section className="featured-section relative pt-6 pb-8 overflow-hidden" aria-labelledby="featured-toys-heading">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-brand/[0.04] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <h2 id="featured-toys-heading" className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Best Sellers
            </h2>
            <p className="text-sm text-text-secondary">
              Explore our most loved toys
            </p>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Sort by:</span>
            <select className="rounded-lg border border-border/60 bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary focus:outline-none focus:border-brand/50 transition-colors">
              <option>Popular</option>
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
