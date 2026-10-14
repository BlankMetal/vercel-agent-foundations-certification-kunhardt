"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image, { getImageProps } from "next/image";

// The homepage centrepiece: an abstract nazar. A dark lens holds concentric
// rings (a paper ring, a band of fine hairlines, a heavy rule) that all close
// in on the featured product as the pupil. The rings follow the pointer
// anywhere on the page, the lens blinks now and then, and two nazar beads
// orbit it. Hovering the composition fires a Dark Side of the Moon beam: the
// eye looks straight ahead and a fan of stepped tones projects the product
// card beneath it. With no pointer (touch screens, or a still mouse) the eye glances
// around on its own.
//
// Everything is drawn in a 600x600 viewBox centred on (300, 300).

const C = 300;

// A vesica from two circular arcs meeting at (C ± HALF, C). `sag` is the
// distance from the centre to the top and bottom of the lens.
const HALF = 274;
function lens(sag: number) {
  const r = ((HALF * HALF + sag * sag) / (2 * sag)).toFixed(1);
  return `M${C - HALF} ${C}A${r} ${r} 0 0 1 ${C + HALF} ${C}A${r} ${r} 0 0 1 ${C - HALF} ${C}Z`;
}
const EYE = lens(186);
const GHOSTS = [lens(210), lens(234)];

// Trig results can differ in the last digits between Node and the browser,
// which breaks hydration; every computed coordinate is rounded.
const f = (n: number) => n.toFixed(1);

const HALO_TICKS = Array.from({ length: 72 }, (_, i) => {
  const a = (i / 72) * Math.PI * 2;
  const r1 = i % 6 === 0 ? 272 : 280;
  return `M${f(C + Math.cos(a) * r1)} ${f(C + Math.sin(a) * r1)}L${f(C + Math.cos(a) * 288)} ${f(C + Math.sin(a) * 288)}`;
}).join("");

const RING_R = 166; // the paper ring
const PUPIL_R = 136;
const HAIRLINES = [142, 146, 150, 154, 158, 162];

// The beam leaves the pupil's lower edge and fans down past the eye to the
// product card, which sits just below this 600-unit square (the eye's SVG
// overflows into it). Stepped tones stand in for the spectrum.
const BEAM_TOP = C + PUPIL_R + 4;
const BEAM_BOTTOM = 614;
const BEAM_APEX = 26;
const BEAM_SPREAD = 352;
const BAND_TONES = [1, 0.82, 0.64, 0.46, 0.3, 0.16];
const BANDS = BAND_TONES.map((_, i) => {
  const n = BAND_TONES.length;
  const t0 = C - BEAM_APEX / 2 + (BEAM_APEX / n) * i;
  const b0 = C - BEAM_SPREAD / 2 + (BEAM_SPREAD / n) * i;
  return `M${f(t0)} ${BEAM_TOP}L${f(t0 + BEAM_APEX / n)} ${BEAM_TOP}L${f(b0 + BEAM_SPREAD / n)} ${BEAM_BOTTOM}L${f(b0)} ${BEAM_BOTTOM}Z`;
});

// How far the rings may travel from centre, in viewBox units. The lens is
// only 186 tall from the centre, so vertical travel stays small.
const GAZE_X = 48;
const GAZE_Y = 9;

function Bead({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="currentColor" />
      <circle cx={cx} cy={cy} r={r * 0.66} fill="var(--background)" />
      <circle cx={cx} cy={cy} r={r * 0.5} fill="none" stroke="currentColor" strokeWidth={1} />
      <circle cx={cx} cy={cy} r={r * 0.32} fill="currentColor" />
    </g>
  );
}

export interface HeroProduct {
  href: string;
  name: string;
  category?: string;
  image: string;
  priceLabel: string;
}

export function HeroComposition({ product }: { product?: HeroProduct }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let lastPointer = 0;
    const look = (x: number, y: number) => {
      el.style.setProperty("--gx", x.toFixed(1));
      el.style.setProperty("--gy", y.toFixed(1));
    };

    const onMove = (e: PointerEvent) => {
      lastPointer = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        // Layer parallax, -1..1 across the composition.
        const px = ((e.clientX - r.left) / r.width) * 2 - 1;
        const py = ((e.clientY - r.top) / r.height) * 2 - 1;
        el.style.setProperty("--px", Math.max(-1, Math.min(1, px)).toFixed(3));
        el.style.setProperty("--py", Math.max(-1, Math.min(1, py)).toFixed(3));
        // Gaze: point the rings at the pointer, easing to full travel as the
        // pointer moves away from the eye's centre.
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const dist = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, dist / (r.width * 0.6));
        look((dx / dist) * reach * GAZE_X, (dy / dist) * reach * GAZE_Y);
      });
    };

    // Idle glances when nothing is steering the eye.
    const idle = window.setInterval(() => {
      if (performance.now() - lastPointer < 3500) return;
      if (Math.random() < 0.35) return look(0, 0);
      look((Math.random() * 2 - 1) * GAZE_X * 0.8, (Math.random() * 2 - 1) * GAZE_Y);
    }, 2400);

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(idle);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  // SVG <image> can't use next/image directly; borrow its optimised URL.
  const pupilSrc = product
    ? getImageProps({ src: product.image, alt: "", width: 360, height: 360 }).props.src
    : undefined;

  return (
    // .eye-hover: hovering anywhere on the composition, or focusing the
    // card link, lifts the pupil and fires the beam (see globals.css). The
    // card is a descendant, so the block stays hovered while the pointer
    // travels down the beam to it.
    <div className="eye-hover mx-auto w-full max-w-[580px]">
      <div ref={ref} className="relative aspect-square w-full text-foreground">
        {/* Far: horizon, ghost lenses, tick halo. */}
        <svg viewBox="0 0 600 600" aria-hidden="true" className="parallax absolute inset-0 size-full [--depth:5px]">
          <path d="M-40 300H640" stroke="currentColor" strokeWidth={1} />
          {GHOSTS.map((d, i) => (
            <path key={d} d={d} fill="none" stroke="currentColor" strokeWidth={1} opacity={i === 0 ? 0.55 : 0.3} />
          ))}
          <circle cx={C} cy={C} r={288} fill="none" stroke="currentColor" strokeWidth={1} />
          <g className="svg-spin animate-spin-slow">
            <path d={HALO_TICKS} stroke="currentColor" strokeWidth={1.5} />
            <circle cx={C} cy={C} r={288} fill="none" />
          </g>
        </svg>

        {/* Middle: two nazar beads on a slow orbit. */}
        <svg viewBox="0 0 600 600" aria-hidden="true" className="parallax absolute inset-0 size-full [--depth:-16px]">
          <g className="svg-spin animate-spin-reverse [animation-duration:150s]">
            <circle cx={C} cy={C} r={250} fill="none" />
            <Bead cx={477} cy={123} r={34} />
            <Bead cx={123} cy={477} r={20} />
          </g>
        </svg>

        {/* The eye. */}
        <svg viewBox="0 0 600 600" aria-hidden="true" className="absolute inset-0 size-full overflow-visible">
          <defs>
            <clipPath id="eye-lens">
              <path d={EYE} />
            </clipPath>
            <clipPath id="eye-pupil">
              <circle cx={C} cy={C} r={PUPIL_R} />
            </clipPath>
          </defs>

          <g className="eye-blink">
            <g clipPath="url(#eye-lens)">
              <path d={EYE} fill="currentColor" />
              <g className="eye-gaze">
                <circle cx={C} cy={C} r={RING_R} fill="var(--background)" />
                <g fill="none" stroke="currentColor" strokeWidth={1.2}>
                  {HAIRLINES.map((r) => (
                    <circle key={r} cx={C} cy={C} r={r} />
                  ))}
                </g>
                <circle className="eye-shadow" cx={C} cy={C} r={PUPIL_R} fill="currentColor" />
                <g className="eye-pupil">
                  <circle cx={C} cy={C} r={PUPIL_R + 1} fill="var(--background)" />
                  {pupilSrc ? (
                    <g clipPath="url(#eye-pupil)">
                      <image
                        href={pupilSrc}
                        x={C - PUPIL_R}
                        y={C - PUPIL_R}
                        width={PUPIL_R * 2}
                        height={PUPIL_R * 2}
                        preserveAspectRatio="xMidYMid slice"
                        className="eye-pupil-image"
                      />
                    </g>
                  ) : (
                    <circle cx={C} cy={C} r={PUPIL_R} fill="currentColor" />
                  )}
                  <circle cx={C} cy={C} r={PUPIL_R} fill="none" stroke="currentColor" strokeWidth={4} />
                </g>
                {/* Catchlight, riding the hairline band. */}
                <circle cx={C + 106} cy={C - 106} r={11} fill="var(--background)" stroke="currentColor" strokeWidth={2.5} />
              </g>
            </g>
            <path d={EYE} fill="none" stroke="currentColor" strokeWidth={2} />
          </g>

          {product && (
            // Hit-testable on purpose: the lit beam bridges the eye and the
            // card, so the pointer keeps the composition hovered on the way down.
            <g>
              <g className="eye-fan">
                {BANDS.map((d, i) => (
                  <path
                    key={d}
                    d={d}
                    fill="currentColor"
                    fillOpacity={BAND_TONES[i]}
                    stroke="var(--background)"
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                  />
                ))}
              </g>
            </g>
          )}
        </svg>

        {product && (
          // The card link below is the accessible one; this only makes the
          // pupil clickable.
          <Link
            href={product.href}
            tabIndex={-1}
            aria-hidden="true"
            className="absolute top-[27%] left-[27%] size-[46%] rounded-full"
          />
        )}
      </div>

      {product && (
        <div className="relative">
          {/* Touch screens can't hover, so they get a plain caption instead. */}
          <Link
            href={product.href}
            className="mx-auto mt-2 flex w-fit max-w-full flex-col items-center gap-1.5 text-center [@media(hover:hover)]:hidden"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              N°01 — Featured
            </span>
            <span className="text-base font-medium tracking-[-0.01em] text-balance">
              {product.name}
              <span className="ml-3 font-mono text-sm text-muted-foreground tabular-nums">{product.priceLabel}</span>
            </span>
          </Link>

          {/* Pointer screens: the card the beam projects. It floats below the
              eye rather than reserving space, so nothing sits there at rest. */}
          <Link
            href={product.href}
            className="eye-card absolute inset-x-0 top-3 z-20 mx-auto hidden before:absolute before:inset-x-0 before:-top-4 before:h-4 w-[min(100%,22rem)] items-center gap-4 border border-foreground bg-background p-3 text-left shadow-[6px_6px_0_0_var(--foreground)] outline-offset-4 [@media(hover:hover)]:flex"
          >
            <span className="relative size-20 shrink-0 overflow-hidden rounded-full border border-foreground bg-secondary">
              <Image src={product.image} alt="" fill sizes="80px" className="object-cover" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                N°01 — {product.category ?? "Featured"}
              </span>
              <span className="mt-1 line-clamp-2 block text-sm leading-snug font-medium">{product.name}</span>
              <span className="mt-2 flex items-center justify-between font-mono text-xs">
                <span className="tabular-nums">{product.priceLabel}</span>
                <span className="uppercase tracking-[0.16em]">View →</span>
              </span>
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
