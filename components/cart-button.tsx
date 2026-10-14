"use client"

import { ShoppingBag } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { headerIconClass } from "@/components/header-icon-class"

export function CartButton() {
  const { itemCount, openCart } = useCart()

  return (
    <button onClick={openCart} className={headerIconClass} aria-label="Shopping cart">
      <ShoppingBag className="size-[18px]" />
      {itemCount > 0 && (
        <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 animate-rise items-center justify-center rounded-full bg-foreground px-1 font-mono text-[10px] font-medium text-background tabular-nums">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  )
}
