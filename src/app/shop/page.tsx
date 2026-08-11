"use client";

import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal, ChevronDown, PackageSearch, Loader2 } from "lucide-react";
import { AGE_GROUPS, CATEGORIES, type AgeGroup, type Category } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/products";

type SortKey = "default" | "price-asc" | "price-desc" | "newest";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "default", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest Arrivals" },
];

function parsePrice(price: string): number {
  return Number(price.replace(/[^\d]/g, ""));
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function ShopContent() {
  const searchParams = useSearchParams();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedAges, setSelectedAges] = useState<AgeGroup[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortKey>("default");
  const [showFilters, setShowFilters] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    fetch("/api/products?format=frontend")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setAllProducts(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Initialize filters from URL search params on mount
  useEffect(() => {
    if (initialized) return;

    const q = searchParams.get("search");
    const cat = searchParams.get("category");
    const s = searchParams.get("sort");
    const onSale = searchParams.get("onSale");

    if (q) setSearch(q);
    if (cat) {
      const matched = CATEGORIES.find((c) => c.toLowerCase() === cat.toLowerCase());
      if (matched) setSelectedCategories([matched]);
    }
    if (s === "newest" || s === "price-asc" || s === "price-desc") {
      setSort(s);
    }
    if (onSale === "true") {
      setSort("price-asc");
    }

    setInitialized(true);
  }, [searchParams, initialized]);

  const debouncedSearch = useDebounce(search, 250);

  const toggleAge = useCallback((age: AgeGroup) => {
    setSelectedAges((prev) => (prev.includes(age) ? prev.filter((a) => a !== age) : [...prev, age]));
  }, []);

  const toggleCategory = useCallback((cat: Category) => {
    setSelectedCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }, []);

  const hasActiveFilters =
    debouncedSearch.length > 0 ||
    selectedAges.length > 0 ||
    selectedCategories.length > 0 ||
    minPrice.length > 0 ||
    maxPrice.length > 0;

  const clearAll = useCallback(() => {
    setSearch("");
    setSelectedAges([]);
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
    setSort("default");
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedAges.length > 0) {
      result = result.filter((p) => selectedAges.includes(p.ageGroup));
    }

    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    const min = minPrice ? parseInt(minPrice, 10) : 0;
    const max = maxPrice ? parseInt(maxPrice, 10) : Infinity;
    if (min > 0 || max < Infinity) {
      result = result.filter((p) => {
        const price = parsePrice(p.price);
        return price >= min && price <= max;
      });
    }

    if (sort === "price-asc") {
      result.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (sort === "price-desc") {
      result.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    } else if (sort === "newest") {
      result.sort((a, b) => (a.badge === "New" ? -1 : b.badge === "New" ? 1 : 0));
    }

    return result;
  }, [allProducts, debouncedSearch, selectedAges, selectedCategories, minPrice, maxPrice, sort]);

  return (
    <div className="min-h-dvh bg-navy">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-10 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-light px-4 py-1.5 border border-purple/15 mb-4">
            <span className="text-sm">🛍️</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple">Shop All Toys</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text-primary tracking-tight">
            Explore Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink via-purple to-blue">
              Collection
            </span>
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
          </p>
          {debouncedSearch && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-text-muted">Search results for:</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/15 px-3 py-1 text-sm font-bold text-brand border border-brand/20">
                {debouncedSearch}
                <button
                  onClick={() => setSearch("")}
                  className="ml-1 flex h-4 w-4 items-center justify-center rounded-full hover:bg-brand/20 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Search + Sort + Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search toys by name, tag, or description..."
              className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-3 text-sm font-medium text-text-primary placeholder:text-text-muted focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="appearance-none rounded-xl border border-border bg-surface pl-4 pr-10 py-3 text-sm font-medium text-text-primary focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-all sm:hidden ${
              showFilters
                ? "border-purple/40 bg-purple-light text-purple"
                : "border-border bg-surface text-text-secondary hover:border-purple/25"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple text-[10px] font-bold text-white">
                {selectedAges.length + selectedCategories.length + (debouncedSearch ? 1 : 0) + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters — desktop always visible, mobile toggle */}
          <aside className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-64 shrink-0 space-y-6`}>
            {/* Clear All */}
            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 text-[12px] font-bold text-pink hover:text-pink/80 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Clear All Filters
              </button>
            )}

            {/* Age Group */}
            <div>
              <h3 className="text-[12px] font-extrabold uppercase tracking-wider text-text-muted mb-3">Age Group</h3>
              <div className="flex flex-wrap gap-2">
                {AGE_GROUPS.map((age) => (
                  <button
                    key={age}
                    onClick={() => toggleAge(age)}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-bold border transition-all ${
                      selectedAges.includes(age)
                        ? "border-purple/40 bg-purple-light text-purple"
                        : "border-border bg-surface text-text-secondary hover:border-purple/20"
                    }`}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-[12px] font-extrabold uppercase tracking-wider text-text-muted mb-3">Category</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-bold border transition-all ${
                      selectedCategories.includes(cat)
                        ? "border-cyan/40 bg-cyan-light text-cyan"
                        : "border-border bg-surface text-text-secondary hover:border-cyan/20"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-[12px] font-extrabold uppercase tracking-wider text-text-muted mb-3">Price Range (PKR)</h3>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-text-muted">Rs.</span>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value.replace(/^0+(?=\d)/, ""))}
                    placeholder="Min"
                    className="w-full rounded-lg border border-border bg-surface pl-9 pr-2 py-2 text-[12px] font-medium text-text-primary placeholder:text-text-muted focus:border-purple/40 focus:outline-none focus:ring-1 focus:ring-purple/10"
                  />
                </div>
                <span className="text-text-muted text-[11px]">—</span>
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-text-muted">Rs.</span>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value.replace(/^0+(?=\d)/, ""))}
                    placeholder="Max"
                    className="w-full rounded-lg border border-border bg-surface pl-9 pr-2 py-2 text-[12px] font-medium text-text-primary placeholder:text-text-muted focus:border-purple/40 focus:outline-none focus:ring-1 focus:ring-purple/10"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface border border-border">
                  <PackageSearch className="h-8 w-8 text-text-muted" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-1">No products found</h3>
                <p className="text-sm text-text-secondary mb-5 max-w-xs">
                  {debouncedSearch
                    ? <>No toys found matching &quot;{debouncedSearch}&quot;. Try a different search term.</>
                    : "We couldn&apos;t find any toys matching your filters. Try adjusting your criteria."}
                </p>
                <button
                  onClick={clearAll}
                  className="inline-flex items-center gap-2 rounded-xl rainbow-gradient px-6 py-2.5 text-sm font-bold text-white shadow-premium-brand hover:shadow-lg hover:shadow-purple/20 transition-all"
                >
                  <X className="h-4 w-4" />
                  {debouncedSearch ? "Clear Search" : "Clear All Filters"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-brand animate-spin" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
