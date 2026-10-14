import { cn } from "@/lib/utils";

// A small, self-contained composition for empty states: concentric rings, a
// planet on a slow orbit, a swoop, and a crossing line. Server-safe.
export function KandinskyGlyph({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 200 200"
      className={cn("size-40 text-foreground", className)}
    >
      <g fill="none" stroke="currentColor">
        <circle cx={100} cy={100} r={78} strokeWidth={1} />
        <circle cx={100} cy={100} r={58} strokeWidth={1} opacity={0.5} />
        <circle cx={100} cy={100} r={38} strokeWidth={1} opacity={0.3} />
      </g>
      <circle cx={100} cy={100} r={20} fill="currentColor" />
      <g className="svg-spin animate-spin-slow [animation-duration:18s]">
        <circle cx={100} cy={100} r={78} fill="none" />
        <circle cx={178} cy={100} r={9} fill="var(--background)" stroke="currentColor" strokeWidth={2.5} />
      </g>
      <g className="svg-spin animate-spin-reverse [animation-duration:30s]">
        <circle cx={100} cy={100} r={58} fill="none" />
        <circle cx={100} cy={42} r={4.5} fill="currentColor" />
      </g>
      <path
        d="M14 150C54 96 128 170 188 72"
        pathLength={1}
        strokeDasharray="1 1"
        fill="none"
        stroke="currentColor"
        strokeWidth={5}
        strokeLinecap="round"
        className="animate-draw"
      />
      <path d="M24 24L176 176" stroke="currentColor" strokeWidth={1} opacity={0.6} />
      <path d="M150 14H186V50" fill="none" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}
