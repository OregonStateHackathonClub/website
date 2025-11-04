import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { GeistSans } from "@repo/ui/fonts";

import "@repo/ui/globals.css";

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
    <html lang="en" className="dark">
      <body className={`${GeistSans.className}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
