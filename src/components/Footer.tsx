import { Heart } from "lucide-react";

const paymentMethods = [
  { name: "Cash on Delivery", icon: "💵" },
  { name: "JazzCash", icon: "📱" },
  { name: "Easypaisa", icon: "💳" },
  { name: "Bank Transfer", icon: "🏦" },
];

export function Footer() {
  return (
    <footer className="relative bg-navy-light border-t border-border/40">
      {/* Subtle gradient accent at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent" />

      {/* Main Footer Content */}
      <div className="mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="min-w-0">
            <a href="/" className="inline-flex items-center gap-2.5 group">
              <span className="text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]">
                🧸
              </span>
              <div className="leading-none">
                <span className="block text-[22px] font-extrabold tracking-tight rainbow-text">
                  ToyVerse
                </span>
                <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-text-muted mt-0.5">
                  Pakistan
                </span>
              </div>
            </a>
            <p className="mt-4 text-sm text-text-secondary leading-relaxed max-w-full">
              Pakistan&apos;s favorite toy store. Discover safe, fun, and premium toys that spark creativity and endless joy for every child.
            </p>
          </div>

          {/* Payment Methods */}
          <div className="min-w-0">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
              Payment Methods
            </h4>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <span
                  key={method.name}
                  className="payment-badge inline-flex items-center gap-1.5 rounded-lg bg-surface border border-border/40 px-2.5 py-1.5 text-[11px] font-medium text-text-secondary"
                >
                  <span className="shrink-0">{method.icon}</span>
                  <span className="whitespace-nowrap">{method.name}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/40">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-[11px] sm:text-xs text-text-muted text-center sm:text-left leading-relaxed">
              © {new Date().getFullYear()} ToyVerse Pakistan. All rights reserved.
            </p>
            <p className="flex items-center gap-1.5 text-[11px] sm:text-xs text-text-muted whitespace-nowrap">
              Made with <Heart className="h-3 w-3 text-brand fill-brand shrink-0" /> in Pakistan
            </p>
          </div>
        </div>
      </div>

      {/* Decorative sparkle */}
      <div className="hidden sm:block absolute top-8 right-[10%] pointer-events-none" aria-hidden="true">
        <svg className="h-4 w-4 text-brand/20 animate-sparkle" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
    </footer>
  );
}
