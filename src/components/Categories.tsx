import { Car, Baby } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BoysToysCar } from "./BoysToysCar";
import { GirlsToysDoll } from "./GirlsToysDoll";

const categories = [
  {
    title: "Boys Toys",
    description: "Action, Cars, Robots & More",
    href: "/shop?search=boys",
    iconBg: "bg-gradient-to-br from-brand to-green",
    iconColor: "text-white",
    cardBg: "bg-gradient-to-br from-[#0e2f2b] to-[#123d37]",
    hoverBorder: "hover:border-brand/30",
    linkColor: "text-brand hover:bg-brand/15",
    image: "/boys-toys.png",
    Icon: Car,
  },
  {
    title: "Girls Toys",
    description: "Dolls, Kitchen Sets & More",
    href: "/shop?search=girls",
    iconBg: "bg-gradient-to-br from-green to-cyan",
    iconColor: "text-white",
    cardBg: "bg-gradient-to-br from-[#0e2f2b] to-[#0e3832]",
    hoverBorder: "hover:border-green/30",
    linkColor: "text-green hover:bg-green/15",
    image: "/girls-toys.png",
    Icon: Baby,
  },
];

export function Categories() {
  return (
    <section className="relative pt-10 pb-4 lg:pt-14 lg:pb-6">
      {/* Top transition: gradient fade from Hero */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none" aria-hidden="true">
        <div className="h-16 bg-gradient-to-b from-navy/50 to-transparent" />
        <div className="h-px mx-auto max-w-[600px] bg-gradient-to-r from-transparent via-brand/20 to-transparent" />
        <svg className="absolute top-8 left-[15%] h-4 w-4 text-brand/30 animate-sparkle" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <svg className="absolute top-12 right-[20%] h-3 w-3 text-green/25 animate-sparkle [animation-delay:0.7s]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2">
          {categories.map((cat, index) => (
            <Link
              key={cat.title}
              href={cat.href}
              className={`group relative overflow-hidden rounded-[1.75rem] ${cat.cardBg} border border-border/40 ${cat.hoverBorder} p-6 sm:p-7 transition-all duration-500 hover:shadow-premium-lg hover:-translate-y-1 cursor-pointer`}
            >
              {index === 0 && <BoysToysCar />}
              {index === 1 && <GirlsToysDoll />}
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                {/* Left content */}
                <div className="flex flex-col gap-2.5 sm:gap-3 z-10 min-w-0">
                  <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl ${cat.iconBg} shadow-md`}>
                    <cat.Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${cat.iconColor}`} strokeWidth={2.2} />
                  </div>
                  <h3 className="text-[1.35rem] sm:text-[1.65rem] font-extrabold text-text-primary leading-tight">
                    {cat.title}
                  </h3>
                  <p className="text-[12px] sm:text-[13px] text-text-secondary max-w-[150px] sm:max-w-[180px] leading-relaxed">
                    {cat.description}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 mt-1 sm:mt-2 rounded-xl border border-border/60 bg-surface/60 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${cat.linkColor} transition-all duration-300 w-fit shadow-premium-sm hover:shadow-premium`}
                  >
                    Explore Now
                    <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </span>
                </div>

                {/* Right image */}
                <div className="relative h-32 w-32 shrink-0 sm:h-40 sm:w-48 md:h-44 md:w-56 overflow-hidden rounded-2xl shadow-premium-sm border border-border/40">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    sizes="(max-width: 640px) 128px, (max-width: 768px) 192px, 224px"
                    quality={75}
                    priority={index === 0}
                    className="img-zoom object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom transition: gradient fade to FeaturedToys */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" aria-hidden="true">
        <div className="h-px mx-auto max-w-[600px] bg-gradient-to-r from-transparent via-brand/20 to-transparent" />
        <div className="h-12 bg-gradient-to-b from-transparent to-navy/30" />
      </div>
    </section>
  );
}
