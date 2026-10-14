import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { ProductGrid } from "@/components/product-grid"
import { CategoryShowcase } from "@/components/category-showcase"
import { PromoBanner } from "@/components/promo-banner"
import { AgentButton } from "@/components/agent-button"
import { HeroComposition } from "@/components/art/hero-composition"
import { Eyebrow, SectionHeading } from "@/components/art/section-heading"
import { TileField, TileGlyph } from "@/components/art/tiles"
import { getProducts } from "@/lib/api"
import { formatPrice } from "@/lib/format"

export const dynamic = "force-static"
export const revalidate = 60

const INDEX = [
  { n: "01", label: "Hoodies", href: "/search?category=hoodies" },
  { n: "02", label: "T-shirts", href: "/search?category=t-shirts" },
  { n: "03", label: "Mugs", href: "/search?category=mugs" },
  { n: "04", label: "Desk", href: "/search?category=desk" },
]

export default function HomePage() {
  return (
    <>
      <PromoBanner />
      <FeaturedProducts />
      <CategoryShowcase />
    </>
  )
}

async function FeaturedProducts() {
  const products = await getProducts({ featured: true, limit: 4 }).catch(
    () => [],
  )
  const hero = products[0]

  return (
    <>
      <section className="relative">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-14 pb-16 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-8 lg:pt-20 lg:pb-24">
          <div className="flex flex-col items-start">
            <Eyebrow index="N°01" className="animate-rise">
              Merch for people who ship
            </Eyebrow>
            <h1 className="mt-8 animate-rise text-[clamp(3.75rem,13vw,7.5rem)] leading-[0.86] font-semibold tracking-[-0.06em] [animation-delay:80ms]">
              Ship
              <br />
              <span className="inline-flex items-center gap-[0.12em]">
                It
                <TileGlyph motif="split" rotate={90} className="size-[0.62em] translate-y-[0.04em]" />
                <TileGlyph motif="quarter" rotate={180} className="size-[0.62em] translate-y-[0.04em]" />
              </span>
              <br />
              Shop
            </h1>
            <p className="mt-8 max-w-md animate-rise text-lg leading-relaxed text-pretty text-muted-foreground [animation-delay:160ms]">
              Premium merchandise for developers who ship fast. High-quality
              apparel and accessories for the modern web.
            </p>
            <div className="mt-10 flex animate-rise flex-wrap items-center gap-3 [animation-delay:240ms]">
              <Link
                href="/search"
                className="group inline-flex h-12 items-center gap-3 rounded-full bg-foreground pr-2 pl-6 text-sm font-medium text-background transition-transform active:scale-[0.98]"
              >
                Shop All Products
                <span className="flex size-8 items-center justify-center rounded-full bg-background text-foreground transition-transform duration-500 group-hover:rotate-[-45deg]">
                  <ArrowRight className="size-4" />
                </span>
              </Link>
              <AgentButton className="inline-flex h-12 items-center gap-2.5 rounded-full border border-foreground px-5 text-sm font-medium transition-colors hover:bg-foreground hover:text-background">
                Ask the agent
              </AgentButton>
            </div>

            <nav aria-label="Browse by category" className="mt-14 w-full max-w-md animate-rise [animation-delay:320ms]">
              <ul className="grid grid-cols-2 border-t border-foreground sm:grid-cols-4">
                {INDEX.map((item) => (
                  <li key={item.href} className="border-b border-border sm:border-b-0">
                    <Link
                      href={item.href}
                      className="group flex items-baseline justify-between gap-2 py-3 pr-3 text-sm transition-colors hover:text-muted-foreground"
                    >
                      <span>
                        <span className="mr-2 font-mono text-[10px] text-muted-foreground">{item.n}</span>
                        {item.label}
                      </span>
                      <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <HeroComposition
            product={
              hero?.images[0]
                ? {
                    href: `/products/${hero.id}`,
                    name: hero.name,
                    image: hero.images[0],
                    priceLabel: formatPrice(hero.price, hero.currency),
                  }
                : undefined
            }
          />
        </div>
      </section>

      <TileField
        cols={20}
        rows={2}
        seed="home-band"
        animate={0.35}
        interactive
        className="aspect-[5/1] w-full border-y border-foreground sm:aspect-[10/1]"
      />

      <section className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading
          index="01"
          eyebrow="Featured"
          title="Featured Products"
          action={
            <Link
              href="/search"
              className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
            >
              View All
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          }
        />

        <div className="mt-10">
          {products.length > 0 ? (
            <ProductGrid products={products} priorityFirst />
          ) : (
            <p className="text-sm text-muted-foreground">
              Featured products are unavailable right now. Try again shortly.
            </p>
          )}
        </div>
      </section>
    </>
  )
}
