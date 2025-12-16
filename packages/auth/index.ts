import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@repo/database";

// Lazy initialization to avoid requiring env vars at build time
let _auth: ReturnType<typeof betterAuth> | null = null;

function getAuth() {
  if (_auth) return _auth;

  // --- Environment Variable Validation ---
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!githubClientId || !githubClientSecret) {
    throw new Error(
      "Missing GitHub OAuth credentials in .env.local or deployment environment",
    );
  }
  // ------------------------------------

  _auth = betterAuth({
    socialProviders: {
      github: {
        clientId: githubClientId,
        clientSecret: githubClientSecret,
      },
    },
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    emailAndPassword: {
      enabled: true,
    },
  });

  return _auth;
}

export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
  get(target, prop) {
    return getAuth()[prop as keyof ReturnType<typeof betterAuth>];
  },
});

export type Session = typeof auth.$Infer.Session;

// Re-export for Next.js API routes
export { toNextJsHandler } from "better-auth/next-js";
export { getSessionCookie } from "better-auth/cookies"
