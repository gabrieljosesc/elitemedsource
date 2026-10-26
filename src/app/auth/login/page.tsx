"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import PasswordField from "@/components/auth/PasswordField";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }

    const next = new URLSearchParams(window.location.search).get("next");
    router.push(next || "/");
    router.refresh();
  }

  return (
    <div className="bg-surface border-b border-line">
      <div className="mx-auto max-w-[440px] px-5 py-14 sm:py-20">
        <div className="bg-card border border-line rounded-3xl shadow-soft px-6 sm:px-8 py-8">
          <p className="eyebrow">Welcome back</p>
          <h1 className="font-display font-bold text-[30px] tracking-tight mt-2 mb-1">Sign in</h1>
          <p className="text-[14px] text-ink-soft mb-6">Access trade pricing, order history, and saved details.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <p className="text-[13px] text-low bg-low-bg border border-low/30 rounded-xl px-3 py-2.5">{error}</p>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-ink">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-line rounded-xl px-3.5 py-2.5 text-[14px] bg-card outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
                placeholder="you@clinic.com"
                autoComplete="email"
              />
            </label>

            <PasswordField
              label="Password"
              value={password}
              onChange={setPassword}
              required
              autoComplete="current-password"
            />
            <Link href="/auth/forgot-password" className="text-[12.5px] text-brand font-medium hover:underline -mt-2 self-end">
              Forgot password?
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand text-white font-medium text-[14.5px] px-6 py-3.5 hover:bg-brand-deep transition-colors mt-2 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        </div>

        <p className="text-[13.5px] text-ink-soft mt-6 text-center">
          No account yet?{" "}
          <Link href="/auth/signup" className="text-brand font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
