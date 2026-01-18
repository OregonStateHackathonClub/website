import { createAuthClient } from "better-auth/react";

const authURL = process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: authURL,
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
