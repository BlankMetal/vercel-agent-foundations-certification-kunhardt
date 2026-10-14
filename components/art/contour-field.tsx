"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Stacked contour lines lifted by a few drifting Gaussian swells, each line
// filled underneath so nearer lines hide farther ones. The Floating Points /
// Unknown Pleasures look.
//
// Colours come from CSS so the canvas follows the theme: ink is the canvas's
// `color`, paper is `--contour-paper` (falling back to `--background`). An
// inverted section sets `[--contour-paper:var(--foreground)]`.

const FRAME_MS = 1000 / 30;

const SWELLS = [
  { phase: 0.0, speed: 0.07, width: 0.07, amp: 1.0 },
  { phase: 1.9, speed: 0.05, width: 0.11, amp: 0.7 },
  { phase: 3.7, speed: 0.09, width: 0.05, amp: 0.9 },
  { phase: 5.1, speed: 0.04, width: 0.16, amp: 0.45 },
];

export function ContourField({
  className,
  lines = 34,
  amplitude = 1,
}: {
  className?: string;
  lines?: number;
  /** Multiplier on swell height. */
  amplitude?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let ink = "#000";
    let paper = "#fff";
    let raf = 0;
    let last = 0;
    let frame = 0;
    let onScreen = true;

    const readColors = () => {
      const style = getComputedStyle(canvas);
      ink = style.color;
      paper =
        style.getPropertyValue("--contour-paper").trim() ||
        style.getPropertyValue("--background").trim() ||
        "#fff";
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (seconds: number) => {
      ctx.clearRect(0, 0, width, height);
      if (width === 0 || height === 0) return;
      const gap = height / (lines + 6);
      const lift = gap * 7 * amplitude;
      const steps = Math.max(48, Math.round(width / 7));
      ctx.lineWidth = 1;
      ctx.lineJoin = "round";

      for (let i = 0; i < lines; i++) {
        const v = i / (lines - 1);
        const baseline = gap * (i + 5);
        // Lines in the middle of the stack swell most.
        const band = 0.3 + 0.7 * Math.sin(Math.PI * v);
        const line = new Path2D();
        for (let s = 0; s <= steps; s++) {
          const u = s / steps;
          let d = 0;
          for (const w of SWELLS) {
            const centre = 0.5 + 0.36 * Math.sin(seconds * w.speed + w.phase + v * 1.1);
            const dx = (u - centre) / w.width;
            d += w.amp * Math.exp(-dx * dx);
          }
          // Taper to flat at the left and right edges.
          const edge = Math.sin(Math.PI * u) ** 2;
          const ripple = 0.06 * Math.sin(u * 18 + seconds * 0.7 + i * 0.5);
          const y = baseline - (d * edge + ripple) * lift * band;
          if (s === 0) line.moveTo(0, y);
          else line.lineTo(u * width, y);
        }
        const area = new Path2D(line);
        area.lineTo(width, height);
        area.lineTo(0, height);
        area.closePath();
        ctx.fillStyle = paper;
        ctx.fill(area);
        ctx.strokeStyle = ink;
        ctx.stroke(line);
      }
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!onScreen || document.hidden || now - last < FRAME_MS) return;
      last = now;
      // Theme switches change the computed colours; re-read every second.
      if (frame++ % 30 === 0) readColors();
      draw(now / 1000);
    };

    readColors();
    resize();

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw(12);
    });
    resizeObserver.observe(canvas);

    if (reduceMotion) {
      draw(12);
      // Still follow theme changes, without animating.
      const themeObserver = new MutationObserver(() => {
        readColors();
        draw(12);
      });
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      return () => {
        resizeObserver.disconnect();
        themeObserver.disconnect();
      };
    }

    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    visibility.observe(canvas);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      visibility.disconnect();
    };
  }, [lines, amplitude]);

  return <canvas ref={ref} aria-hidden="true" className={cn("pointer-events-none block", className)} />;
}
