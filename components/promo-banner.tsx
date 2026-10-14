import { Fragment } from "react"
import { getPromotion } from "@/lib/api"
import { Marquee } from "@/components/art/marquee"
import { TileGlyph, type TileMotif } from "@/components/art/tiles"

// Enough runs to overfill a wide screen; the marquee doubles them for the loop.
const RUNS = 4
const SEPARATORS: TileMotif[] = ["quarter", "dot", "half", "target"]

export async function PromoBanner() {
  const promo = await getPromotion()
  if (!promo || !promo.active) return null

  return (
    <section aria-label="Promotion" className="border-b border-foreground bg-foreground text-background">
      <Marquee className="py-2.5" duration={40}>
        {Array.from({ length: RUNS }, (_, i) => (
          // Only the first run is announced; the rest are visual repeats.
          <div key={i} aria-hidden={i > 0 || undefined} className="flex items-center">
            <span className="px-6 font-mono text-[11px] font-medium uppercase tracking-[0.22em]">
              {promo.title}
            </span>
            <TileGlyph motif={SEPARATORS[i % SEPARATORS.length]} rotate={i * 90} className="size-3.5" paper="var(--foreground)" />
            <span className="px-6 text-sm opacity-80">{promo.description}</span>
            {promo.code && (
              <Fragment>
                <TileGlyph motif="split" rotate={90} className="size-3.5" paper="var(--foreground)" />
                <span className="mx-6 rounded-full border border-background/40 px-3 py-0.5 font-mono text-[11px] tracking-[0.2em]">
                  CODE {promo.code}
                </span>
              </Fragment>
            )}
            <TileGlyph motif="bow" className="size-3.5" paper="var(--foreground)" />
          </div>
        ))}
      </Marquee>
    </section>
  )
}
