import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { SectionHeading } from "@/components/art/section-heading"
import { TileField } from "@/components/art/tiles"

export function CategoryShowcase() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24">
      <SectionHeading index="02" eyebrow="Collections" title="Shop by category" />

      <div className="mt-10 grid gap-px border border-foreground bg-foreground md:grid-cols-2">
        {/* Clothing: ink panel, image in an arch. */}
        <Link
          href="/search?category=hoodies"
          className="group relative isolate flex min-h-[520px] flex-col justify-between gap-10 overflow-hidden bg-foreground p-8 text-background"
        >
          <TileField
            cols={5}
            rows={6}
            seed="clothing-wall"
            paper="var(--foreground)"
            animate={0.3}
            className="absolute inset-0 -z-10 size-full opacity-[0.16] transition-opacity duration-700 group-hover:opacity-25"
          />
          <div className="relative mx-auto aspect-[3/4] w-[min(62%,15rem)] overflow-hidden rounded-t-full border border-background/40">
            <Image
              src="/categories/clothing.jpg"
              alt="Clothing collection"
              fill
              sizes="(min-width: 768px) 240px, 62vw"
              className="object-cover grayscale transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-105"
            />
          </div>

          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60">
              Collection
            </span>
            <h3 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">Clothing</h3>
            <p className="mt-2 max-w-xs text-sm text-background/70">
              Premium tees, hoodies, and more. Built for developers who ship.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium transition-[gap] duration-500 group-hover:gap-4">
              Shop Apparel
              <ArrowRight className="size-4" />
            </div>
          </div>
        </Link>

        {/* Drinkware: paper panel, image in a disc. */}
        <Link
          href="/search?category=mugs"
          className="group relative isolate flex min-h-[520px] flex-col justify-between gap-10 overflow-hidden bg-background p-8"
        >
          <TileField
            cols={5}
            rows={6}
            seed="drinkware-wall"
            animate={0.3}
            className="absolute inset-0 -z-10 size-full opacity-[0.09] transition-opacity duration-700 group-hover:opacity-15"
          />
          <div className="relative mx-auto aspect-square w-[min(70%,17rem)]">
            <div className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-foreground/50" />
            <div className="absolute inset-[7%] overflow-hidden rounded-full border border-foreground">
              <Image
                src="/categories/drinkware.jpg"
                alt="Drinkware collection"
                fill
                sizes="(min-width: 768px) 260px, 70vw"
                className="object-cover grayscale transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-105"
              />
            </div>
          </div>

          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Essentials
            </span>
            <h3 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">Drinkware</h3>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Mugs and bottles to fuel your coding sessions.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium transition-[gap] duration-500 group-hover:gap-4">
              Shop Drinkware
              <ArrowRight className="size-4" />
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}
