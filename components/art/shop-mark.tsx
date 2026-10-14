import { cn } from "@/lib/utils";

// The Ship It Shop mark: the Vercel triangle set in a disc, with an orbit
// ring that turns a quarter when the surrounding `group` is hovered.
export function ShopMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 40 40" className={cn("size-7 shrink-0", className)}>
      <circle cx={20} cy={20} r={13} fill="currentColor" />
      <path d="M20 12.5L27 24.5H13Z" fill="var(--background)" />
      <g className="svg-spin transition-transform duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] group-hover:rotate-90">
        <path
          d="M20 1.5A18.5 18.5 0 0 1 38.5 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        />
        <circle cx={38.5} cy={20} r={1.5} fill="currentColor" />
        {/* Keeps the fill-box square so the arc turns about the disc's centre. */}
        <rect x={1.5} y={1.5} width={37} height={37} fill="none" />
      </g>
    </svg>
  );
}
