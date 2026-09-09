"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token") ?? "";

  const [password,   setPassword]   = useState("");
  const [confirm,    setConfirm]    = useState("");
  const [showPw,     setShowPw]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState("");

  // Live validation
  const tooShort    = password.length > 0 && password.length < 8;
  const mismatch    = confirm.length > 0 && password !== confirm;
  const canSubmit   = password.length >= 8 && password === confirm && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setSuccess(true);
      // Redirect to login after 2s
      setTimeout(() => router.push("/auth/login"), 2000);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-3">
        <XCircle className="h-12 w-12 text-red-400 mx-auto" />
        <h2 className="font-display text-xl font-bold text-neutral-900">Invalid link</h2>
        <p className="text-sm text-neutral-500">This reset link is missing or malformed.</p>
        <Link href="/auth/forgot-password" className="text-sm text-primary font-medium hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-2">
          <CheckCircle className="h-7 w-7 text-primary" />
        </div>
        <h2 className="font-display text-xl font-bold text-neutral-900">Password updated</h2>
        <p className="text-sm text-neutral-500">
          Your password has been changed. Redirecting you to sign in…
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold text-neutral-900 mb-1">
          Choose a new password
        </h2>
        <p className="text-sm text-neutral-500">Must be at least 8 characters.</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
          {error.includes("expired") && (
            <Link
              href="/auth/forgot-password"
              className="text-xs text-red-500 font-medium hover:underline mt-1 block"
            >
              Request a new reset link →
            </Link>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New password */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            New password
          </label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Min. 8 characters"
              className={`w-full pr-10 pl-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors ${
                tooShort ? "border-red-300 focus:border-red-400" : "border-neutral-200 focus:border-primary"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {tooShort && (
            <p className="text-xs text-red-500 mt-1">At least 8 characters required.</p>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Confirm password
          </label>
          <input
            type={showPw ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            placeholder="Repeat your password"
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors ${
              mismatch ? "border-red-300 focus:border-red-400" : "border-neutral-200 focus:border-primary"
            }`}
          />
          {mismatch && (
            <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="animate-fade-up">
        <div className="bg-white rounded-2xl border border-neutral-200 p-8">
          {/* Suspense needed because useSearchParams() requires it in Next.js 14 */}
          <Suspense fallback={<p className="text-sm text-neutral-400 text-center">Loading…</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
=    </div>
  );
}