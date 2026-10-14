import Link from "next/link"
import { Github } from "lucide-react"
import { ContourField } from "@/components/art/contour-field"
import { TileField } from "@/components/art/tiles"

const SHOP_LINKS = [
  { href: "/search", label: "Full catalog" },
  { href: "/search?category=hoodies", label: "Hoodies" },
  { href: "/search?category=t-shirts", label: "T-shirts" },
  { href: "/search?category=mugs", label: "Mugs" },
  { href: "/search?category=desk", label: "Desk" },
]

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-foreground text-background [--contour-paper:var(--foreground)]">
      <TileField
        cols={24}
        rows={1}
        seed="footer-band"
        paper="var(--foreground)"
        animate={0.3}
        interactive
        className="aspect-[8/1] w-full sm:aspect-[24/1]"
      />

      <ContourField className="absolute inset-x-0 top-[8%] -z-10 h-[78%] w-full opacity-60" lines={30} />

      <div className="mx-auto max-w-6xl px-4 pt-14 pb-8">
        <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
          <p className="max-w-xs text-sm leading-relaxed text-background/70">
            Premium merchandise for developers who ship fast. High-quality
            apparel and accessories for the modern web.
          </p>
          <FooterColumn title="Shop">
            {SHOP_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-opacity hover:opacity-60">
                  {l.label}
                </Link>
              </li>
            ))}
          </FooterColumn>
          <FooterColumn title="Elsewhere">
            <li>
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-opacity hover:opacity-60"
              >
                <svg className="size-3.5" viewBox="0 0 76 65" fill="currentColor" aria-hidden="true">
                  <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                </svg>
                Vercel
              </a>
            </li>
            <li>
              <a
                href="https://github.com/vercel"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-opacity hover:opacity-60"
              >
                <Github className="size-3.5" aria-hidden="true" />
                GitHub
              </a>
            </li>
          </FooterColumn>
        </div>

        <p
          aria-hidden="true"
          className="mt-20 select-none text-[clamp(3.25rem,15vw,11.5rem)] leading-[0.78] font-semibold tracking-[-0.065em] whitespace-nowrap"
        >
          Ship It Shop
        </p>

        <div className="mt-8 flex items-center justify-between border-t border-background/20 pt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-background/60">
          <span>Ship It Shop</span>
          <span>Built on Vercel</span>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">{title}</p>
      <ul className="mt-4 space-y-2 text-sm">{children}</ul>
    </div>
  )
}
