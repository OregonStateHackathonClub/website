import { GeistSans } from "@repo/ui/fonts";
import type { Metadata } from "next";

import "@repo/ui/globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "BeaverHacks Admin",
  description: "BeaverHacks Administration Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${GeistSans.className} min-h-screen bg-neutral-950 text-neutral-200`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
