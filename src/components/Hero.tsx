import { ShieldCheck, Truck, Award } from "lucide-react";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy">
      {/* Emerald decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -right-24 -top-16 h-96 w-96 rounded-full bg-brand/15 blur-[80px]" />
        <div className="absolute -bottom-16 left-1/5 h-80 w-80 rounded-full bg-green/12 blur-[70px]" />
        <div className="absolute top-1/4 left-0 h-64 w-64 rounded-full bg-cyan/12 blur-[60px]" />
        <div className="absolute bottom-1/4 right-1/3 h-48 w-48 rounded-full bg-yellow/10 blur-[50px]" />

        {/* Decorative dots */}
        <div className="absolute top-20 left-8 h-3 w-3 rounded-full bg-brand animate-glow-pulse" />
        <div className="absolute top-36 right-[28%] h-2.5 w-2.5 rounded-full bg-green animate-glow-pulse [animation-delay:0.3s]" />
        <div className="absolute bottom-36 right-20 h-2.5 w-2.5 rounded-full bg-cyan animate-glow-pulse [animation-delay:0.6s]" />
        <div className="absolute top-1/2 left-[18%] h-2 w-2 rounded-full bg-yellow animate-glow-pulse [animation-delay:0.9s]" />

        {/* Star decorations */}
        <svg className="absolute top-14 left-[28%] h-7 w-7 text-brand/50 animate-sparkle" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <svg className="absolute top-40 right-[18%] h-5 w-5 text-green/45 animate-sparkle [animation-delay:0.8s]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <svg className="absolute bottom-40 left-16 h-6 w-6 text-cyan/40 animate-sparkle [animation-delay:1.2s]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <svg className="absolute top-60 left-[40%] h-4 w-4 text-yellow/50 animate-sparkle [animation-delay:1.5s]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 pt-10 pb-4 sm:pt-12 sm:pb-6 lg:grid-cols-2 lg:gap-6 lg:pt-16 lg:pb-6">
          {/* Left — Copy */}
          <div className="flex flex-col gap-5 sm:gap-6">
            {/* Pill badge */}
            <div className="animate-fade-in-up inline-flex w-fit items-center gap-2 rounded-full bg-brand/10 px-4 py-1.5 border border-brand/20">
              <span className="text-sm">⭐</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand">
                Pakistan&apos;s Favorite Toy Store
              </span>
            </div>

            <h1 className="animate-fade-in-up-delay-1 text-[2rem] font-extrabold tracking-tight text-text-primary sm:text-5xl lg:text-[3.4rem] xl:text-[4rem] leading-[1.08]">
              Where Imagination
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-green to-cyan">
                Comes to Life!
              </span>
            </h1>

            <p className="animate-fade-in-up-delay-2 max-w-md text-[15px] leading-relaxed text-text-secondary sm:text-base">
              Discover the best toys for every age. Safe, fun and
              designed to spark creativity and endless joy.
            </p>

            {/* Feature badges */}
            <div className="animate-fade-in-up-delay-3 flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
              <div className="flex items-center gap-2 sm:gap-2.5 rounded-2xl bg-surface px-3 sm:px-4 py-2.5 sm:py-3 shadow-premium-sm border border-border/80 hover:shadow-premium hover:border-brand/20 transition-all duration-300">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-brand/15">
                  <ShieldCheck className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-brand" strokeWidth={2} />
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-text-primary">100% Safe Toys</span>
                  <span className="block text-[10px] text-text-muted font-medium">Child Safe Materials</span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-2.5 rounded-2xl bg-surface px-3 sm:px-4 py-2.5 sm:py-3 shadow-premium-sm border border-border/80 hover:shadow-premium hover:border-cyan/20 transition-all duration-300">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-cyan/15">
                  <Truck className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-cyan" strokeWidth={2} />
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-text-primary">Fast Delivery</span>
                  <span className="block text-[10px] text-text-muted font-medium">Across Pakistan</span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-2.5 rounded-2xl bg-surface px-3 sm:px-4 py-2.5 sm:py-3 shadow-premium-sm border border-border/80 hover:shadow-premium hover:border-yellow/20 transition-all duration-300">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-yellow/15">
                  <Award className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-yellow" strokeWidth={2} />
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-text-primary">Top Quality</span>
                  <span className="block text-[10px] text-text-muted font-medium">Best Brands Guarantee</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="animate-fade-in-up-delay-4 flex flex-col gap-3 sm:flex-row sm:items-center pt-2">
              <a
                href="/shop"
                className="group/btn inline-flex h-12 sm:h-13 items-center justify-center gap-2 sm:gap-2.5 rounded-2xl rainbow-gradient px-6 sm:px-8 text-[13px] sm:text-sm font-bold text-white shadow-premium-brand transition-all duration-300 hover:shadow-xl hover:shadow-brand/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                Shop Now
                <svg className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right — Hero Visual */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-[280px] sm:max-w-[360px] lg:max-w-[520px] aspect-square">
              {/* Background circles */}
              <div className="absolute inset-6 rounded-full bg-gradient-to-br from-brand/15 via-green/10 to-cyan/12 animate-float" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow/10 via-brand/6 to-blue/10" />

              {/* Hero image */}
              <div className="relative z-10 h-full w-full rounded-[2rem] overflow-hidden shadow-premium-lg border-2 border-border/40">
                <Image
                  src="/hero-banner.png"
                  alt="Premium toy collection at ToyVerse Pakistan — teddy bears, cars, robots, blocks, and more"
                  fill
                  sizes="(max-width: 640px) 280px, (max-width: 1024px) 360px, 520px"
                  priority
                  quality={85}
                  className="object-cover"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/20 to-transparent pointer-events-none" />
              </div>

              {/* Floating price badge */}
              <div className="absolute -right-2 sm:-right-3 top-6 sm:top-8 z-20 rounded-2xl bg-surface/95 backdrop-blur-sm px-3.5 sm:px-5 py-2.5 sm:py-3.5 shadow-premium-lg border border-brand/15 animate-fade-in-up-delay-2">
                <span className="block text-[9px] sm:text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                  Starting from
                </span>
                <span className="block text-lg sm:text-xl font-extrabold mt-0.5 text-transparent bg-clip-text bg-gradient-to-r from-brand to-green">
                  Rs. 999
                </span>
              </div>

              {/* Floating delivery badge */}
              <div className="absolute -bottom-2 sm:-bottom-3 -left-2 sm:-left-3 z-20 rounded-2xl rainbow-gradient px-3.5 sm:px-5 py-2.5 sm:py-3.5 shadow-premium-lg animate-fade-in-up-delay-3">
                <span className="block text-[9px] sm:text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                  Free Delivery
                </span>
                <span className="block text-xs sm:text-sm font-bold text-white mt-0.5">
                  Across Pakistan
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
