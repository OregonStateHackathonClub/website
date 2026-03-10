import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { VT323, IBM_Plex_Mono } from "next/font/google";

import "@repo/ui/globals.css";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BeaverHacks",
  description: "BeaverHacks - Hackathon Club @ OSU",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${vt323.variable} ${ibmPlexMono.variable}`}
    >
      <body className="font-bh-secondary">
        {children}
        <a
          id="mlh-trust-badge"
          className="fixed right-4 top-0 z-10000 block w-[50px] md:w-[65px] opacity-60 hover:opacity-100 transition-opacity drop-shadow-[0_0_8px_rgba(255,170,0,0.3)]"
          href="https://www.mlh.com/seasons/2026/events"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/mlh-trust-badge.svg"
            alt="Major League Hacking 2026 Hackathon Season"
            className="w-full"
          />
        </a>
        <Analytics />
      </body>
    </html>
  );
}
