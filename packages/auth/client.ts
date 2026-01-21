import { createAuthClient } from "better-auth/react";

const authURL = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000";

export const authClient = createAuthClient({
<<<<<<< HEAD
  baseURL: process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL}`
    : process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000",
=======
  baseURL: authURL,
>>>>>>> 5c5a3708e9910196b6df2b0242f0e064ab4bb3dd
});

export const { signIn, signOut, signUp, useSession } = authClient;

export function redirectToLogin(callbackURL?: string) {
  const url = new URL("/login", authURL);
  if (callbackURL) {
    url.searchParams.set("callbackURL", callbackURL);
  } else if (typeof window !== "undefined") {
    url.searchParams.set("callbackURL", window.location.href);
  }
  window.location.href = url.toString();
}
