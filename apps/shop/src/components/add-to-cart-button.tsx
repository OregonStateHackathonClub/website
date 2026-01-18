"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/products";

interface AddToCartButtonProps {
  product: Product;
  hasVariants: boolean;
}

const MAX_CART_ITEMS = 3;

export function AddToCartButton({ product, hasVariants }: AddToCartButtonProps) {
  const { addToCart, totalItems } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>();
  const [added, setAdded] = useState(false);

  const variants = product.variants;
  const cartFull = totalItems >= MAX_CART_ITEMS;

  const handleAddToCart = () => {
    if (cartFull) return;

    const variant = selectedVariantId
      ? variants.find((v) => v.id === selectedVariantId)
      : null;

    if (hasVariants && !variant) return;

    addToCart({
      productId: product.id,
      variantId: variant?.id,
      stripePriceId: variant?.stripePriceId || "",
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0],
      variantName: variant?.name,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  const canAddToCart = (!hasVariants || selectedVariantId) && !cartFull;

  return (
    <div className="space-y-4">
      {/* Variant Selection */}
      {hasVariants && (
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Size
          </label>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const isSelected = selectedVariantId === variant.id;
              const inStock = variant.stockLevel > 0;

              return (
                <Button
                  key={variant.id}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => setSelectedVariantId(variant.id)}
                  disabled={!inStock}
                  className={!inStock ? "opacity-40 line-through" : ""}
                >
                  {variant.name}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={!canAddToCart}
        variant={added ? "outline" : "default"}
        size="lg"
        className="w-full"
      >
        {added ? (
          <>
            <Check className="h-4 w-4" />
            Added to Cart
          </>
        ) : cartFull ? (
          "Cart Full (max 3)"
        ) : hasVariants && !selectedVariantId ? (
          "Select Size"
        ) : (
          "Add to Cart"
        )}
      </Button>
    </div>
  );
}
