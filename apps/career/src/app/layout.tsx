import { GeistSans } from "@repo/ui/fonts";
import type { Metadata } from "next";
import { Toaster } from "sonner";

import "@repo/ui/globals.css";

export const metadata: Metadata = {
  title: "BeaverHacks Sponsors",
  description: "BeaverHacks Sponsor Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.className} bg-black text-white`}>
        <div className="min-h-screen relative overflow-hidden">
          {/* Background elements */}
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900/50 via-black to-black" />
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-neutral-800/20 to-transparent rounded-full blur-3xl" />

          {/* Subtle grid */}
          <div
            className="fixed inset-0 opacity-[0.015] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />

          <div className="relative z-10">{children}</div>
        </div>
        <Toaster theme="dark" />
      </body>
    </html>
  );
}
