"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
        signal: AbortSignal.timeout(10000),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-navy px-5">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl rainbow-gradient shadow-premium-brand">
                <Lock className="h-7 w-7 text-white" strokeWidth={2} />
              </div>
              <span className="absolute -top-2 -right-2 text-xl animate-float">🧸</span>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary mb-1">Admin Login</h1>
          <p className="text-sm text-text-secondary">ToyVerse Pakistan Dashboard</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-surface border border-border shadow-premium p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-[12px] text-red-400 leading-snug">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  autoComplete="username"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-border bg-surface-light py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-brand/40 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all duration-300 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-border bg-surface-light py-3 pl-10 pr-12 text-sm text-text-primary placeholder:text-text-muted focus:border-brand/40 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all duration-300 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-secondary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white shadow-premium-brand transition-all duration-300 ${
                !isSubmitting
                  ? "rainbow-gradient hover:shadow-lg hover:shadow-purple/20 hover:scale-[1.01] active:scale-[0.99]"
                  : "bg-gray-600 cursor-not-allowed shadow-none"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] text-text-muted">
          Authorized personnel only
        </p>
      </div>
    </div>
  );
}
