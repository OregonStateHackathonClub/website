import { prisma } from "@repo/database";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    "https://*.beaverhacks.org",
    "https://beaverhacks.org",
    "http://localhost:*",
  ],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain:
        process.env.NODE_ENV === "production" ? ".beaverhacks.org" : undefined,
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    magicLink({
      expiresIn: 60 * 60 * 24, // 24 hours
      sendMagicLink: async ({ email, url }) => {
        await resend.emails.send({
          from: "BeaverHacks <info@beaverhacks.org>",
          to: email,
          subject: "Your BeaverHacks Judging Portal Access",
          html: `
            <!DOCTYPE html>
            <html>
              <body style="font-family: system-ui, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #f97316;">BeaverHacks Judging Portal</h1>
                <p>You've been invited to judge at BeaverHacks!</p>
                <p>Click the button below to access your judging portal:</p>
                <a href="${url}" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                  Access Judging Portal
                </a>
                <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
                <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
              </body>
            </html>
          `,
        });
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;

export { getSessionCookie } from "better-auth/cookies";
// Re-export for Next.js API routes
export { toNextJsHandler } from "better-auth/next-js";
