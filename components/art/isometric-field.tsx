import { cn } from "@/lib/utils";

// An endless field of isometric cubes (Escher's tumbling blocks, by way of
// Manifold Garden) falling forever. Each cube has a paper top, an ink left
// face, and a hatched right face. The pattern repeats every 52 x 90 units, and
// the field falls by exactly one period per loop, so the fall never resets
// visibly.

const W = 52;
const H = 90;

function Cube({ x, y, paper }: { x: number; y: number; paper: string }) {
  // Hatch lines run down the right face, from its top edge to its bottom edge.
  const hatch = [0.25, 0.5, 0.75].map((f) => {
    const hx = x + 26 + 26 * f;
    const top = y + 30 - 15 * f;
    return `M${hx} ${top}V${top + 30}`;
  });
  return (
    <g>
      <path d={`M${x} ${y + 15}L${x + 26} ${y}L${x + 52} ${y + 15}L${x + 26} ${y + 30}Z`} fill={paper} />
      <path d={`M${x} ${y + 15}L${x + 26} ${y + 30}V${y + 60}L${x} ${y + 45}Z`} fill="currentColor" />
      <path d={`M${x + 26} ${y + 30}L${x + 52} ${y + 15}V${y + 45}L${x + 26} ${y + 60}Z`} fill={paper} />
      <path d={hatch.join("")} stroke="currentColor" strokeWidth={1.4} />
      <path
        d={`M${x} ${y + 15}L${x + 26} ${y}L${x + 52} ${y + 15}V${y + 45}L${x + 26} ${y + 60}L${x} ${y + 45}Z`}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.75}
      />
    </g>
  );
}

// Every cube that can overlap one pattern tile, so edges stitch across tiles.
const POSITIONS: [number, number][] = [
  [0, 0],
  [W / 2, H / 2],
  [-W / 2, H / 2],
  [W / 2, -H / 2],
  [-W / 2, -H / 2],
];

export function IsometricField({
  id,
  scale = 1,
  paper = "var(--background)",
  animate = true,
  className,
}: {
  /** Pattern id; must be unique on the page. */
  id: string;
  scale?: number;
  paper?: string;
  animate?: boolean;
  className?: string;
}) {
  const period = H * scale;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
    >
      <defs>
        <pattern
          id={id}
          width={W}
          height={H}
          patternUnits="userSpaceOnUse"
          patternTransform={`scale(${scale})`}
        >
          {POSITIONS.map(([x, y]) => (
            <Cube key={`${x},${y}`} x={x} y={y} paper={paper} />
          ))}
        </pattern>
      </defs>
      <g
        className={animate ? "iso-fall" : undefined}
        style={{ ["--iso-period" as string]: `${period}px` }}
      >
        <rect x={0} y={-period} width="4000" height="4000" fill={`url(#${id})`} />
      </g>
    </svg>
  );
}
