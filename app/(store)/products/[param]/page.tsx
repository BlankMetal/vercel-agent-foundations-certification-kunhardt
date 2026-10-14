import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { ApiRequestError, getProductById, getProducts } from "@/lib/api"
import { formatPrice } from "@/lib/format"
import { Eyebrow } from "@/components/art/section-heading"
import { TileField } from "@/components/art/tiles"
import { ProductPurchase } from "./product-purchase"
import { RelatedProducts } from "./related-products"

interface ProductPageProps {
  params: Promise<{ param: string }>
}

export async function generateStaticParams() {
  try {
    const products = await getProducts({ limit: 100 })
    return products.map((p) => ({ param: p.id }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { param } = await params
  try {
    const product = await getProductById(param)
    return {
      title: product.name,
      description: product.description,
      openGraph: {
        type: "website",
        title: product.name,
        description: product.description,
        images: product.images.map((url) => ({ url })),
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description: product.description,
        images: product.images,
      },
    }
  } catch {
    return { title: "Product Not Found" }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { param } = await params

  let product
  try {
    product = await getProductById(param)
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) notFound()
    throw err
  }

  const image = product.images[0]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
      <Link
        href="/search"
        className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
        Back to Search
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <div className="relative aspect-square overflow-hidden border border-foreground bg-secondary">
            {image && (
              <Image
                src={image}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            )}
          </div>
          {/* Every product gets its own tile signature, seeded by its id. */}
          <TileField
            cols={8}
            rows={1}
            seed={product.id}
            interactive
            className="aspect-[8/1] w-full border-x border-b border-foreground"
          />
        </div>

        <div className="flex flex-col lg:pt-2">
          <Eyebrow index={product.featured ? "Featured" : undefined}>
            {product.category.replace(/-/g, " ")}
          </Eyebrow>
          <h1 className="mt-5 text-4xl leading-[0.95] font-semibold tracking-[-0.045em] text-balance sm:text-5xl lg:text-6xl">
            {product.name}
          </h1>
          <p className="mt-6 font-mono text-2xl tabular-nums text-foreground">
            {formatPrice(product.price, product.currency)}
          </p>
          <p className="mt-6 max-w-prose leading-relaxed text-pretty text-muted-foreground">
            {product.description}
          </p>

          <ProductPurchase product={product} />

          {product.tags.length > 0 && (
            <dl className="mt-12 grid grid-cols-[7rem_1fr] border-t border-foreground text-sm">
              <dt className="border-b border-border py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Category
              </dt>
              <dd className="border-b border-border py-3 capitalize">
                <Link href={`/search?category=${product.category}`} className="underline-offset-4 hover:underline">
                  {product.category.replace(/-/g, " ")}
                </Link>
              </dd>
              <dt className="border-b border-border py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Tags
              </dt>
              <dd className="flex flex-wrap gap-1.5 border-b border-border py-3">
                {product.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-border px-2.5 py-0.5 text-xs">
                    {tag}
                  </span>
                ))}
              </dd>
            </dl>
          )}
        </div>
      </div>

      <RelatedProducts product={product} />
    </div>
  )
}
