import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/format"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
  priority?: boolean
  /** Position in the grid, shown as a catalogue number. */
  index?: number
}

export function ProductCard({ product, priority = false, index }: ProductCardProps) {
  const image = product.images[0]
  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative flex flex-col border-r border-b border-border bg-background outline-offset-[-2px]"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {image && (
          <Image
            src={image}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            // Grayscale until hovered, on devices that can hover; touch
            // screens always see the colour photo.
            className="object-cover transition-[scale,filter] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.04] group-hover:grayscale-0 [@media(hover:hover)]:grayscale"
          />
        )}
        {/* A quarter disc swings in from the corner on hover. */}
        <span
          aria-hidden="true"
          className="absolute top-0 right-0 size-16 origin-top-right scale-0 rounded-bl-full bg-foreground transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:scale-100 group-focus-visible:scale-100"
        />
        <span
          aria-hidden="true"
          className="absolute top-2.5 right-3 font-mono text-[11px] text-background opacity-0 transition-opacity delay-150 duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          →
        </span>
      </div>
      <div className="flex flex-1 items-start justify-between gap-3 border-t border-border px-4 pt-3 pb-4">
        <div className="min-w-0">
          {index !== undefined && (
            <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
              N°{String(index + 1).padStart(2, "0")}
            </p>
          )}
          <h3 className="mt-1 text-sm leading-snug font-medium text-foreground">{product.name}</h3>
        </div>
        <p className="mt-[1.1rem] shrink-0 font-mono text-sm tabular-nums text-foreground">
          {formatPrice(product.price, product.currency)}
        </p>
      </div>
    </Link>
  )
}
