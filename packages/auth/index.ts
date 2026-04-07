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
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: "BeaverHacks <info@beaverhacks.org>",
        to: user.email,
        subject: "BeaverHacks — Reset Your Password",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Inter', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background-color: #18181b; padding: 48px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Reset Your Password
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #18181b; font-size: 16px; line-height: 1.6;">
                Hey ${user.name || "there"},
              </p>
              <p style="margin: 0 0 20px; color: #18181b; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password. Click the link below to set a new one:
              </p>
              <p style="margin: 0 0 28px; color: #18181b; font-size: 16px; line-height: 1.6;">
                <a href="${url}" target="_blank" style="color: #F97316; text-decoration: underline;">Reset your password</a>
              </p>
              <p style="margin: 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #fafafa; padding: 24px 40px; border-top: 1px solid #e4e4e7; text-align: center;">
              <p style="margin: 0; color: #a1a1aa; font-size: 13px; line-height: 1.5;">
                BeaverHacks &mdash; Hackathon Club at Oregon State University
              </p>
              <p style="margin: 4px 0 0; color: #a1a1aa; font-size: 13px;">
                <a href="mailto:team@beaverhacks.org" style="color: #F97316; text-decoration: none;">team@beaverhacks.org</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
      });
    },
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
