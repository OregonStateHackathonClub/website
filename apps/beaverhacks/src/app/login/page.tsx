"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, signUp, useSession } from "@repo/auth/client";
import { Mail, Lock, User, Github, Loader2 } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get("callbackURL") || "/";
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (session?.user && !isPending) {
      router.push("/profile");
    }
  }, [session, isPending, router]);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show loading while checking session
  if (isPending || session?.user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-white animate-spin" />
      </div>
    );
  }

  const handleGitHubSignIn = () => {
    signIn.social({ provider: "github", callbackURL });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "signup") {
      await signUp.email({
        email,
        password,
        name: `${firstName} ${lastName}`.trim(),
        callbackURL,
        fetchOptions: {
          onResponse: () => setLoading(false),
          onSuccess: () => router.push(callbackURL),
          onError: (ctx) => setError(ctx.error.message || "Sign up failed"),
        },
      });
    } else {
      await signIn.email(
        { email, password },
        {
          onResponse: () => setLoading(false),
          onSuccess: () => router.push(callbackURL),
          onError: (ctx) =>
            setError(ctx.error.message || "Invalid credentials"),
        },
      );
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      {/* Auth card */}
      <div className="w-full max-w-sm border border-neutral-800 bg-neutral-950 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-white">
            {mode === "signup" ? "Create an account" : "Sign in"}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {mode === "signup"
              ? "Enter your details below"
              : "Welcome back to BeaverHacks"}
          </p>
        </div>

        <button
          onClick={handleGitHubSignIn}
          type="button"
          className="w-full h-10 border border-neutral-800 bg-transparent text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-neutral-900 transition-colors"
        >
          <Github className="w-4 h-4" />
          Continue with GitHub
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-800" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 text-xs text-neutral-600 bg-neutral-950 uppercase tracking-wide">
              or
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  First name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full h-10 pl-10 pr-3 bg-transparent border border-neutral-800 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  Last name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full h-10 pl-10 pr-3 bg-transparent border border-neutral-800 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full h-10 pl-10 pr-3 bg-transparent border border-neutral-800 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">
              Password
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

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-white text-black text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading
              ? "Loading..."
              : mode === "signup"
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-neutral-500 text-center">
          {mode === "signup" ? (
            <>
              Have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError(null);
                }}
                className="text-white hover:underline"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              No account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className="text-white hover:underline"
              >
                Create one
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
