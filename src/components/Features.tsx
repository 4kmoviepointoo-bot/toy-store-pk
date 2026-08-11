const features = [
  {
    title: "Cash on Delivery",
    description: "Available across Pakistan",
    iconBg: "bg-gradient-to-br from-yellow/15 to-yellow/5",
    iconColor: "text-yellow",
    hoverBorder: "hover:border-yellow/25",
    Icon: () => (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    title: "Easy Returns",
    description: "7 days return policy",
    iconBg: "bg-gradient-to-br from-brand/15 to-brand/5",
    iconColor: "text-brand",
    hoverBorder: "hover:border-brand/25",
    Icon: () => (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
      </svg>
    ),
  },
  {
    title: "100% Original Toys",
    description: "Top quality guaranteed",
    iconBg: "bg-gradient-to-br from-green/15 to-green/5",
    iconColor: "text-green",
    hoverBorder: "hover:border-green/25",
    Icon: () => (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    title: "Support 24/7",
    description: "We&apos;re here to help",
    iconBg: "bg-gradient-to-br from-cyan/15 to-cyan/5",
    iconColor: "text-cyan",
    hoverBorder: "hover:border-cyan/25",
    Icon: () => (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
];

export function Features() {
  return (
    <section className="relative pt-4 pb-6">
      {/* Top transition: gradient fade from FeaturedToys */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none" aria-hidden="true">
        <div className="h-10 bg-gradient-to-b from-navy/40 to-transparent" />
        <div className="h-px mx-auto max-w-[500px] bg-gradient-to-r from-transparent via-brand/20 to-transparent" />
      </div>
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group flex items-center gap-3.5 rounded-2xl bg-surface border border-border/60 ${feature.hoverBorder} p-4 lg:p-5 transition-all duration-300 hover:shadow-premium hover:-translate-y-0.5`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${feature.iconBg} shadow-sm border border-border/40`}>
                <feature.Icon />
              </div>
              <div>
                <span className="block text-[13px] font-bold text-text-primary">
                  {feature.title}
                </span>
                <span className="block text-[11px] text-text-muted mt-0.5 font-medium">
                  {feature.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
