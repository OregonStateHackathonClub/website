"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useSession, redirectToLogin } from "@repo/auth/client";
import { Card } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { useCart } from "@/lib/cart";
import { MAX_CART_ITEMS } from "@/lib/constants";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } =
    useCart();
  const { data: session, isPending: isSessionLoading } = useSession();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!session?.user) {
      redirectToLogin();
      return;
    }

    setIsCheckingOut(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            stripePriceId: item.stripePriceId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("Failed to create checkout. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to create checkout. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div
        className="flex-1 flex items-center justify-center p-6"
        style={{ minHeight: "calc(100vh - 10rem)" }}
      >
        <Card className="p-8 sm:p-12 text-center max-w-md w-full shadow-none gap-0">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
            Your Cart is Empty
          </h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven&apos;t added anything yet.
          </p>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Your Cart</h1>
          <Button
            variant="ghost"
            asChild
            size="sm"
            className="text-muted-foreground"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-3 space-y-3">
            {items.map((item) => (
              <Card
                key={`${item.productId}-${item.variantId}`}
                className="p-4 sm:p-6 shadow-none gap-0"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 relative bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h3 className="font-medium truncate">{item.name}</h3>
                        {item.variantName && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {item.variantName}
                          </p>
                        )}
                      </div>
                      <p className="font-medium whitespace-nowrap">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity - 1,
                              item.variantId,
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-10 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity + 1,
                              item.variantId,
                            )
                          }
                          disabled={totalItems >= MAX_CART_ITEMS}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          removeFromCart(item.productId, item.variantId)
                        }
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Remove</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card className="p-5 lg:sticky lg:top-20 shadow-none gap-0">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"}
                    )
                  </span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-border my-4" />

              <div className="flex justify-between text-lg font-semibold mb-6">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={isCheckingOut || isSessionLoading}
                className="w-full"
              >
                {isCheckingOut
                  ? "Processing..."
                  : session?.user
                    ? "Checkout"
                    : "Sign in to Checkout"}
              </Button>

              {!session?.user && !isSessionLoading && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Sign-in with your BeaverHacks account
                </p>
              )}

              {session?.user && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  {session.user.email}
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
