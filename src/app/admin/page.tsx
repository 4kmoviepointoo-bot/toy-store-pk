"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  DollarSign,
  ArrowLeft,
  Loader2,
  Package,
  Box,
  RefreshCw,
  Check,
  ChevronDown,
  LogOut,
  Search,
  X,
  MapPin,
  Save,
  Tag,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Pencil,
} from "lucide-react";
import { AdminProducts } from "@/components/AdminProducts";

interface OrderItem {
  name: string;
  price: string;
  image: string;
  quantity: number;
}

interface Order {
  _id: string;
  id: string;
  orderId: string;
  customer: { name: string; phone: string; email: string | null };
  delivery: { address: string; city: string };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentLabel: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  currentLocation: string;
  createdAt: string;
}

interface CouponData {
  _id: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  minOrder: number;
  active: boolean;
  expiryDate: string | null;
  usageCount: number;
  createdAt: string;
}

interface CouponForm {
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  minOrder: number;
  active: boolean;
  expiryDate: string;
}

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof Clock }
> = {
  pending: { label: "Pending", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", icon: Clock },
  confirmed: { label: "Confirmed", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: CheckCircle2 },
  shipped: { label: "Shipped", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", icon: Truck },
  delivered: { label: "Delivered", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: XCircle },
};

const paymentIcons: Record<string, string> = {
  cod: "💵",
  jazzcash: "📱",
  easypaisa: "📱",
  bank: "🏦",
};

const VALID_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

type TabKey = "orders" | "products" | "coupons" | "settings";

const initialCouponForm: CouponForm = {
  code: "",
  type: "percentage",
  value: 10,
  minOrder: 0,
  active: true,
  expiryDate: "",
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("orders");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState<CouponForm>(initialCouponForm);
  const [couponFormError, setCouponFormError] = useState<string | null>(null);
  const [couponSubmitting, setCouponSubmitting] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponData | null>(null);
  const [couponToast, setCouponToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deletingCouponId, setDeletingCouponId] = useState<string | null>(null);

  const [deliveryThreshold, setDeliveryThreshold] = useState(2500);
  const [thresholdEnabled, setThresholdEnabled] = useState(true);
  const [minProductPrice, setMinProductPrice] = useState(2500);
  const [productPriceRuleActive, setProductPriceRuleActive] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsToast, setSettingsToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Server connection error");
      }
      const resData = await res.json();
      const orderList = resData.data || resData.orders || (Array.isArray(resData) ? resData : []);
      setOrders(orderList);
      setLocationInputs((prev) => {
        const next = { ...prev };
        for (const o of orderList) {
          if (!(o._id in next)) {
            next[o._id] = o.currentLocation || "";
          }
        }
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    setCouponsLoading(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Server connection error");
      }
      const resData = await res.json();
      const couponList = resData.data?.coupons || resData.data || resData.coupons || (Array.isArray(resData) ? resData : []);
      setCoupons(couponList);
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCouponsLoading(false);
    }
  };

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch settings");
      const resData = await res.json();
      const data = resData.data || resData;
      setDeliveryThreshold(data.freeDeliveryThreshold ?? 2500);
      setThresholdEnabled(data.isThresholdEnabled ?? true);
      setMinProductPrice(data.minProductPriceForFreeDelivery ?? 2500);
      setProductPriceRuleActive(data.isProductPriceRuleActive ?? true);
    } catch {
      // use defaults on failure
    } finally {
      setSettingsLoading(false);
    }
  };

  const sanitizeNumberInput = (value: string, setter: (n: number) => void) => {
    if (value === "") {
      setter(0);
      return;
    }
    const stripped = value.replace(/^0+(?=\d)/, "");
    setter(Number(stripped));
  };

  const saveSettings = async () => {
    setSettingsSaving(true);
    setSettingsToast(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freeDeliveryThreshold: parseInt(String(deliveryThreshold), 10) || 2500,
          isThresholdEnabled: thresholdEnabled,
          minProductPriceForFreeDelivery: parseInt(String(minProductPrice), 10) || 2500,
          isProductPriceRuleActive: productPriceRuleActive,
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const resData = await res.json().catch(() => null);
      if (!res.ok) {
        setSettingsToast({ type: "error", text: resData?.error || "Failed to save settings" });
        return;
      }
      setSettingsToast({ type: "success", text: "Shipping settings saved successfully!" });
    } catch {
      setSettingsToast({ type: "error", text: "Failed to save settings" });
    } finally {
      setSettingsSaving(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCoupons();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!couponToast) return;
    const t = setTimeout(() => setCouponToast(null), 3000);
    return () => clearTimeout(t);
  }, [couponToast]);

  useEffect(() => {
    if (!settingsToast) return;
    const t = setTimeout(() => setSettingsToast(null), 3000);
    return () => clearTimeout(t);
  }, [settingsToast]);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState<{ id: string; type: "success" | "error"; text: string } | null>(null);

  const handleStatusChange = useCallback(async (orderId: string, newStatus: string) => {
    const previous = orders;
    setOrders((prev) => prev.map((o) => ((o._id === orderId || o.id === orderId) ? { ...o, status: newStatus as Order["status"] } : o)));
    setUpdatingId(orderId);
    setUpdateMessage(null);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error("Failed to update");
      setUpdateMessage({ id: orderId, type: "success", text: "Updated" });
    } catch {
      setOrders(previous);
      setUpdateMessage({ id: orderId, type: "error", text: "Failed to update" });
    } finally {
      setUpdatingId(null);
    }
  }, [orders]);

  useEffect(() => {
    if (!updateMessage) return;
    const t = setTimeout(() => setUpdateMessage(null), 2500);
    return () => clearTimeout(t);
  }, [updateMessage]);

  const [locationInputs, setLocationInputs] = useState<Record<string, string>>({});
  const [savingLocationId, setSavingLocationId] = useState<string | null>(null);
  const [locationMessage, setLocationMessage] = useState<{ id: string; type: "success" | "error"; text: string } | null>(null);

  const handleLocationSave = useCallback(async (orderId: string) => {
    const location = locationInputs[orderId] ?? "";
    const previous = orders;
    setOrders((prev) => prev.map((o) => ((o._id === orderId || o.id === orderId) ? { ...o, currentLocation: location } : o)));
    setSavingLocationId(orderId);
    setLocationMessage(null);
    try {
      const order = orders.find((o) => (o._id === orderId || o.id === orderId));
      if (!order) throw new Error("Order not found");
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: order.status, currentLocation: location }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error("Failed to save");
      setLocationMessage({ id: orderId, type: "success", text: "Location saved" });
    } catch {
      setOrders(previous);
      setLocationMessage({ id: orderId, type: "error", text: "Failed to save" });
    } finally {
      setSavingLocationId(null);
    }
  }, [locationInputs, orders]);

  useEffect(() => {
    if (!locationMessage) return;
    const t = setTimeout(() => setLocationMessage(null), 2500);
    return () => clearTimeout(t);
  }, [locationMessage]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchId = order.orderId.toLowerCase().includes(q);
      const matchName = order.customer.name.toLowerCase().includes(q);
      const matchPhone = order.customer.phone.includes(q);
      if (!matchId && !matchName && !matchPhone) return false;
    }
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    if (paymentFilter !== "all" && order.paymentMethod !== paymentFilter) return false;
    return true;
  });

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const confirmedOrders = orders.filter((o) => o.status === "confirmed").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const totalSales = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      gradient: "from-pink to-purple",
      lightBg: "bg-pink-light",
      iconColor: "text-pink",
    },
    {
      label: "Pending",
      value: pendingOrders,
      icon: Clock,
      gradient: "from-yellow to-orange",
      lightBg: "bg-yellow-light",
      iconColor: "text-yellow",
    },
    {
      label: "Confirmed",
      value: confirmedOrders,
      icon: CheckCircle2,
      gradient: "from-blue to-cyan",
      lightBg: "bg-blue-light",
      iconColor: "text-blue",
    },
    {
      label: "Delivered",
      value: deliveredOrders,
      icon: CheckCircle2,
      gradient: "from-green to-cyan",
      lightBg: "bg-green-light",
      iconColor: "text-green",
    },
    {
      label: "Total Sales",
      value: `Rs. ${totalSales.toLocaleString()}`,
      icon: DollarSign,
      gradient: "from-purple to-pink",
      lightBg: "bg-purple-light",
      iconColor: "text-purple",
    },
  ];

  // ---- Coupon handlers ----

  const openCreateCoupon = () => {
    setEditingCoupon(null);
    setCouponForm(initialCouponForm);
    setCouponFormError(null);
    setCouponModalOpen(true);
  };

  const openEditCoupon = (coupon: CouponData) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrder: coupon.minOrder,
      active: coupon.active,
      expiryDate: coupon.expiryDate ? coupon.expiryDate.split("T")[0] : "",
    });
    setCouponFormError(null);
    setCouponModalOpen(true);
  };

  const handleCouponFormChange = (field: keyof CouponForm, value: string | number | boolean) => {
    setCouponForm((prev) => ({ ...prev, [field]: value }));
    setCouponFormError(null);
  };

  const submitCouponForm = async () => {
    const f = couponForm;
    if (!f.code.trim()) {
      setCouponFormError("Coupon code is required");
      return;
    }
    if (f.type !== "free_shipping" && f.value <= 0) {
      setCouponFormError("Discount value must be greater than 0");
      return;
    }
    if (f.type === "percentage" && f.value > 100) {
      setCouponFormError("Percentage cannot exceed 100");
      return;
    }

    setCouponSubmitting(true);
    setCouponFormError(null);

    try {
      const payload = {
        ...(editingCoupon ? { id: editingCoupon._id } : {}),
        code: f.code.trim().toUpperCase(),
        type: f.type,
        value: f.type === "free_shipping" ? 0 : f.value,
        minOrder: f.minOrder,
        active: f.active,
        expiryDate: f.expiryDate || null,
      };

      const optimisticCoupon = {
        _id: editingCoupon?._id || `temp-${Date.now()}`,
        ...payload,
        usageCount: editingCoupon?.usageCount || 0,
        createdAt: editingCoupon?.createdAt || new Date().toISOString(),
      };

      if (editingCoupon) {
        setCoupons((prev) => prev.map((c) => (c._id === editingCoupon._id ? { ...c, ...payload } : c)));
      } else {
        setCoupons((prev) => [optimisticCoupon as CouponData, ...prev]);
      }
      setCouponModalOpen(false);
      setCouponToast({ type: "success", text: editingCoupon ? "Coupon updated!" : "Coupon created!" });

      const method = editingCoupon ? "PATCH" : "POST";
      const res = await fetch("/api/admin/coupons", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save coupon");

      if (data.data) {
        setCoupons((prev) => prev.map((c) => (c._id === optimisticCoupon._id ? data.data : c)));
      }
      fetchCoupons();
    } catch (err) {
      fetchCoupons();
      setCouponFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCouponSubmitting(false);
    }
  };

  const handleToggleCouponActive = useCallback(async (coupon: CouponData) => {
    const previous = coupons;
    setCoupons((prev) =>
      prev.map((c) => (c._id === coupon._id ? { ...c, active: !c.active } : c))
    );
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: coupon._id, active: !coupon.active }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error("Failed to update");
      setCouponToast({
        type: "success",
        text: `Coupon ${coupon.active ? "deactivated" : "activated"}`,
      });
    } catch {
      setCoupons(previous);
      setCouponToast({ type: "error", text: "Failed to update coupon status" });
    }
  }, [coupons]);

  const handleDeleteCoupon = useCallback(async (couponId: string) => {
    const previous = coupons;
    setCoupons((prev) => prev.filter((c) => c._id !== couponId));
    setDeletingCouponId(couponId);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: couponId }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error("Failed to delete");
      setCouponToast({ type: "success", text: "Coupon deleted" });
    } catch {
      setCoupons(previous);
      setCouponToast({ type: "error", text: "Failed to delete coupon" });
    } finally {
      setDeletingCouponId(null);
    }
  }, [coupons]);

  return (
    <div className="min-h-dvh bg-navy">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-navy/90 backdrop-blur-xl border-b border-border/60 shadow-premium-sm">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-text-secondary hover:text-brand hover:bg-brand-light transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              Back to Store
            </a>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl rainbow-gradient">
                <LayoutDashboard className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-text-primary">Admin Dashboard</h1>
                <p className="text-[11px] text-text-muted">ToyVerse Pakistan</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "orders" && (
              <button
                type="button"
                onClick={fetchOrders}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-secondary hover:border-brand/30 hover:text-brand hover:bg-brand-light transition-all duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} strokeWidth={2} />
                Refresh
              </button>
            )}
            {activeTab === "coupons" && (
              <button
                type="button"
                onClick={fetchCoupons}
                disabled={couponsLoading}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-secondary hover:border-brand/30 hover:text-brand hover:bg-brand-light transition-all duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${couponsLoading ? "animate-spin" : ""}`} strokeWidth={2} />
                Refresh
              </button>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-secondary hover:border-red-400/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" strokeWidth={2} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10">
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mb-8 rounded-2xl bg-surface border border-border p-1.5 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
              activeTab === "orders"
                ? "rainbow-gradient text-white shadow-premium-brand"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-light"
            }`}
          >
            <Package className="h-4 w-4" strokeWidth={2} />
            Orders
            <span className={`ml-1 text-[11px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === "orders" ? "bg-white/20" : "bg-surface-light"}`}>
              {orders.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
              activeTab === "products"
                ? "rainbow-gradient text-white shadow-premium-brand"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-light"
            }`}
          >
            <Box className="h-4 w-4" strokeWidth={2} />
            Products
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("coupons")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
              activeTab === "coupons"
                ? "rainbow-gradient text-white shadow-premium-brand"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-light"
            }`}
          >
            <Tag className="h-4 w-4" strokeWidth={2} />
            Coupons
            <span className={`ml-1 text-[11px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === "coupons" ? "bg-white/20" : "bg-surface-light"}`}>
              {coupons.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
              activeTab === "settings"
                ? "rainbow-gradient text-white shadow-premium-brand"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-light"
            }`}
          >
            <Truck className="h-4 w-4" strokeWidth={2} />
            Shipping
          </button>
        </div>

        {/* ==================== ORDERS TAB ==================== */}
        {activeTab === "orders" && (
          <>
            {loading && orders.length === 0 ? (
              <div className="flex items-center justify-center py-32">
                <div className="flex items-center gap-3 text-text-secondary">
                  <Loader2 className="h-5 w-5 animate-spin text-purple" />
                  <span className="text-sm">Loading orders…</span>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                  <XCircle className="h-8 w-8 text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-text-primary mb-1">Failed to Load Orders</h2>
                <p className="text-sm text-text-secondary mb-4">{error}</p>
                <button
                  type="button"
                  onClick={fetchOrders}
                  className="rounded-xl rainbow-gradient px-6 py-2.5 text-sm font-bold text-white shadow-premium-brand hover:shadow-lg hover:shadow-purple/20 transition-all duration-300"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl bg-surface border border-border shadow-premium-sm p-5 hover:shadow-premium transition-shadow duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.lightBg}`}>
                          <stat.icon className={`h-5 w-5 ${stat.iconColor}`} strokeWidth={2} />
                        </div>
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-extrabold text-text-primary">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Orders Table */}
                <div className="rounded-2xl bg-surface border border-border shadow-premium-sm overflow-hidden">
                  <div className="border-b border-border px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Package className="h-5 w-5 text-purple" strokeWidth={2} />
                      <h2 className="text-base font-extrabold text-text-primary">Recent Orders</h2>
                    </div>
                    <span className="text-[12px] font-semibold text-text-muted">
                      {filteredOrders.length} of {totalOrders} orders
                    </span>
                  </div>

                  {/* Search & Filters */}
                  <div className="border-b border-border bg-surface/50 px-6 py-3 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by order ID, name, or phone…"
                        className="w-full rounded-xl border border-border bg-surface-light py-2.5 pl-10 pr-9 text-sm text-text-primary placeholder:text-text-muted focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all duration-200"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-xl border border-border bg-surface-light px-3 py-2.5 text-sm font-medium text-text-secondary focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all duration-200 cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      {VALID_STATUSES.map((s) => (
                        <option key={s} value={s}>{statusConfig[s].label}</option>
                      ))}
                    </select>

                    <select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className="rounded-xl border border-border bg-surface-light px-3 py-2.5 text-sm font-medium text-text-secondary focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all duration-200 cursor-pointer"
                    >
                      <option value="all">All Payments</option>
                      <option value="cod">Cash on Delivery</option>
                      <option value="jazzcash">JazzCash</option>
                      <option value="easypaisa">Easypaisa</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>

                  {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-light">
                        <ShoppingBag className="h-8 w-8 text-purple" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-lg font-bold text-text-primary mb-1">No Orders Yet</h3>
                      <p className="text-sm text-text-secondary">
                        Orders will appear here once customers start shopping.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-border bg-surface/50">
                            <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                              Order ID
                            </th>
                            <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                              Customer
                            </th>
                            <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-text-muted text-right">
                              Total
                            </th>
                            <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                              Payment
                            </th>
                            <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                              Shipping Address
                            </th>
                            <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                              Status
                            </th>
                            <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                              Location / Note
                            </th>
                            <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {filteredOrders.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="px-6 py-16 text-center">
                                <div className="flex flex-col items-center">
                                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-light">
                                    <Search className="h-6 w-6 text-purple" strokeWidth={1.5} />
                                  </div>
                                  <h3 className="text-sm font-bold text-text-primary mb-1">No orders found</h3>
                                  <p className="text-[12px] text-text-secondary mb-3">
                                    Try adjusting your search or filters.
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => { setSearchQuery(""); setStatusFilter("all"); setPaymentFilter("all"); }}
                                    className="text-[12px] font-semibold text-purple hover:text-purple/80 transition-colors"
                                  >
                                    Clear all filters
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            filteredOrders.map((order) => {
                            const status = statusConfig[order.status] || statusConfig.pending;
                            const StatusIcon = status.icon;
                            return (
                              <tr
                                key={order._id}
                                className="hover:bg-surface-light/50 transition-colors duration-150"
                              >
                                <td className="px-6 py-4">
                                  <span className="text-sm font-bold text-text-primary tracking-wide">
                                    {order.orderId}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div>
                                    <p className="text-sm font-semibold text-text-primary">
                                      {order.customer.name}
                                    </p>
                                    <p className="text-[11px] text-text-muted">
                                      {order.customer.phone}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <span className="text-sm font-bold text-text-primary">
                                    Rs. {order.total.toLocaleString()}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">
                                      {paymentIcons[order.paymentMethod] || "💳"}
                                    </span>
                                    <span className="text-[12px] font-medium text-text-secondary">
                                      {order.paymentLabel}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 max-w-xs">
                                  <p className="text-[12px] text-text-primary break-words leading-relaxed" title={`${order.delivery?.address || ""}${order.delivery?.city ? ", " + order.delivery.city : ""}`}>
                                    {order.delivery?.address || "—"}
                                    {order.delivery?.city && (
                                      <span className="text-text-muted">, {order.delivery.city}</span>
                                    )}
                                  </p>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="relative">
                                    <select
                                      value={order.status}
                                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                      disabled={updatingId === order._id}
                                      className={`appearance-none w-full min-w-[130px] rounded-lg border px-3 py-1.5 pr-8 text-[11px] font-bold cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple/20 disabled:opacity-50 disabled:cursor-wait ${status.bg} ${status.color}`}
                                    >
                                      {VALID_STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                          {statusConfig[s].label}
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none text-current opacity-60" />
                                    {updatingId === order._id && (
                                      <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-purple" />
                                    )}
                                  </div>
                                  {updateMessage?.id === order._id && (
                                    <p
                                      className={`mt-1 text-[10px] font-semibold ${
                                        updateMessage.type === "success" ? "text-green-400" : "text-red-400"
                                      }`}
                                    >
                                      {updateMessage.type === "success" ? (
                                        <span className="inline-flex items-center gap-1"><Check className="h-3 w-3" />{updateMessage.text}</span>
                                      ) : (
                                        updateMessage.text
                                      )}
                                    </p>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-1.5 min-w-[180px]">
                                    <div className="relative flex-1">
                                      <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-text-muted pointer-events-none" />
                                      <input
                                        type="text"
                                        value={locationInputs[order._id] ?? order.currentLocation ?? ""}
                                        onChange={(e) => setLocationInputs((prev) => ({ ...prev, [order._id]: e.target.value }))}
                                        placeholder="e.g. Arrived at Lahore Hub"
                                        className="w-full rounded-lg border border-border bg-surface-light py-1.5 pl-7 pr-2 text-[11px] text-text-primary placeholder:text-text-muted focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all duration-200"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleLocationSave(order._id)}
                                      disabled={savingLocationId === order._id}
                                      className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface-light text-text-muted hover:border-green-400/40 hover:text-green-400 hover:bg-green-500/10 transition-all duration-200 disabled:opacity-50"
                                      title="Save location"
                                    >
                                      {savingLocationId === order._id ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <Save className="h-3 w-3" />
                                      )}
                                    </button>
                                  </div>
                                  {order.currentLocation && locationMessage?.id !== order._id && (
                                    <p className="mt-1 text-[10px] text-text-muted truncate max-w-[180px]" title={order.currentLocation}>
                                      {order.currentLocation}
                                    </p>
                                  )}
                                  {locationMessage?.id === order._id && (
                                    <p
                                      className={`mt-1 text-[10px] font-semibold ${
                                        locationMessage.type === "success" ? "text-green-400" : "text-red-400"
                                      }`}
                                    >
                                      {locationMessage.type === "success" ? (
                                        <span className="inline-flex items-center gap-1"><Check className="h-3 w-3" />{locationMessage.text}</span>
                                      ) : (
                                        locationMessage.text
                                      )}
                                    </p>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-[12px] text-text-secondary">
                                    {new Date(order.createdAt).toLocaleDateString("en-PK", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* ==================== PRODUCTS TAB ==================== */}
        {activeTab === "products" && <AdminProducts />}

        {/* ==================== COUPONS TAB ==================== */}
        {activeTab === "coupons" && (
          <>
            {/* Coupons Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
                  <Tag className="h-5 w-5 text-purple" strokeWidth={2} />
                  Coupon Management
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Create and manage discount coupons for your customers.
                </p>
              </div>
              <button
                type="button"
                onClick={openCreateCoupon}
                className="flex items-center gap-2 rounded-xl rainbow-gradient px-5 py-2.5 text-sm font-bold text-white shadow-premium-brand hover:shadow-lg hover:shadow-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                Create New Coupon
              </button>
            </div>

            {couponsLoading && coupons.length === 0 ? (
              <div className="flex items-center justify-center py-32">
                <div className="flex items-center gap-3 text-text-secondary">
                  <Loader2 className="h-5 w-5 animate-spin text-purple" />
                  <span className="text-sm">Loading coupons…</span>
                </div>
              </div>
            ) : couponError ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                  <XCircle className="h-8 w-8 text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-text-primary mb-1">Failed to Load Coupons</h2>
                <p className="text-sm text-text-secondary mb-4">{couponError}</p>
                <button
                  type="button"
                  onClick={fetchCoupons}
                  className="rounded-xl rainbow-gradient px-6 py-2.5 text-sm font-bold text-white shadow-premium-brand hover:shadow-lg hover:shadow-purple/20 transition-all duration-300"
                >
                  Try Again
                </button>
              </div>
            ) : coupons.length === 0 ? (
              <div className="rounded-2xl bg-surface border border-border shadow-premium-sm py-16 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-light">
                    <Tag className="h-8 w-8 text-purple" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-1">No Coupons Yet</h3>
                <p className="text-sm text-text-secondary mb-6">
                  Create your first coupon to start offering discounts.
                </p>
                <button
                  type="button"
                  onClick={openCreateCoupon}
                  className="rounded-xl rainbow-gradient px-6 py-2.5 text-sm font-bold text-white shadow-premium-brand hover:shadow-lg hover:shadow-purple/20 transition-all duration-300"
                >
                  Create First Coupon
                </button>
              </div>
            ) : (
              <div className="rounded-2xl bg-surface border border-border shadow-premium-sm overflow-hidden">
                <div className="border-b border-border px-6 py-4 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-text-muted">
                    {coupons.length} coupon{coupons.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border bg-surface/50">
                        <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                          Code
                        </th>
                        <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                          Type & Value
                        </th>
                        <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                          Min Order
                        </th>
                        <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                          Expiry
                        </th>
                        <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                          Uses
                        </th>
                        <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                          Status
                        </th>
                        <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {coupons.map((coupon) => (
                        <tr
                          key={coupon._id}
                          className="hover:bg-surface-light/50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple/10 px-2.5 py-1 text-[12px] font-extrabold text-purple tracking-wide">
                              {coupon.code}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[13px] font-semibold text-text-primary">
                              {coupon.type === "percentage" && `${coupon.value}% off`}
                              {coupon.type === "fixed" && `Rs. ${coupon.value.toLocaleString()} off`}
                              {coupon.type === "free_shipping" && "Free Shipping"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[13px] text-text-secondary">
                              {coupon.minOrder > 0 ? `Rs. ${coupon.minOrder.toLocaleString()}` : "—"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[12px] text-text-secondary">
                              {coupon.expiryDate
                                ? new Date(coupon.expiryDate).toLocaleDateString("en-PK", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "No expiry"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[13px] font-semibold text-text-primary">
                              {coupon.usageCount}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                coupon.active
                                  ? "bg-green/10 text-green border border-green/20"
                                  : "bg-red-500/10 text-red-400 border border-red-500/20"
                              }`}
                            >
                              {coupon.active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditCoupon(coupon)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface-light text-text-muted hover:border-purple/40 hover:text-purple hover:bg-purple/10 transition-all duration-200"
                                title="Edit coupon"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleCouponActive(coupon)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface-light text-text-muted hover:border-brand/40 hover:text-brand hover:bg-brand-light transition-all duration-200"
                                title={coupon.active ? "Deactivate" : "Activate"}
                              >
                                {coupon.active ? (
                                  <ToggleRight className="h-4 w-4 text-green" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4 text-text-muted" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCoupon(coupon._id)}
                                disabled={deletingCouponId === coupon._id}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface-light text-text-muted hover:border-red-400/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50"
                                title="Delete coupon"
                              >
                                {deletingCouponId === coupon._id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Coupon Create/Edit Modal */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy/80 backdrop-blur-sm" onClick={() => setCouponModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border shadow-premium-lg animate-fade-in-up">
            <div className="border-b border-border px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-text-primary">
                {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
              </h3>
              <button
                type="button"
                onClick={() => setCouponModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-light transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Code */}
              <div>
                <label className="block text-[12px] font-bold text-text-primary mb-1.5">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={couponForm.code}
                  onChange={(e) => handleCouponFormChange("code", e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME10"
                  className="w-full rounded-xl border border-border bg-surface-light px-4 py-3 text-sm font-bold text-text-primary placeholder:text-text-muted focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all uppercase tracking-wide"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-[12px] font-bold text-text-primary mb-1.5">
                  Discount Type *
                </label>
                <div className="relative">
                  <select
                    value={couponForm.type}
                    onChange={(e) => handleCouponFormChange("type", e.target.value)}
                    className="appearance-none w-full rounded-xl border border-border bg-surface-light px-4 py-3 pr-10 text-sm font-medium text-text-secondary focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (PKR)</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                </div>
              </div>

              {/* Value */}
              {couponForm.type !== "free_shipping" && (
                <div>
                  <label className="block text-[12px] font-bold text-text-primary mb-1.5">
                    {couponForm.type === "percentage" ? "Percentage Value *" : "Discount Amount (PKR) *"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={couponForm.type === "percentage" ? 100 : undefined}
                    value={couponForm.value}
                    onChange={(e) => handleCouponFormChange("value", Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-surface-light px-4 py-3 text-sm font-semibold text-text-primary placeholder:text-text-muted focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all"
                  />
                </div>
              )}

              {/* Min Order */}
              <div>
                <label className="block text-[12px] font-bold text-text-primary mb-1.5">
                  Minimum Order Amount (PKR)
                </label>
                <input
                  type="number"
                  min={0}
                  value={couponForm.minOrder}
                  onChange={(e) => handleCouponFormChange("minOrder", Number(e.target.value))}
                  placeholder="0 = no minimum"
                  className="w-full rounded-xl border border-border bg-surface-light px-4 py-3 text-sm font-semibold text-text-primary placeholder:text-text-muted focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-[12px] font-bold text-text-primary mb-1.5">
                  Expiry Date (optional)
                </label>
                <input
                  type="date"
                  value={couponForm.expiryDate}
                  onChange={(e) => handleCouponFormChange("expiryDate", e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-light px-4 py-3 text-sm font-semibold text-text-primary focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface-light px-4 py-3">
                <div>
                  <p className="text-[13px] font-bold text-text-primary">Active Status</p>
                  <p className="text-[11px] text-text-muted">
                    {couponForm.active ? "Coupon is active and can be used" : "Coupon is inactive and hidden from customers"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCouponFormChange("active", !couponForm.active)}
                  className="relative"
                >
                  {couponForm.active ? (
                    <ToggleRight className="h-8 w-8 text-green" />
                  ) : (
                    <ToggleLeft className="h-8 w-8 text-text-muted" />
                  )}
                </button>
              </div>

              {couponFormError && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-red-400 leading-snug">{couponFormError}</p>
                </div>
              )}
            </div>

            <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCouponModalOpen(false)}
                className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-text-secondary hover:text-text-primary hover:border-brand/30 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCouponForm}
                disabled={couponSubmitting}
                className="flex items-center gap-2 rounded-xl rainbow-gradient px-5 py-2.5 text-sm font-bold text-white shadow-premium-brand hover:shadow-lg hover:shadow-purple/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50"
              >
                {couponSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                )}
                {editingCoupon ? "Update Coupon" : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Toast */}
      {couponToast && (
        <div className="fixed bottom-6 right-6 z-[110] animate-fade-in-up">
          <div
            className={`flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-bold shadow-premium-lg border ${
              couponToast.type === "success"
                ? "bg-green/10 text-green border-green/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}
          >
            {couponToast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2} />
            ) : (
              <XCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
            )}
            {couponToast.text}
          </div>
        </div>
      )}

      {/* ==================== SETTINGS TAB ==================== */}
      {activeTab === "settings" && (
        <div className="max-w-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
              <Truck className="h-5 w-5 text-purple" strokeWidth={2} />
              Shipping Settings
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Configure free delivery thresholds for your customers.
            </p>
          </div>

          <div className="rounded-2xl bg-surface border border-border shadow-premium-sm overflow-hidden">
            <div className="px-6 py-5 space-y-5">
              {settingsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-purple" />
                </div>
              ) : (
                <>
                  {/* Toggle */}
                  <div className="flex items-center justify-between rounded-xl border border-border bg-surface-light px-4 py-4">
                    <div>
                      <p className="text-[13px] font-bold text-text-primary">Enable Free Delivery Threshold</p>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        When enabled, orders above the minimum amount get free shipping.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setThresholdEnabled(!thresholdEnabled)}
                      className="relative shrink-0"
                    >
                      {thresholdEnabled ? (
                        <ToggleRight className="h-9 w-9 text-green" />
                      ) : (
                        <ToggleLeft className="h-9 w-9 text-text-muted" />
                      )}
                    </button>
                  </div>

                  {/* Threshold Input */}
                  <div className={`rounded-xl border bg-surface-light px-4 py-4 transition-opacity ${thresholdEnabled ? "border-border" : "border-border/50 opacity-50"}`}>
                    <label className="block text-[12px] font-bold text-text-primary mb-2">
                      Minimum Order Amount for Free Delivery (PKR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-text-muted">Rs.</span>
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={deliveryThreshold}
                        onChange={(e) => sanitizeNumberInput(e.target.value, setDeliveryThreshold)}
                        disabled={!thresholdEnabled}
                        className="w-full rounded-lg border border-border bg-navy-light pl-10 pr-4 py-3 text-sm font-bold text-text-primary focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <p className="mt-2 text-[11px] text-text-muted">
                      Orders at or above this amount will qualify for free delivery.
                    </p>
                  </div>

                  {/* Preview */}
                  {thresholdEnabled && deliveryThreshold > 0 && (
                    <div className="rounded-xl bg-green/5 border border-green/15 px-4 py-3">
                      <p className="text-[12px] text-green font-semibold flex items-center gap-1.5">
                        <Truck className="h-3.5 w-3.5" strokeWidth={2} />
                        Customers ordering Rs. {deliveryThreshold.toLocaleString()} or more will get free delivery.
                      </p>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-border" />

                  {/* Product Price Rule Toggle */}
                  <div className="flex items-center justify-between rounded-xl border border-border bg-surface-light px-4 py-4">
                    <div>
                      <p className="text-[13px] font-bold text-text-primary">Free Delivery on Expensive Products</p>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        When enabled, individual products priced above the threshold get free delivery.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProductPriceRuleActive(!productPriceRuleActive)}
                      className="relative shrink-0"
                    >
                      {productPriceRuleActive ? (
                        <ToggleRight className="h-9 w-9 text-green" />
                      ) : (
                        <ToggleLeft className="h-9 w-9 text-text-muted" />
                      )}
                    </button>
                  </div>

                  {/* Product Price Threshold Input */}
                  <div className={`rounded-xl border bg-surface-light px-4 py-4 transition-opacity ${productPriceRuleActive ? "border-border" : "border-border/50 opacity-50"}`}>
                    <label className="block text-[12px] font-bold text-text-primary mb-2">
                      Minimum Product Price for Free Delivery (PKR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-text-muted">Rs.</span>
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={minProductPrice}
                        onChange={(e) => sanitizeNumberInput(e.target.value, setMinProductPrice)}
                        disabled={!productPriceRuleActive}
                        className="w-full rounded-lg border border-border bg-navy-light pl-10 pr-4 py-3 text-sm font-bold text-text-primary focus:border-purple/40 focus:outline-none focus:ring-2 focus:ring-purple/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <p className="mt-2 text-[11px] text-text-muted">
                      Individual products priced at or above this amount will automatically get free delivery.
                    </p>
                  </div>

                  {/* Product Price Preview */}
                  {productPriceRuleActive && minProductPrice > 0 && (
                    <div className="rounded-xl bg-green/5 border border-green/15 px-4 py-3">
                      <p className="text-[12px] text-green font-semibold flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5" strokeWidth={2} />
                        Products priced Rs. {minProductPrice.toLocaleString()} or above will get free delivery.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Save Button */}
            <div className="border-t border-border px-6 py-4 flex items-center justify-between">
              <span className="text-[11px] text-text-muted">
                Changes apply to all customers immediately.
              </span>
              <button
                type="button"
                onClick={saveSettings}
                disabled={settingsLoading || settingsSaving}
                className="flex items-center gap-2 rounded-xl rainbow-gradient px-5 py-2.5 text-sm font-bold text-white shadow-premium-brand hover:shadow-lg hover:shadow-purple/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50"
              >
                {settingsSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" strokeWidth={2} />
                )}
                Save Settings
              </button>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-4 rounded-2xl bg-surface border border-border px-5 py-4">
            <h3 className="text-[12px] font-bold text-text-primary mb-2">How it works</h3>
            <ul className="space-y-1.5 text-[11px] text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1 w-1 rounded-full bg-purple shrink-0" />
                Product-level <span className="font-bold text-text-primary">Free Delivery</span> items always get free shipping regardless of this threshold.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1 w-1 rounded-full bg-purple shrink-0" />
                The <span className="font-bold text-text-primary">FREESHIP</span> coupon also provides free shipping independently.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1 w-1 rounded-full bg-purple shrink-0" />
                When multiple free delivery conditions apply, shipping is still Rs. 0 (no double discounts).
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Settings Toast */}
      {settingsToast && (
        <div className="fixed bottom-6 right-6 z-[110] animate-fade-in-up">
          <div
            className={`flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-bold shadow-premium-lg border ${
              settingsToast.type === "success"
                ? "bg-green/10 text-green border-green/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}
          >
            {settingsToast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2} />
            ) : (
              <XCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
            )}
            {settingsToast.text}
          </div>
        </div>
      )}
    </div>
  );
}
