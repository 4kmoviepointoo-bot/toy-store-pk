"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/", icon: "🏠", cocomelonIcon: "🧸" },
  { label: "Categories", href: "/shop", icon: "📂" },
  { label: "Best Sellers", href: "/shop?sort=popular", icon: "⭐" },
  { label: "New Arrivals", href: "/shop?sort=newest", icon: "🆕" },
  { label: "Toys & Games", href: "/shop?category=Action+Figures", icon: "🎮" },
  { label: "Learning & Edu", href: "/shop?category=Educational+Toys", icon: "📚" },
  { label: "Outdoor Play", href: "/shop?category=Outdoor+%26+Sports", icon: "🌳" },
  { label: "Deals & Offers", href: "/shop?onSale=true", icon: "🏷️" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [threshold, setThreshold] = useState(2500);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/settings", { signal: controller.signal })
      .then((res) => res.json())
      .then((resData) => {
        const data = resData.data || resData;
        if (data.freeDeliveryThreshold !== undefined) {
          setThreshold(data.freeDeliveryThreshold);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return (
    <aside className="hidden lg:flex flex-col w-[220px] h-screen fixed left-0 top-0 bg-navy-light border-r border-border/60 z-40">
      {/* Branding */}
      <div className="px-5 pt-6 pb-5">
        <a href="/" className="flex items-center gap-2.5 group">
          <span className="text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]">
            🧸
          </span>
          <div className="leading-none">
            <span className="block text-[20px] font-extrabold tracking-tight rainbow-text">
              ToyVerse
            </span>
            <span className="block text-[8px] font-bold uppercase tracking-[0.2em] text-text-muted mt-0.5">
              Pakistan
            </span>
          </div>
        </a>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-gradient-to-r from-border/60 via-border/30 to-transparent" />

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? "bg-brand/15 text-brand border border-brand/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-light/50"
              }`}
            >
              <span className="text-base leading-none">{item.cocomelonIcon || item.icon}</span>
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Free Delivery Banner */}
      <div className="mx-3 mb-4">
        <div className="rounded-2xl bg-[#0e332e] border border-[#1a524a] p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/20">
              <span className="text-lg">🚚</span>
            </div>
            <span className="text-sm font-bold text-text-primary">Free Delivery</span>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            On orders above{" "}
            <span className="font-bold text-brand">Rs. {threshold.toLocaleString()}</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
