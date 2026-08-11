const brands = [
  { name: "LEGO", color: "#D01012", bg: "bg-red-50" },
  { name: "Barbie", color: "#E91E8C", bg: "bg-pink-50" },
  { name: "Hot Wheels", color: "#FF6B00", bg: "bg-orange-50" },
  { name: "Fisher-Price", color: "#E31837", bg: "bg-red-50" },
  { name: "NERF", color: "#FF6B00", bg: "bg-orange-50" },
  { name: "PAW Patrol", color: "#0066CC", bg: "bg-blue-50" },
  { name: "Play-Doh", color: "#E31837", bg: "bg-red-50" },
  { name: "Spin Master", color: "#00A651", bg: "bg-green-50" },
];

export function TopBrands() {
  return (
    <section className="py-10 lg:py-14">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="rounded-3xl bg-white border border-gray-100 p-6 sm:p-8 lg:p-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-navy">
                Top Brands
              </h2>
              <p className="text-sm text-text-secondary mt-1">You Love</p>
              <div className="mt-2 h-1 w-10 rounded-full bg-brand" />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Previous"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-text-secondary hover:border-brand hover:text-brand hover:bg-brand-light transition-all"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Next"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-text-secondary hover:border-brand hover:text-brand hover:bg-brand-light transition-all"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Brand logos row */}
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
            {brands.map((brand) => (
              <a
                key={brand.name}
                href={`/brands/${brand.name.toLowerCase().replace(/\s+/g, "-")}`}
                className={`flex h-20 w-32 shrink-0 items-center justify-center rounded-2xl ${brand.bg} border border-gray-100 transition-all hover:shadow-md hover:scale-105`}
              >
                <span
                  className="text-lg font-extrabold tracking-tight"
                  style={{ color: brand.color }}
                >
                  {brand.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
