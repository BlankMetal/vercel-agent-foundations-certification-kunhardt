"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useCart } from "@/components/cart-provider"
import { formatPrice } from "@/lib/format"
import { KandinskyGlyph } from "@/components/art/kandinsky-glyph"
import { TileField } from "@/components/art/tiles"

export function CartSheet() {
  const {
    isOpen,
    closeCart,
    cart,
    itemCount,
    removeFromCart,
    updateQuantity,
  } = useCart()

  const items = cart.items
  const currency = cart.currency || "USD"

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent side="right" className="flex flex-col gap-0 border-l-foreground">
        <SheetHeader className="gap-3 px-5 pt-6 pb-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Your bag
          </p>
          <SheetTitle className="flex items-baseline gap-3 text-3xl font-semibold tracking-[-0.04em]">
            Shopping Cart
            <span className="font-mono text-sm font-normal tabular-nums text-muted-foreground">
              ({String(itemCount).padStart(2, "0")})
            </span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Review the items in your cart, adjust quantities, or remove items.
          </SheetDescription>
        </SheetHeader>
        <TileField
          cols={12}
          rows={1}
          seed={`cart-${itemCount}`}
          animate={0.4}
          className="aspect-[12/1] w-full border-y border-foreground"
        />

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <KandinskyGlyph className="size-32" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button variant="outline" onClick={closeCart} asChild className="h-11 rounded-full border-foreground px-6">
              <Link href="/search">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li key={item.productId} className="animate-rise px-5 py-5">
                    <div className="flex gap-4">
                      <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-foreground bg-secondary">
                        {item.product.images[0] && (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <Link
                            href={`/products/${item.productId}`}
                            onClick={closeCart}
                            className="text-sm font-medium text-foreground hover:underline"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          {formatPrice(item.product.price, currency)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            className="flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center font-mono text-sm tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            className="flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <span className="ml-auto font-mono text-sm tabular-nums">
                            {formatPrice(item.lineTotal, currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <SheetFooter className="border-t border-foreground p-5">
              <div className="w-full space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Subtotal</span>
                  <span className="font-mono text-2xl tabular-nums">{formatPrice(cart.subtotal, currency)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Shipping and taxes calculated at checkout.
                </p>
                <Button disabled className="h-12 w-full rounded-full">
                  Checkout
                </Button>
                <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Checkout coming soon
                </p>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
