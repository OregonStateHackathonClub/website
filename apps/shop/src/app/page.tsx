"use client";

import Image from "next/image";
import { useState } from "react";
import { Card } from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { product } from "@/lib/products";
import { AddToCartButton } from "./product/[slug]/add-to-cart-button";

export default function HomePage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const hasVariants = product.variants.length > 0;

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Product Images */}
          <div className="space-y-3">
            <Card className="p-4 shadow-none">
              <div className="relative aspect-4/3 lg:aspect-square bg-muted rounded-lg overflow-hidden">
                {product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
            </Card>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImage === i
                        ? "border-primary"
                        : "border-border hover:border-ring"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      fill
                      className="object-contain p-1 bg-muted"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <div className="space-y-4">
              {/* Badge */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Preorder</Badge>
                {product.compareAtPrice && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Save ${(product.compareAtPrice - product.price).toFixed(0)}
                  </Badge>
                )}
              </div>

              {/* Product Name */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <p className="text-xl sm:text-2xl font-medium">
                  ${product.price.toFixed(2)}
                </p>
                {product.compareAtPrice && (
                  <p className="text-lg text-muted-foreground line-through">
                    ${product.compareAtPrice.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
                  {product.description}
                </p>
              )}

              {/* Variant Selection & Add to Cart */}
              <AddToCartButton product={product} hasVariants={hasVariants} />

              {/* Additional Info */}
              <div className="pt-3 border-t border-border space-y-1">
                <p className="text-sm font-medium">
                  Preorder — ships in 4-6 weeks
                </p>
                <p className="text-xs text-muted-foreground">
                  Limited quantities. All sales are final.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
