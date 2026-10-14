import type { Metadata } from "next"
import { ProductGrid } from "@/components/product-grid"
import { getCategories, getProducts } from "@/lib/api"
import { Eyebrow } from "@/components/art/section-heading"
import { TileField } from "@/components/art/tiles"
import { SearchEmpty } from "./search-empty"
import { SearchForm } from "./search-form"

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string }>
}

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search the full Ship It Shop catalog by name, category, or tag.",
  openGraph: {
    title: "Search | Ship It Shop",
    description:
      "Search the full Ship It Shop catalog by name, category, or tag.",
  },
}

const SEARCH_RESULT_LIMIT = 5
const DEFAULT_LIMIT = 12

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", category = "" } = await searchParams
  const limit = q.length > 0 ? SEARCH_RESULT_LIMIT : DEFAULT_LIMIT
  const isSearching = q.length > 0 || category.length > 0

  const [categories, products] = await Promise.all([
    getCategories().catch(() => []),
    getProducts({
      search: q || undefined,
      category: category || undefined,
      limit,
    }).catch(() => []),
  ])

  return (
    <>
      <section className="border-b border-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-14 pb-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <Eyebrow index="N°02">Catalog</Eyebrow>
            <h1 className="mt-5 text-6xl leading-[0.9] font-semibold tracking-[-0.055em] sm:text-7xl">
              Search
            </h1>
            <p className="mt-4 max-w-md text-muted-foreground">
              Browse our collection of premium developer merchandise
            </p>
          </div>
          <TileField
            cols={6}
            rows={2}
            seed={`search-${category || "all"}`}
            animate={0.5}
            interactive
            className="hidden aspect-[3/1] w-72 border border-foreground md:block"
          />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <SearchForm
          initialQuery={q}
          initialCategory={category}
          categories={categories}
        />

        {products.length === 0 ? (
          <div className="mt-8">
            <SearchEmpty query={q} />
          </div>
        ) : (
          <>
            <p className="mt-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              <span className="text-foreground tabular-nums">
                {String(products.length).padStart(2, "0")}
              </span>
              <span aria-hidden="true" className="h-px w-8 bg-current opacity-60" />
              {isSearching ? (
                <span className="normal-case tracking-normal">
                  result{products.length === 1 ? "" : "s"}
                  {q ? ` for "${q}"` : ""}
                  {category ? ` in ${category}` : ""}
                </span>
              ) : (
                <span>Products</span>
              )}
            </p>
            <div className="mt-4">
              <ProductGrid products={products} />
            </div>
          </>
        )}
      </div>
    </>
  )
}
