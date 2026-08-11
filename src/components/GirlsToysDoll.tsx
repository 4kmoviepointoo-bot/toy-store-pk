"use client";

import { useEffect, useRef, useState } from "react";

export function GirlsToysDoll() {
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
        className={`girls-toys-doll ${visible ? "girls-toys-doll--animate" : ""}`}
        style={{ position: "absolute", bottom: "14%", right: "-50px" }}
      >
        {/* Doll + Dollhouse SVG */}
        <svg width="130" height="80" viewBox="0 0 130 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Dollhouse */}
          <rect x="60" y="10" width="58" height="50" rx="4" fill="#F5D0FE" stroke="#E9D5FF" strokeWidth="1" />
          {/* Roof */}
          <path d="M56 14 L89 0 L122 14" fill="#C084FC" />
          <path d="M60 14 L89 4 L118 14" fill="#D8B4FE" />
          {/* Door */}
          <rect x="80" y="36" width="16" height="24" rx="8 8 0 0" fill="#A855F7" />
          <circle cx="92" cy="48" r="1.5" fill="#FDE68A" />
          {/* Window left */}
          <rect x="66" y="22" width="12" height="10" rx="2" fill="#93C5FD" stroke="#C4B5FD" strokeWidth="0.8" />
          <line x1="72" y1="22" x2="72" y2="32" stroke="#C4B5FD" strokeWidth="0.5" />
          <line x1="66" y1="27" x2="78" y2="27" stroke="#C4B5FD" strokeWidth="0.5" />
          {/* Window right */}
          <rect x="96" y="22" width="12" height="10" rx="2" fill="#93C5FD" stroke="#C4B5FD" strokeWidth="0.8" />
          <line x1="102" y1="22" x2="102" y2="32" stroke="#C4B5FD" strokeWidth="0.5" />
          <line x1="96" y1="27" x2="108" y2="27" stroke="#C4B5FD" strokeWidth="0.5" />
          {/* Heart on house */}
          <path d="M87 16 C87 14, 84 12, 84 14 C84 12, 81 14, 81 16 C81 19, 84 21, 84 21 C84 21, 87 19, 87 16Z" fill="#F472B6" opacity="0.7" />

          {/* Doll - positioned to the left of the house */}
          <g transform="translate(10, 8)">
            {/* Dress */}
            <path d="M18 34 L10 60 L26 60 Z" fill="#F472B6" />
            <path d="M14 44 L22 44" stroke="#EC4899" strokeWidth="0.8" opacity="0.5" />
            {/* Body */}
            <rect x="14" y="24" width="8" height="12" rx="2" fill="#FDE68A" />
            {/* Head */}
            <circle cx="18" cy="18" r="8" fill="#FDE68A" />
            {/* Hair */}
            <path d="M10 18 C10 10, 26 10, 26 18" fill="#92400E" />
            <path d="M10 18 C10 14, 12 11, 14 10" stroke="#78350F" strokeWidth="1" fill="none" />
            <path d="M26 18 C26 14, 24 11, 22 10" stroke="#78350F" strokeWidth="1" fill="none" />
            {/* Eyes */}
            <circle cx="15" cy="18" r="1.2" fill="#1E293B" />
            <circle cx="21" cy="18" r="1.2" fill="#1E293B" />
            <circle cx="15.4" cy="17.5" r="0.4" fill="white" />
            <circle cx="21.4" cy="17.5" r="0.4" fill="white" />
            {/* Smile */}
            <path d="M16 21 Q18 23, 20 21" stroke="#F472B6" strokeWidth="0.8" fill="none" strokeLinecap="round" />
            {/* Blush */}
            <ellipse cx="13" cy="20" rx="1.5" ry="0.8" fill="#F9A8D4" opacity="0.5" />
            <ellipse cx="23" cy="20" rx="1.5" ry="0.8" fill="#F9A8D4" opacity="0.5" />
            {/* Arms */}
            <line x1="14" y1="28" x2="8" y2="34" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="22" y1="28" x2="28" y2="34" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />
            {/* Bow */}
            <path d="M14 10 C12 8, 10 10, 12 12 L18 12 C16 10, 18 8, 14 10Z" fill="#EC4899" />
            <circle cx="15" cy="11" r="1" fill="#DB2777" />
            {/* Legs */}
            <line x1="15" y1="60" x2="14" y2="68" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
            <line x1="21" y1="60" x2="22" y2="68" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
            {/* Shoes */}
            <ellipse cx="13" cy="69" rx="3" ry="1.5" fill="#EC4899" />
            <ellipse cx="23" cy="69" rx="3" ry="1.5" fill="#EC4899" />
          </g>

          {/* Small sparkles around */}
          <circle cx="6" cy="4" r="1.5" fill="#FBBF24" opacity="0.7" />
          <circle cx="124" cy="6" r="1" fill="#F472B6" opacity="0.6" />
          <circle cx="56" cy="2" r="1.2" fill="#C084FC" opacity="0.5" />
          <circle cx="4" cy="72" r="1" fill="#F472B6" opacity="0.5" />
        </svg>
      </div>
    </div>
  );
}
