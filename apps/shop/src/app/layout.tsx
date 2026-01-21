import type { Metadata } from "next";
import { GeistSans } from "@repo/ui/fonts";
import { GeistMono } from "@repo/ui/fonts";

import "@repo/ui/globals.css";

import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "BeaverHacks Shop",
  description: "Official BeaverHacks merchandise. Limited quantities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-muted/30">
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
