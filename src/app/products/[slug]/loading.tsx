export default function ProductLoading() {
  return (
    <div className="min-h-dvh flex flex-col bg-navy">
      {/* Navbar placeholder */}
      <div className="sticky top-0 z-50 bg-navy/90 backdrop-blur-xl border-b border-border/60">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 sm:px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-surface animate-pulse" />
            <div className="h-4 w-24 rounded-lg bg-surface animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-surface animate-pulse" />
            <div className="h-10 w-10 rounded-xl bg-surface animate-pulse" />
          </div>
        </div>
      </div>

      <main className="flex-1">
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-10 py-4 sm:py-8 lg:py-10 overflow-hidden">
          {/* Back button placeholder */}
          <div className="h-10 w-32 rounded-xl bg-surface animate-pulse mb-4 sm:mb-8" />

          {/* Product detail grid */}
          <div className="grid gap-5 sm:gap-6 lg:grid-cols-[1fr_1fr] lg:gap-10 xl:gap-14">
            {/* Image section */}
            <div className="relative">
              <div className="absolute -inset-3 sm:-inset-4 rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-br from-pink/10 via-purple/10 to-blue/10 blur-xl" aria-hidden="true" />
              <div className="relative aspect-square overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem] bg-surface animate-pulse" />
            </div>

            {/* Details section */}
            <div className="flex flex-col gap-4 sm:gap-5 lg:gap-6">
              {/* Badge placeholder */}
              <div>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <div className="h-5 w-16 rounded-lg bg-surface animate-pulse" />
                </div>
                {/* Title placeholder */}
                <div className="space-y-2">
                  <div className="h-6 sm:h-8 w-3/4 rounded-lg bg-surface animate-pulse" />
                  <div className="h-6 sm:h-8 w-1/2 rounded-lg bg-surface animate-pulse" />
                </div>
              </div>

              {/* Rating placeholder */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 w-4 sm:h-5 sm:w-5 rounded bg-surface animate-pulse" />
                  ))}
                </div>
                <div className="h-4 w-8 rounded bg-surface animate-pulse" />
                <div className="h-4 w-16 rounded bg-surface animate-pulse" />
              </div>

              {/* Price placeholder */}
              <div className="rounded-xl sm:rounded-2xl bg-surface border border-border shadow-premium-sm p-4 sm:p-5">
                <div className="flex items-baseline gap-2 sm:gap-3 mb-1">
                  <div className="h-8 sm:h-10 w-28 rounded-lg bg-surface-light animate-pulse" />
                  <div className="h-5 sm:h-6 w-20 rounded bg-surface-light animate-pulse" />
                </div>
                <div className="h-3 w-24 rounded bg-surface-light animate-pulse" />
              </div>

              {/* Description placeholder */}
              <div className="rounded-xl sm:rounded-2xl bg-surface border border-border shadow-premium-sm p-4 sm:p-5 lg:p-6">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-lg bg-surface-light animate-pulse" />
                  <div className="h-4 w-24 rounded bg-surface-light animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 sm:h-4 w-full rounded bg-surface-light animate-pulse" />
                  <div className="h-3 sm:h-4 w-full rounded bg-surface-light animate-pulse" />
                  <div className="h-3 sm:h-4 w-3/4 rounded bg-surface-light animate-pulse" />
                </div>
              </div>

              {/* Quantity placeholder */}
              <div className="rounded-xl sm:rounded-2xl bg-surface border border-border shadow-premium-sm p-4 sm:p-5 lg:p-6">
                <div className="h-4 w-16 rounded bg-surface-light animate-pulse mb-3 sm:mb-4" />
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-surface-light animate-pulse" />
                  <div className="h-6 w-14 rounded bg-surface-light animate-pulse" />
                  <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-surface-light animate-pulse" />
                </div>
              </div>

              {/* Add to Cart button placeholder */}
              <div className="h-14 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-r from-pink/20 via-purple/20 to-blue/20 animate-pulse" />

              {/* Trust badges placeholder */}
              <div className="flex items-center justify-center gap-4 sm:gap-6 pt-1 sm:pt-2">
                <div className="h-3 sm:h-3.5 w-20 sm:w-24 rounded bg-surface animate-pulse" />
                <div className="h-3 sm:h-3.5 w-20 sm:w-24 rounded bg-surface animate-pulse" />
                <div className="h-3 sm:h-3.5 w-16 sm:w-20 rounded bg-surface animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
