"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ShoppingBag, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductDetailsData } from "@/lib/product-details";
import { StockBadge } from "./agent-stock-badge";

// Descriptions longer than this start clamped, with a "Show more" toggle.
const LONG_DESCRIPTION = 180;

function Gallery({ images, name, featured }: { images: string[]; name: string; featured: boolean }) {
  const [selected, setSelected] = useState(0);
  const current = images[selected];

  return (
    <div>
      <div className="relative aspect-square bg-secondary">
        {current && (
          <Image
            src={current}
            alt={name}
            fill
            sizes="(min-width: 768px) 400px, 100vw"
            className="object-cover"
          />
        )}
        {featured && (
          <Badge className="absolute left-3 top-3 gap-1 shadow-sm">
            <Sparkles />
            Featured
          </Badge>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 pt-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setSelected(i)}
              aria-label={`Show image ${i + 1} of ${images.length}`}
              aria-pressed={i === selected}
              className={cn(
                "relative size-12 shrink-0 overflow-hidden rounded-md border bg-secondary transition",
                i === selected
                  ? "border-foreground ring-1 ring-foreground"
                  : "border-border opacity-70 hover:opacity-100",
              )}
            >
              <Image src={src} alt="" fill sizes="48px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Description({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > LONG_DESCRIPTION;

  return (
    <div className="text-sm text-muted-foreground">
      <p className={cn(isLong && !expanded && "line-clamp-3")}>{text}</p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-xs font-medium text-foreground underline-offset-4 hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

function AddToCart({ product, outOfStock }: { product: ProductDetailsData["product"]; outOfStock: boolean }) {
  const { addToCart, openCart } = useCart();
  const [added, setAdded] = useState(false);

  // Same flow as the product page (product-purchase.tsx): add one, open the
  // cart, and briefly confirm on the button.
  const handleClick = () => {
    addToCart(product, 1);
    openCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Button size="sm" className="flex-1" onClick={handleClick} disabled={outOfStock}>
      {added ? <Check /> : <ShoppingBag />}
      {outOfStock ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
    </Button>
  );
}

function RelatedProducts({ products }: { products: ProductDetailsData["related"] }) {
  return (
    <div className="border-t border-border p-4">
      <p className="text-xs font-medium text-muted-foreground">You might also like</p>
      <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            className="w-28 shrink-0 overflow-hidden rounded-md border border-border transition-colors hover:border-foreground/20"
          >
            <div className="relative aspect-square bg-secondary">
              {p.image && (
                <Image src={p.image} alt={p.name} fill sizes="112px" className="object-cover" />
              )}
            </div>
            <div className="p-2">
              <p className="line-clamp-2 text-xs font-medium">{p.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatPrice(p.price, p.currency)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

interface ProductDetailViewProps {
  data: ProductDetailsData;
  // The expanded list row already shows name, price, and stock in its header,
  // so it hides this one.
  showHeader?: boolean;
}

// The full product card. Rendered on its own for a getProductDetails result,
// and inside an expanded row of a product list.
export function ProductDetailView({ data, showHeader = true }: ProductDetailViewProps) {
  const { product, stock, related } = data;

  return (
    <div>
      <Gallery images={product.images} name={product.name} featured={product.featured} />
      <div className="space-y-3 p-4">
        {showHeader && (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {product.category.replace(/-/g, " ")}
              </p>
              <h3 className="mt-0.5 text-base font-semibold leading-tight">{product.name}</h3>
              <p className="mt-1 text-lg font-semibold tabular-nums">
                {formatPrice(product.price, product.currency)}
              </p>
            </div>
            <div className="shrink-0">
              <StockBadge stock={stock} />
            </div>
          </div>
        )}
        <Description text={product.description} />
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 6).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <AddToCart product={product} outOfStock={stock?.inStock === false} />
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link href={`/products/${product.slug}`}>View product</Link>
          </Button>
        </div>
      </div>
      {related.length > 0 && <RelatedProducts products={related} />}
    </div>
  );
}
