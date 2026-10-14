"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/format";
import { getProductDetailsAction } from "@/lib/product-actions";
import type { ProductDetailsData } from "@/lib/product-details";
import type { SearchProductsToolInvocation } from "@/lib/agent";
import { cn } from "@/lib/utils";
import { ProductDetailView } from "./agent-product-detail";
import { StockBadge, type Stock } from "./agent-stock-badge";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  price: number;
  currency: string;
  stock?: Stock;
};

type LoadState = "loading" | "error" | ProductDetailsData;

function DetailSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

// Shared by search results and by getProductDetails' "which one?" candidates.
// Each row expands in place into the full product card. Rows only carry what
// they show, so the card's data is fetched the first time a row is opened and
// kept for the life of the list.
export function ProductRows({ products }: { products: ProductRow[] }) {
  const [openId, setOpenId] = useState("");
  const [details, setDetails] = useState<Record<string, LoadState>>({});

  const load = (id: string) => {
    setDetails((prev) => ({ ...prev, [id]: "loading" }));
    getProductDetailsAction(id)
      .then((data) => setDetails((prev) => ({ ...prev, [id]: data })))
      .catch(() => setDetails((prev) => ({ ...prev, [id]: "error" })));
  };

  const handleOpenChange = (id: string) => {
    setOpenId(id);
    if (id && (details[id] === undefined || details[id] === "error")) load(id);
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={openId}
      onValueChange={handleOpenChange}
      className="overflow-hidden rounded-lg border border-border bg-card"
    >
      {products.map((product) => {
        const state = details[product.id];
        return (
          <AccordionItem key={product.id} value={product.id}>
            <AccordionTrigger
              className={cn(
                "group items-center gap-3 rounded-none p-3 hover:bg-secondary/50 hover:no-underline",
                "data-[state=open]:bg-secondary/30",
              )}
            >
              {/* The thumbnail gives way to the card's full gallery when open. */}
              <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-secondary group-data-[state=open]:hidden">
                {product.image && (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold leading-tight group-data-[state=open]:whitespace-normal group-data-[state=open]:text-base">
                  {product.name}
                </h3>
                <p className="text-xs text-muted-foreground group-data-[state=open]:text-sm group-data-[state=open]:font-semibold group-data-[state=open]:text-foreground">
                  {formatPrice(product.price, product.currency)}
                </p>
              </div>
              {product.stock !== undefined && (
                <div className="shrink-0">
                  <StockBadge stock={product.stock} />
                </div>
              )}
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              {state === "error" ? (
                <div className="flex items-center justify-between gap-3 p-4 text-sm text-muted-foreground">
                  <span>We couldn&apos;t load this product.</span>
                  <Button size="sm" variant="outline" onClick={() => load(product.id)}>
                    Try again
                  </Button>
                </div>
              ) : state === undefined || state === "loading" ? (
                <DetailSkeleton />
              ) : (
                <ProductDetailView data={state} showHeader={false} />
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

interface AgentProductListProps {
  invocation: SearchProductsToolInvocation;
}

export function AgentProductList({ invocation }: AgentProductListProps) {
  if (
    invocation.state === "input-streaming" ||
    invocation.state === "input-available"
  ) {
    const query = invocation.input?.query;
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        Searching{query ? ` for "${query}"` : ""}…
      </div>
    );
  }

  if (invocation.state !== "output-available") return null;

  const output = invocation.output;

  if (!output) return null;

  if ("error" in output && output.error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {/* output.error is the raw API message; keep it out of the shopper's view. */}
        We couldn&apos;t load products right now. Please try again in a moment.
      </div>
    );
  }

  if (output.count === 0) {
    return null;
  }

  return <ProductRows products={output.products} />;
}