import { Badge } from "@/components/ui/badge";

export type Stock = { inStock: boolean; lowStock: boolean; quantity: number } | null;

// Same wording as the product page (product-purchase.tsx). null means stock
// couldn't be checked, so show nothing rather than guess.
export function StockBadge({ stock }: { stock: Stock }) {
  if (!stock) return null;
  if (!stock.inStock) return <Badge variant="destructive">Out of stock</Badge>;
  if (stock.lowStock && stock.quantity > 0) {
    return <Badge variant="secondary">Only {stock.quantity} left in stock</Badge>;
  }
  return <Badge variant="outline">In stock</Badge>;
}
