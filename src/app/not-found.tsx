import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-navy px-5">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-light border border-purple/15">
            <span className="text-4xl">🧸</span>
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-text-primary mb-2">
          Page Not Found
        </h1>
        <p className="text-sm text-text-secondary mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-2xl rainbow-gradient px-8 py-3.5 text-sm font-bold text-white shadow-premium-brand hover:shadow-lg hover:shadow-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
