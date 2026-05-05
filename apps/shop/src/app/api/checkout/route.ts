import { NextRequest, NextResponse } from "next/server";
import { auth, getSessionCookie } from "@repo/auth";
import { stripe } from "@/lib/stripe";
import { product } from "@/lib/products";
import { MAX_CART_ITEMS, SOLD_OUT } from "@/lib/constants";

interface CheckoutItem {
  productId?: unknown;
  variantId?: unknown;
  quantity?: unknown;
}

export async function POST(request: NextRequest) {
  if (SOLD_OUT) {
    return NextResponse.json(
      { error: "We're no longer accepting orders" },
      { status: 400 },
    );
  }

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { items } = body as { items?: CheckoutItem[] };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const lineItems: { price: string; quantity: number }[] = [];
    let totalQuantity = 0;

    for (const item of items) {
      if (item.productId !== product.id) {
        return NextResponse.json({ error: "Invalid cart items" }, { status: 400 });
      }
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant || !variant.stripePriceId) {
        return NextResponse.json({ error: "Invalid cart items" }, { status: 400 });
      }
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_CART_ITEMS) {
        return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
      }
      totalQuantity += quantity;
      if (totalQuantity > MAX_CART_ITEMS) {
        return NextResponse.json({ error: "Cart exceeds limit" }, { status: 400 });
      }
      lineItems.push({ price: variant.stripePriceId, quantity });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: session.user.email || undefined,
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      success_url: `${process.env.NEXT_PUBLIC_SHOP_URL || "http://localhost:3001"}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SHOP_URL || "http://localhost:3001"}/cart`,
    });

    return NextResponse.json({ checkoutUrl: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}
