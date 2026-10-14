"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tile, type TileMotif } from "./tiles";

// The homepage centrepiece, after Kandinsky's "Several Circles" and
// "Composition VIII": the featured product sits in a disc, ringed by its own
// name on a slowly turning path, with circles, swoops, a tile block, and
// crossing lines around it. Each layer drifts against the pointer by its own
// depth (see .parallax in globals.css).

const CHECKER: { motif: TileMotif; rotate: number; invert?: boolean }[] = [
  { motif: "quarter", rotate: 0 },
  { motif: "solid", rotate: 0 },
  { motif: "quarter", rotate: 90, invert: true },
  { motif: "half", rotate: 180, invert: true },
  { motif: "target", rotate: 0 },
  { motif: "half", rotate: 0 },
  { motif: "rings", rotate: 270 },
  { motif: "blank", rotate: 0 },
  { motif: "diag", rotate: 90 },
];

// Concentric quarter arcs fanning up and right from a point.
function fan(cx: number, cy: number, radii: number[]) {
  return radii.map((r) => `M${cx} ${cy - r}A${r} ${r} 0 0 1 ${cx + r} ${cy}`).join("");
}

const TICKS = Array.from({ length: 72 }, (_, i) => {
  const a = (i / 72) * Math.PI * 2;
  const r1 = i % 6 === 0 ? 270 : 278;
  return `M${300 + Math.cos(a) * r1} ${300 + Math.sin(a) * r1}L${300 + Math.cos(a) * 286} ${300 + Math.sin(a) * 286}`;
}).join("");

// Text ring radius and its circumference; the label is stretched to fit.
const RING_R = 196;
const RING_LENGTH = 2 * Math.PI * RING_R;

export interface HeroProduct {
  href: string;
  name: string;
  image: string;
  priceLabel: string;
}

export function HeroComposition({ product }: { product?: HeroProduct }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 2 - 1;
        const y = ((e.clientY - r.top) / r.height) * 2 - 1;
        el.style.setProperty("--px", Math.max(-1, Math.min(1, x)).toFixed(3));
        el.style.setProperty("--py", Math.max(-1, Math.min(1, y)).toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const label = product
    ? `Featured — ${product.name} — ${product.priceLabel} — `.toUpperCase()
    : "Ship It Shop — Merch for people who ship — ".toUpperCase();
  // Repeat the label as often as it fits (about 10.5 units per mono glyph at
  // this size and tracking); textLength then spreads it to close the ring.
  const repeats = Math.max(1, Math.floor(RING_LENGTH / (label.length * 10.5)));

  return (
    <div ref={ref} className="relative mx-auto aspect-square w-full max-w-[560px] text-foreground">
      {/* Far: horizon circle, tick ring, arc fan. */}
      <svg viewBox="0 0 600 600" aria-hidden="true" className="parallax absolute inset-0 size-full [--depth:6px]">
        <circle cx={300} cy={300} r={286} fill="none" stroke="currentColor" strokeWidth={1} />
        <g className="svg-spin animate-spin-slow">
          <path d={TICKS} stroke="currentColor" strokeWidth={1.5} />
          <circle cx={300} cy={300} r={286} fill="none" />
        </g>
        <path
          d={fan(36, 566, [70, 100, 130, 160, 190, 220, 250])}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.25}
          opacity={0.55}
        />
      </svg>

      {/* Middle: black sun, hollow moon, tile block, crossing lines. */}
      <svg viewBox="0 0 600 600" aria-hidden="true" className="parallax absolute inset-0 size-full [--depth:16px]">
        <path d="M-10 430L610 170" stroke="currentColor" strokeWidth={1.5} />
        <path d="M150 -10L370 610" stroke="currentColor" strokeWidth={1} />
        <g className="animate-float [animation-delay:-3s]">
          <circle cx={492} cy={112} r={58} fill="currentColor" />
        </g>
        <circle cx={528} cy={474} r={34} fill="none" stroke="currentColor" strokeWidth={7} />
        <circle cx={528} cy={474} r={9} fill="currentColor" />
        <g transform="translate(26 28) scale(0.42)">
          {CHECKER.map((t, i) => (
            <g key={i} transform={`translate(${(i % 3) * 100} ${Math.floor(i / 3) * 100})`}>
              <Tile motif={t.motif} rotate={t.rotate} invert={t.invert} />
            </g>
          ))}
          <rect width={300} height={300} fill="none" stroke="currentColor" strokeWidth={4} />
        </g>
        <path d="M86 520L118 466L150 520Z" fill="currentColor" />
      </svg>

      {/* The featured product in a disc. */}
      <div className="parallax absolute top-[22%] left-[22%] size-[56%] [--depth:-10px]">
        {product ? (
          <Link
            href={product.href}
            aria-label={`Featured: ${product.name}, ${product.priceLabel}`}
            className="group/hero block size-full overflow-hidden rounded-full border border-foreground bg-secondary outline-offset-4"
          >
            <Image
              src={product.image}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 320px, 56vw"
              className="rounded-full object-cover transition-[scale,filter] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/hero:scale-110 group-hover/hero:grayscale-0 [@media(hover:hover)]:grayscale"
            />
          </Link>
        ) : (
          <div className="size-full rounded-full bg-foreground" />
        )}
      </div>

      {/* Near: swoops drawn in on load, and the turning name ring. */}
      <svg viewBox="0 0 600 600" aria-hidden="true" className="parallax pointer-events-none absolute inset-0 size-full [--depth:26px]">
        <path
          d="M18 330C70 120 300 40 470 150"
          pathLength={1}
          strokeDasharray="1 1"
          fill="none"
          stroke="currentColor"
          strokeWidth={9}
          strokeLinecap="round"
          className="animate-draw"
        />
        <path
          d="M140 590C260 470 420 520 590 380"
          pathLength={1}
          strokeDasharray="1 1"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          className="animate-draw [animation-delay:0.5s]"
        />
        <defs>
          <path
            id="hero-ring"
            d={`M300 ${300 - RING_R}A${RING_R} ${RING_R} 0 1 1 ${300 - 0.01} ${300 - RING_R}Z`}
          />
        </defs>
        <g className="svg-spin animate-spin-slow [animation-duration:60s]">
          <circle cx={300} cy={300} r={RING_R + 14} fill="none" />
          <text className="fill-current font-mono text-[13px] tracking-[0.2em]">
            <textPath href="#hero-ring" textLength={RING_LENGTH} lengthAdjust="spacing">
              {label.repeat(repeats)}
            </textPath>
          </text>
        </g>
      </svg>
    </div>
  );
}
