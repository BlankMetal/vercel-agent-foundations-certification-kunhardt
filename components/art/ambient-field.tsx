import { cn } from "@/lib/utils";

// Fixed, full-viewport Kandinsky layer that sits under every page: two very
// large compositions of rings and swoops turning over minutes. It paints at
// z-index -10, above the <html> ground and under in-flow content (see the note
// in globals.css), and only transforms, so it stays on the compositor.

function rings(cx: number, cy: number, from: number, to: number, step: number) {
  const out = [];
  for (let r = from; r <= to; r += step) {
    out.push(<circle key={r} cx={cx} cy={cy} r={r} />);
  }
  return out;
}

export function AmbientField({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden text-foreground", className)}
    >
      <svg
        viewBox="0 0 800 800"
        className="absolute -top-[28vmax] -right-[26vmax] size-[78vmax] animate-spin-slower opacity-[0.07] will-change-transform"
      >
        <g fill="none" stroke="currentColor" strokeWidth={1}>
          {rings(400, 400, 120, 390, 18)}
        </g>
        <path d="M400 10A390 390 0 0 1 790 400L400 400Z" fill="currentColor" opacity={0.35} />
        <circle cx={400} cy={400} r={58} fill="currentColor" />
        <path
          d="M40 520C180 300 420 260 760 300"
          fill="none"
          stroke="currentColor"
          strokeWidth={10}
          strokeLinecap="round"
        />
      </svg>

      <svg
        viewBox="0 0 800 800"
        className="absolute -bottom-[34vmax] -left-[30vmax] size-[84vmax] animate-spin-reverse opacity-[0.06] will-change-transform"
      >
        <g fill="none" stroke="currentColor" strokeWidth={1.25}>
          {rings(180, 620, 40, 560, 26)}
        </g>
        <circle cx={560} cy={240} r={110} fill="none" stroke="currentColor" strokeWidth={14} />
        <circle cx={560} cy={240} r={36} fill="currentColor" />
        <path d="M120 120L700 700" stroke="currentColor" strokeWidth={2} />
        <path d="M220 60L660 760" stroke="currentColor" strokeWidth={1} />
      </svg>
    </div>
  );
}
