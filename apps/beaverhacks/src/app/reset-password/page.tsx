"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@repo/auth/client";
import { Lock, Loader2 } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="w-full max-w-sm border border-neutral-800 bg-neutral-950 p-8 text-center">
          <h1 className="text-xl font-semibold text-white mb-4">
            Invalid link
          </h1>
          <p className="text-sm text-neutral-500 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-sm text-white hover:underline"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="w-full max-w-sm border border-neutral-800 bg-neutral-950 p-8 text-center">
          <h1 className="text-xl font-semibold text-white mb-4">
            Password updated
          </h1>
          <p className="text-sm text-neutral-500 mb-6">
            Your password has been reset successfully.
          </p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full h-10 bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    await resetPassword(
      { newPassword: password, token },
      {
        onResponse: () => setLoading(false),
        onSuccess: () => setSuccess(true),
        onError: (ctx) =>
          setError(ctx.error.message || "Failed to reset password"),
      },
    );
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm border border-neutral-800 bg-neutral-950 p-8">
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-white">
            Set new password
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              New password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-10 pl-10 pr-3 bg-transparent border border-neutral-800 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-10 pl-10 pr-3 bg-transparent border border-neutral-800 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-white text-black text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Loading..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
