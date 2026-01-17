"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Card } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { useCart } from "@/lib/cart";

export default function SuccessPage() {
  const { clearCart } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (!cleared.current) {
      clearCart();
      cleared.current = true;
    }
  }, [clearCart]);

  return (
    <div
      className="flex-1 flex items-center justify-center p-6"
      style={{ minHeight: "calc(100vh - 10rem)" }}
    >
      <Card className="p-8 sm:p-12 text-center max-w-md w-full shadow-none gap-0">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
          Order Confirmed
        </h1>
        <p className="text-muted-foreground mb-8">
          Thanks for your preorder! You&apos;ll receive a confirmation email
          shortly.
        </p>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </Link>
        </Button>
      </Card>
    </div>
  );
}
