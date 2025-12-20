import { GeistSans } from "@repo/ui/fonts";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

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
  const isMaintenanceMode = true;

  if (isMaintenanceMode) {
    return (
      <html lang="en" className="dark">
        <body className={`${GeistSans.className}`}>
          <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4">
            <div className="max-w-2xl text-center space-y-6">
              <div className="flex justify-center mb-8">
                <Image
                  width={1368}
                  height={1368}
                  src="/logo-transparent.png"
                  alt="BeaverHacks Logo"
                  className="h-32 w-auto invert"
                />
              </div>
              <h2 className="text-4xl font-bold">Under Maintenance</h2>
              <p className="text-xl text-muted-foreground">
                We&apos;re currently performing maintenance to improve your
                experience.
              </p>
              <p className="text-lg text-muted-foreground">
                Please check back soon!
              </p>
              <div className="flex items-center justify-center gap-6 mt-8">
                <Link
                  href="https://instagram.com/beaverhacks"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Instagram"
                >
                  <Image
                    src="/images/instagram.svg"
                    width={24}
                    height={24}
                    alt="Instagram logo"
                    className="w-6 h-6"
                  />
                </Link>
                <Link
                  href="https://youtube.com/@osubeaverhacks"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="YouTube"
                >
                  <Image
                    src="/images/youtube.svg"
                    width={28}
                    height={28}
                    alt="Youtube logo"
                    className="w-7 h-7"
                  />
                </Link>
                <Link
                  href="https://discord.gg/vuepffJxub"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Discord"
                >
                  <Image
                    src="/images/discord.svg"
                    width={28}
                    height={28}
                    alt="Discord logo"
                    className="w-7 h-7"
                  />
                </Link>
              </div>
            </div>
          </div>
          <Analytics />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.className}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
