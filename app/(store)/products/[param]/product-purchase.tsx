"use client"

import { useEffect, useState } from "react"
import { Check, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import { getProductStockAction } from "@/lib/cart-actions"
import { PhaseGlyph, TileGlyph } from "@/components/art/tiles"
import type { Product, StockInfo } from "@/lib/types"

interface ProductPurchaseProps {
  product: Product
}

const STOCK_REFRESH_MS = 30_000

export function ProductPurchase({ product }: ProductPurchaseProps) {
  const { addToCart, openCart } = useCart()
  const [stock, setStock] = useState<StockInfo | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)

  useEffect(() => {
    let cancelled = false
    const tick = async () => {
      try {
        const next = await getProductStockAction(product.id)
        if (!cancelled) setStock(next)
      } catch {
        // Keep last known stock; failure is rare and the user can retry.
      }
    }
    tick()
    const id = setInterval(tick, STOCK_REFRESH_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [product.id])

  // Clamp the selected quantity if reported stock drops below it.
  useEffect(() => {
    if (stock && stock.stock > 0 && quantity > stock.stock) {
      setQuantity(stock.stock)
    }
  }, [stock, quantity])

  const isLoadingStock = stock === null
  const isOutOfStock = !isLoadingStock && !stock.inStock
  const isLowStock = !isLoadingStock && stock.lowStock && stock.stock > 0
  const maxQty = stock ? Math.max(1, stock.stock) : 1

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }
  const handleIncrement = () => {
    if (quantity < maxQty) setQuantity(quantity + 1)
  }

  const handleAddToCart = () => {
    if (isOutOfStock || isLoadingStock) return
    addToCart(product, quantity)
    setIsAdded(true)
    openCart()
    setTimeout(() => {
      setIsAdded(false)
      setQuantity(1)
    }, 2000)
  }

  const phase = isLoadingStock
    ? "unknown"
    : isOutOfStock
      ? "empty"
      : isLowStock
        ? "half"
        : "full"

  return (
    <>
      <p className="mt-6 inline-flex items-center gap-2.5 text-sm" aria-live="polite">
        <PhaseGlyph phase={phase} />
        {isLoadingStock ? (
          <span className="text-muted-foreground">Checking availability…</span>
        ) : isOutOfStock ? (
          <span className="text-muted-foreground">Out of stock</span>
        ) : isLowStock ? (
          <span>Only {stock.stock} left in stock</span>
        ) : (
          <span>In stock</span>
        )}
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div
          role="group"
          aria-label="Quantity"
          className="inline-flex h-12 items-center justify-between rounded-full border border-foreground p-1 sm:w-40"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDecrement}
            disabled={quantity <= 1 || isOutOfStock}
            aria-label="Decrease quantity"
            className="rounded-full"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-10 text-center font-mono text-base tabular-nums" aria-live="polite">
            {quantity}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleIncrement}
            disabled={quantity >= maxQty || isOutOfStock}
            aria-label="Increase quantity"
            className="rounded-full"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Button
          size="lg"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isLoadingStock}
          className="group h-12 flex-1 rounded-full text-sm"
        >
          {isAdded ? (
            <>
              <Check className="mr-1 h-4 w-4" />
              Added to Cart
            </>
          ) : isOutOfStock ? (
            "Out of Stock"
          ) : (
            <>
              Add to Cart
              <TileGlyph
                motif="quarter"
                className="size-3.5 transition-transform duration-500 group-hover:rotate-90"
                paper="var(--primary)"
              />
            </>
          )}
        </Button>
      </div>
    </>
  )
}
