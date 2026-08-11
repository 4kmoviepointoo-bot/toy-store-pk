"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-navy px-5">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
            <span className="text-4xl">🧸</span>
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-text-primary mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-text-secondary mb-8">
          We hit a snag while loading this page. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-2xl rainbow-gradient px-6 py-3 text-sm font-bold text-white shadow-premium-brand hover:shadow-lg hover:shadow-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-2xl border border-border bg-surface px-6 py-3 text-sm font-bold text-text-secondary hover:text-brand hover:border-brand/30 transition-all duration-200"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
