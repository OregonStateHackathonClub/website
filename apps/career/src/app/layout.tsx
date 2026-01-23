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
        <div className="min-h-screen">{children}</div>
        <Toaster theme="dark" />
      </body>
    </html>
  );
}
