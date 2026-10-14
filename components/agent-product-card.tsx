"use client";

import type { ProductDetailsToolInvocation } from "@/lib/agent";
import { ProductDetailView } from "./agent-product-detail";
import { ProductRows } from "./agent-product-list";

interface AgentProductCardProps {
  invocation: ProductDetailsToolInvocation;
}

export function AgentProductCard({ invocation }: AgentProductCardProps) {
  if (
    invocation.state === "input-streaming" ||
    invocation.state === "input-available"
  ) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        Looking up product details…
      </div>
    );
  }

  if (invocation.state !== "output-available") return null;

  const output = invocation.output;

  // Several products fit the shopper's words: show them as a list. The agent's
  // text asks which one they mean.
  if (output.status === "ambiguous") {
    return <ProductRows products={output.candidates} />;
  }

  // Nothing matched; the agent's text says so. No card to show.
  if (output.status === "not-found") return null;

  if (output.status === "error") {
    // `output.error` is the raw API message; keep it out of the shopper's view.
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        We couldn&apos;t load this product right now. Please try again in a moment.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <ProductDetailView data={output} />
    </div>
  );
}
