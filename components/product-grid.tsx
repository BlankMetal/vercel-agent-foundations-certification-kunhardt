import type { Product } from "@/lib/types"
import { ProductCard } from "./product-card"

interface ProductGridProps {
  products: Product[]
  priorityFirst?: boolean
}

// Hairline catalogue grid: the container draws the top and left rules, each
// card its right and bottom, so a short last row leaves no filler cells.
export function ProductGrid({ products, priorityFirst = false }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 border-t border-l border-border sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          index={i}
          priority={priorityFirst && i === 0}
        />
      ))}
    </div>
  )
}
