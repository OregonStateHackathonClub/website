export interface ProductVariant {
  id: string;
  name: string;
  stripePriceId: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  variants: ProductVariant[];
}

export const product: Product = {
  id: "beaverhacks-hoodie",
  name: "BeaverHacks 2026 Hoodie",
  description: "Premium heavyweight hoodie",
  price: 25.0,
  compareAtPrice: 45.0,
  images: ["/hoodie_front.png", "/hoodie_back.png"],
  variants: [
    {
      id: "size-s",
      name: "S",
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_S || "",
    },
    {
      id: "size-m",
      name: "M",
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_M || "",
    },
    {
      id: "size-l",
      name: "L",
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_L || "",
    },
    {
      id: "size-xl",
      name: "XL",
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_XL || "",
    },
  ],
};
