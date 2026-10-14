import { PhaseGlyph } from "@/components/art/tiles";

export type Stock = { inStock: boolean; lowStock: boolean; quantity: number } | null;

// Same wording as the product page (product-purchase.tsx), and the same moon
// phases: full in stock, half running low, empty sold out. null means stock
// couldn't be checked, so show nothing rather than guess.
export function StockBadge({ stock }: { stock: Stock }) {
  if (!stock) return null;
  const low = stock.inStock && stock.lowStock && stock.quantity > 0;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs whitespace-nowrap">
      <PhaseGlyph phase={!stock.inStock ? "empty" : low ? "half" : "full"} className="size-3" />
      {!stock.inStock ? (
        <span className="text-muted-foreground">Out of stock</span>
      ) : low ? (
        <span>Only {stock.quantity} left in stock</span>
      ) : (
        <span>In stock</span>
      )}
    </span>
  );
}
