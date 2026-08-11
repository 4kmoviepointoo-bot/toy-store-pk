"use client";

import { useEffect, useRef, useState } from "react";

export function BoysToysCar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      <div
        className={`boys-toys-car ${visible ? "boys-toys-car--animate" : ""}`}
        style={{ position: "absolute", bottom: "18%", left: "-60px" }}
      >
        {/* Toy Car SVG */}
        <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Car body */}
          <rect x="10" y="20" width="80" height="28" rx="8" fill="#EF4444" />
          {/* Roof */}
          <path d="M30 20 L42 6 L68 6 L80 20" fill="#DC2626" />
          {/* Windows */}
          <path d="M44 8 L36 20 L54 20 L54 8Z" fill="#93C5FD" opacity="0.9" />
          <path d="M56 8 L56 20 L74 20 L66 8Z" fill="#93C5FD" opacity="0.9" />
          {/* Hood */}
          <rect x="80" y="26" width="28" height="16" rx="4" fill="#F87171" />
          {/* Headlight */}
          <circle cx="108" cy="32" r="3" fill="#FDE68A" />
          {/* Bumper */}
          <rect x="8" y="42" width="100" height="4" rx="2" fill="#B91C1C" />
          {/* Rear wheel */}
          <circle cx="30" cy="48" r="10" fill="#1E293B" />
          <circle cx="30" cy="48" r="5" fill="#64748B" />
          <circle cx="30" cy="48" r="2" fill="#CBD5E1" />
          {/* Front wheel */}
          <circle cx="82" cy="48" r="10" fill="#1E293B" />
          <circle cx="82" cy="48" r="5" fill="#64748B" />
          <circle cx="82" cy="48" r="2" fill="#CBD5E1" />
          {/* Racing stripe */}
          <rect x="15" y="30" width="70" height="3" rx="1.5" fill="#FBBF24" opacity="0.7" />
          {/* Spoiler */}
          <rect x="8" y="16" width="8" height="6" rx="2" fill="#B91C1C" />
        </svg>
      </div>
    </div>
  );
}
