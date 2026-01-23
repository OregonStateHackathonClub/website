"use client";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Briefcase, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push("/sponsors");
        router.refresh();
      } else {
        setError(data.error || "Invalid password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-sm bg-transparent border-0 shadow-none">
        <CardHeader className="text-center pb-8">
          <div className="w-16 h-16 bg-neutral-800 border border-neutral-700 rounded-none flex items-center justify-center mx-auto mb-6">
            <Briefcase className="h-8 w-8 text-neutral-400" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">
            Sponsor Portal
          </h1>
          <p className="text-sm text-neutral-500">
            Enter the sponsor password to access attendee profiles
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full h-10 px-4 bg-transparent dark:bg-transparent border border-neutral-800 text-white placeholder:text-neutral-600 text-sm focus:outline-none focus:border-neutral-700 rounded-none focus-visible:ring-0"
              />
            </div>

            {error && (
              <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-none">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-white text-black text-sm font-medium flex items-center justify-center hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-none"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Access Portal"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-neutral-600 mt-8">
            Need access?{" "}
            <a
              href="mailto:contact@beaverhacks.org"
              className="text-neutral-400 hover:text-white transition-colors"
            >
              Contact us
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
