"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  XCircle,
  Package,
  Search,
  ImageOff,
} from "lucide-react";

interface ProductData {
  _id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  category: string;
  image: string;
  images: string[];
  description: string;
  highlights: string[];
  brand: string;
  material: string;
  pieces: string;
  ageRange: string;
  stock: number;
  badge: string;
  isFreeDelivery: boolean;
  ageGroup: string;
  tags: string[];
  rating: number;
  reviews: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductForm {
  name: string;
  price: string;
  originalPrice: string;
  category: string;
  image: string;
  image2: string;
  image3: string;
  image4: string;
  description: string;
  highlights: string;
  brand: string;
  material: string;
  pieces: string;
  ageRange: string;
  stock: string;
  badge: string;
  isFreeDelivery: boolean;
  ageGroup: string;
  tags: string;
}

const CATEGORIES = [
  "Educational Toys",
  "Action Figures",
  "Board Games",
  "Dolls & Plush",
  "Vehicles & Remote Control",
  "Musical Toys",
  "Building & Construction",
  "Outdoor & Sports",
];

const AGE_GROUPS = ["0-2 Years", "3-5 Years", "6-8 Years", "9+ Years"];

const initialForm: ProductForm = {
  name: "",
  price: "",
  originalPrice: "",
  category: "Educational Toys",
  image: "",
  image2: "",
  image3: "",
  image4: "",
  description: "",
  highlights: "",
  brand: "ToyVerse",
  material: "ABS Plastic",
  pieces: "",
  ageRange: "3+ Years",
  stock: "0",
  badge: "",
  isFreeDelivery: false,
  ageGroup: "3-5 Years",
  tags: "",
};

export function AdminProducts() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductData | null>(null);
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState<number | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setFormError(null);
    setImagePreviewError(false);
    setModalOpen(true);
  };

  const openEdit = (product: ProductData) => {
    setEditing(product);
    const imgs = product.images && product.images.length > 0 ? product.images : [product.image];
    setForm({
      name: product.name,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      category: product.category,
      image: product.image,
      image2: imgs[1] || "",
      image3: imgs[2] || "",
      image4: imgs[3] || "",
      description: product.description,
      highlights: (product.highlights || []).join("\n"),
      brand: product.brand || "ToyVerse",
      material: product.material || "ABS Plastic",
      pieces: product.pieces || "",
      ageRange: product.ageRange || "3+ Years",
      stock: String(product.stock),
      badge: product.badge,
      isFreeDelivery: product.isFreeDelivery,
      ageGroup: product.ageGroup,
      tags: product.tags.join(", "),
    });
    setFormError(null);
    setImagePreviewError(false);
    setModalOpen(true);
  };

  const handleFieldChange = (field: keyof ProductForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
    if (field === "image") setImagePreviewError(false);
  };

  const compressAndToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const maxDim = 600;
      const quality = 0.6;
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Failed to load image for compression"));
      img.src = URL.createObjectURL(file);
    });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFormError(null);

    try {
      const base64 = await compressAndToBase64(file);
      handleFieldChange("image", base64);
      setImagePreviewError(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to process image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const submitForm = async () => {
    const price = parseFloat(form.price);
    if (!form.name.trim()) {
      setFormError("Product name is required");
      return;
    }
    if (isNaN(price) || price <= 0) {
      setFormError("Price must be a positive number");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const allImages = [
      form.image.trim(),
      form.image2.trim(),
      form.image3.trim(),
      form.image4.trim(),
    ].filter(Boolean);

    const primaryImage = allImages[0] || "/images/placeholder.svg";
    if (allImages.length === 0) allImages.push(primaryImage);

    const payload = {
      name: form.name.trim(),
      price,
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      category: form.category,
      image: primaryImage,
      images: allImages,
      description: form.description.trim(),
      highlights: form.highlights
        .split("\n")
        .map((h) => h.trim())
        .filter(Boolean),
      brand: form.brand.trim() || "ToyVerse",
      material: form.material.trim() || "ABS Plastic",
      pieces: form.pieces.trim(),
      ageRange: form.ageRange.trim() || "3+ Years",
      stock: parseInt(form.stock, 10) || 0,
      badge: form.badge,
      isFreeDelivery: form.isFreeDelivery,
      ageGroup: form.ageGroup,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/products/${editing._id}` : "/api/products";
      console.log("[AdminProducts] Submitting:", method, url);
      console.log("[AdminProducts] payload.image:", payload.image?.substring(0, 80));
      console.log("[AdminProducts] payload.images:", JSON.stringify(payload.images).substring(0, 200));
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
        signal: AbortSignal.timeout(30000),
      });
      const data = await res.json();
      console.log("[AdminProducts] Response:", res.status, JSON.stringify(data).substring(0, 300));
      if (!res.ok) throw new Error(data.error || "Failed to save product");

      setModalOpen(false);
      setToast({
        type: "success",
        text: editing ? "Product updated!" : "Product created!",
      });

      if (editing && data.data) {
        setProducts((prev) =>
          prev.map((p) => (p._id === editing._id ? data.data : p))
        );
      }
      fetchProducts();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      const isTimeout = msg.includes("timeout") || msg.includes("AbortError");
      setToast({
        type: "error",
        text: isTimeout
          ? "Update timed out — try reducing image size or using fewer gallery images."
          : msg || "Failed to save product. Image size might be too large.",
      });
      setFormError(isTimeout ? "Request timed out." : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    setDeletingId(productId);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error("Failed to delete");
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      setToast({ type: "success", text: "Product deleted" });
    } catch {
      setToast({ type: "error", text: "Failed to delete product" });
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.badge.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
            <Package className="h-5 w-5 text-purple" strokeWidth={2} />
            Product Management
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Add, edit, and manage your product catalog.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl rainbow-gradient px-5 py-2.5 text-sm font-bold text-white shadow-premium-brand hover:shadow-lg hover:shadow-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Add New Product
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border border-border bg-surface-light py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all duration-200"
          />
        </div>
      </div>

      {/* Content */}
      {loading && products.length === 0 ? (
        <div className="flex items-center justify-center py-32">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2 className="h-5 w-5 animate-spin text-purple" />
            <span className="text-sm">Loading products...</span>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-text-primary mb-1">Failed to Load Products</h2>
          <p className="text-sm text-text-secondary mb-4">{error}</p>
          <button
            type="button"
            onClick={fetchProducts}
            className="rounded-xl rainbow-gradient px-6 py-2.5 text-sm font-bold text-white shadow-premium-brand hover:shadow-lg hover:shadow-purple/20 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl bg-surface border border-border shadow-premium-sm py-16 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-light">
              <Package className="h-8 w-8 text-purple" strokeWidth={1.5} />
            </div>
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-1">No Products Yet</h3>
          <p className="text-sm text-text-secondary mb-6">
            Add your first product to start selling.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="rounded-xl rainbow-gradient px-6 py-2.5 text-sm font-bold text-white shadow-premium-brand hover:shadow-lg hover:shadow-purple/20 transition-all duration-300"
          >
            Add First Product
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-surface border border-border shadow-premium-sm overflow-hidden">
          <div className="border-b border-border px-6 py-4 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-text-muted">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Product
                  </th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Category
                  </th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-text-muted text-right">
                    Price
                  </th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-text-muted text-right">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Badge
                  </th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <Search className="h-6 w-6 text-purple mb-3" strokeWidth={1.5} />
                        <h3 className="text-sm font-bold text-text-primary mb-1">No products found</h3>
                        <p className="text-[12px] text-text-secondary">Try a different search term.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-surface-light/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-light border border-border">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                                unoptimized
                                onError={() => setImagePreviewError(true)}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ImageOff className="h-5 w-5 text-text-muted" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-primary truncate max-w-[200px]">
                              {product.name}
                            </p>
                            <p className="text-[11px] text-text-muted truncate max-w-[200px]">
                              {product.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[12px] text-text-secondary">{product.category}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-text-primary">
                          Rs. {product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="block text-[11px] text-text-muted line-through">
                            Rs. {product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            product.stock > 10
                              ? "bg-green/10 text-green border border-green/20"
                              : product.stock > 0
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {product.badge ? (
                          <span className="inline-flex items-center rounded-full bg-purple/10 px-2.5 py-1 text-[11px] font-bold text-purple border border-purple/20">
                            {product.badge}
                          </span>
                        ) : (
                          <span className="text-[12px] text-text-muted">--</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(product)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-light text-text-muted hover:border-purple/40 hover:text-purple hover:bg-purple/10 transition-all duration-200"
                            title="Edit product"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product._id)}
                            disabled={deletingId === product._id}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-light text-text-muted hover:border-red-400/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50"
                            title="Delete product"
                          >
                            {deletingId === product._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-border shadow-premium-lg">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-6 py-4">
              <h3 className="text-base font-extrabold text-text-primary">
                {editing ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-light transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Image Preview */}
              {form.image && !imagePreviewError && (
                <div className="relative h-32 w-full overflow-hidden rounded-xl bg-surface-light border border-border">
                  <Image
                    src={form.image}
                    alt="Preview"
                    fill
                    sizes="100%"
                    className="object-cover"
                    unoptimized
                    onError={() => setImagePreviewError(true)}
                  />
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-[12px] font-bold text-text-primary mb-1.5">
                  Product Title *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  placeholder="e.g. Remote Control Racing Car"
                  className="w-full rounded-xl border border-border bg-surface-light px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all"
                />
              </div>

              {/* Price + Original Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-text-primary mb-1.5">
                    Price (Rs.) *
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => handleFieldChange("price", e.target.value)}
                    placeholder="2499"
                    min="1"
                    className="w-full rounded-xl border border-border bg-surface-light px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-text-primary mb-1.5">
                    Original Price (Rs.)
                  </label>
                  <input
                    type="number"
                    value={form.originalPrice}
                    onChange={(e) => handleFieldChange("originalPrice", e.target.value)}
                    placeholder="3299"
                    min="0"
                    className="w-full rounded-xl border border-border bg-surface-light px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all"
                  />
                </div>
              </div>

              {/* Category + Age Group */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-text-primary mb-1.5">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => handleFieldChange("category", e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-light px-4 py-2.5 text-sm text-text-primary focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-text-primary mb-1.5">
                    Age Group
                  </label>
                  <select
                    value={form.ageGroup}
                    onChange={(e) => handleFieldChange("ageGroup", e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-light px-4 py-2.5 text-sm text-text-primary focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all cursor-pointer"
                  >
                    {AGE_GROUPS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stock + Badge */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-text-primary mb-1.5">
                    Stock Count
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => handleFieldChange("stock", e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full rounded-xl border border-border bg-surface-light px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-text-primary mb-1.5">
                    Badge / Tag
                  </label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => handleFieldChange("badge", e.target.value)}
                    placeholder="e.g. New, Best Seller, Sale"
                    className="w-full rounded-xl border border-border bg-surface-light px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-[12px] font-bold text-text-primary mb-2">
                  Product Images
                </label>
                <div className="space-y-3">
                  {/* Primary Image */}
                  <div>
                    <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                      Main Image (Primary) *
                    </label>
                    <div className="flex items-start gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-light border border-border">
                        {form.image ? (
                          <Image
                            src={form.image}
                            alt="Main preview"
                            fill
                            sizes="64px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageOff className="h-4 w-4 text-text-muted" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <label
                          className={`flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-3 py-2 text-[11px] font-semibold cursor-pointer transition-all ${
                            uploading
                              ? "border-brand/30 bg-brand/5 text-brand"
                              : "border-border hover:border-brand/40 text-text-secondary hover:text-brand"
                          }`}
                        >
                          {uploading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <span>📁</span>
                          )}
                          Upload
                          <input type="file" accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploading(true);
                            compressAndToBase64(file)
                              .then((base64) => handleFieldChange("image", base64))
                              .catch(() => {})
                              .finally(() => { setUploading(false); e.target.value = ""; });
                          }} disabled={uploading} className="sr-only" />
                        </label>
                        <input
                          type="text"
                          value={form.image}
                          onChange={(e) => handleFieldChange("image", e.target.value)}
                          placeholder="/images/product.svg or https://..."
                          className="w-full rounded-lg border border-border bg-surface-light px-3 py-1.5 text-[11px] text-text-primary placeholder:text-text-muted focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gallery Images 2-4 */}
                  {(["image2", "image3", "image4"] as const).map((field, i) => (
                    <div key={field}>
                      <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                        Gallery Image {i + 2}
                      </label>
                      <div className="flex items-start gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-light border border-border">
                          {form[field] ? (
                            <Image
                              src={form[field]}
                              alt={`Preview ${i + 2}`}
                              fill
                              sizes="48px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ImageOff className="h-3.5 w-3.5 text-text-muted" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <label
                            className={`flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-3 py-1.5 text-[11px] font-semibold cursor-pointer transition-all ${
                              galleryUploading === i
                                ? "border-brand/30 bg-brand/5 text-brand"
                                : "border-border hover:border-brand/40 text-text-secondary hover:text-brand"
                            }`}
                          >
                            {galleryUploading === i ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <span>📁</span>
                            )}
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setGalleryUploading(i);
                                compressAndToBase64(file)
                                  .then((base64) => handleFieldChange(field, base64))
                                  .catch(() => {})
                                  .finally(() => { setGalleryUploading(null); e.target.value = ""; });
                              }}
                              disabled={galleryUploading !== null}
                              className="sr-only"
                            />
                          </label>
                          <input
                            type="text"
                            value={form[field]}
                            onChange={(e) => handleFieldChange(field, e.target.value)}
                            placeholder="Paste image URL..."
                            className="w-full rounded-lg border border-border bg-surface-light px-3 py-1.5 text-[11px] text-text-primary placeholder:text-text-muted focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[12px] font-bold text-text-primary mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  rows={3}
                  placeholder="Describe the product..."
                  className="w-full rounded-xl border border-border bg-surface-light px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all resize-none"
                />
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-[12px] font-bold text-text-primary mb-1.5">
                  Highlights / Key Features (one per line)
                </label>
                <textarea
                  value={form.highlights}
                  onChange={(e) => handleFieldChange("highlights", e.target.value)}
                  rows={3}
                  placeholder={"Encourages creativity and imagination\nSafe and non-toxic material\nImproves hand-eye coordination"}
                  className="w-full rounded-xl border border-border bg-surface-light px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all resize-none"
                />
              </div>

              {/* Brand + Material */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-text-primary mb-1.5">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => handleFieldChange("brand", e.target.value)}
                    placeholder="ToyVerse"
                    className="w-full rounded-xl border border-border bg-surface-light px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-text-primary mb-1.5">
                    Material
                  </label>
                  <input
                    type="text"
                    value={form.material}
                    onChange={(e) => handleFieldChange("material", e.target.value)}
                    placeholder="ABS Plastic"
                    className="w-full rounded-xl border border-border bg-surface-light px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all"
                  />
                </div>
              </div>

              {/* Pieces + Age Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-text-primary mb-1.5">
                    Pieces / Count
                  </label>
                  <input
                    type="text"
                    value={form.pieces}
                    onChange={(e) => handleFieldChange("pieces", e.target.value)}
                    placeholder="e.g. 120 Pcs"
                    className="w-full rounded-xl border border-border bg-surface-light px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-text-primary mb-1.5">
                    Age Range
                  </label>
                  <input
                    type="text"
                    value={form.ageRange}
                    onChange={(e) => handleFieldChange("ageRange", e.target.value)}
                    placeholder="e.g. 3+ Years"
                    className="w-full rounded-xl border border-border bg-surface-light px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[12px] font-bold text-text-primary mb-1.5">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => handleFieldChange("tags", e.target.value)}
                  placeholder="e.g. remote control, racing, car"
                  className="w-full rounded-xl border border-border bg-surface-light px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all"
                />
              </div>

              {/* Free Delivery */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFreeDelivery}
                  onChange={(e) => handleFieldChange("isFreeDelivery", e.target.checked)}
                  className="h-4 w-4 rounded border-border text-brand focus:ring-brand/20"
                />
                <span className="text-sm text-text-primary font-medium">Free Delivery</span>
              </label>

              {formError && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <XCircle className="h-3 w-3 shrink-0" />
                  {formError}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-surface px-6 py-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text-secondary hover:bg-surface-light transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitForm}
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl rainbow-gradient px-5 py-2.5 text-sm font-bold text-white shadow-premium-brand hover:shadow-lg hover:shadow-purple/20 disabled:opacity-50 transition-all duration-300"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editing ? "Update Product" : "Create Product"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[110] animate-fade-in-up">
          <div
            className={`flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-bold shadow-premium-lg border ${
              toast.type === "success"
                ? "bg-green/10 text-green border-green/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}
          >
            {toast.type === "success" ? (
              <XCircle className="h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0" />
            )}
            {toast.text}
          </div>
        </div>
      )}
    </>
  );
}
