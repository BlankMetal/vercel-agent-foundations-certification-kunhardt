"use client";

import type { ProductDetailsToolInvocation } from "@/lib/agent";
import { ProductDetailView } from "./agent-product-detail";
import { ProductRows } from "./agent-product-list";
import { Spinner } from "@/components/ui/spinner";

interface AgentProductCardProps {
  invocation: ProductDetailsToolInvocation;
}

export function AgentProductCard({ invocation }: AgentProductCardProps) {
  if (
    invocation.state === "input-streaming" ||
    invocation.state === "input-available"
  ) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-foreground/50 bg-card p-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        <Spinner />
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
      <div className="rounded-xl border border-destructive/40 border-l-4 bg-destructive/5 p-4 text-sm text-destructive">
        We couldn&apos;t load this product right now. Please try again in a moment.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-foreground bg-card shadow-[4px_4px_0_0_var(--foreground)]">
      <ProductDetailView data={output} />
    </div>
  );
}
