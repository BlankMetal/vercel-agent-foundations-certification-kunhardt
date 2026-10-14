import { cn } from "@/lib/utils";
import { createRandom } from "./random";

// Ponti-style ceramic tiles. Each motif is drawn in a 100x100 cell, in ink
// (currentColor) on paper. "Paper" is whatever surface the tiles sit on, so an
// inverted section (bg-foreground text-background) passes
// paper="var(--foreground)".

export const TILE_MOTIFS = [
  "quarter",
  "half",
  "diag",
  "rings",
  "dot",
  "arch",
  "split",
  "bars",
  "lens",
  "bow",
  "target",
  "steps",
  "blank",
  "solid",
] as const;

export type TileMotif = (typeof TILE_MOTIFS)[number];

// The default palette leaves out "solid" and "blank" so a field doesn't read
// as noise; they come back through inversion and explicit motif lists.
const DEFAULT_MOTIFS: readonly TileMotif[] = [
  "quarter",
  "quarter",
  "half",
  "diag",
  "rings",
  "dot",
  "arch",
  "split",
  "bars",
  "lens",
  "bow",
  "target",
  "steps",
];

const ROTATIONS = [0, 90, 180, 270] as const;

function arcRings(radii: number[]) {
  // Quarter arcs centred on the bottom-left corner.
  return radii.map((r) => `M${r} 100A${r} ${r} 0 0 0 0 ${100 - r}`).join("");
}

function Motif({ motif, ink, paper }: { motif: TileMotif; ink: string; paper: string }) {
  switch (motif) {
    case "quarter":
      return <path d="M0 0H100A100 100 0 0 1 0 100Z" fill={ink} />;
    case "half":
      return <path d="M0 100A50 50 0 0 1 100 100Z" fill={ink} />;
    case "diag":
      return <path d="M0 0H100V100Z" fill={ink} />;
    case "rings":
      return (
        <path
          d={arcRings([16, 34, 52, 70, 88])}
          fill="none"
          stroke={ink}
          strokeWidth={8}
        />
      );
    case "dot":
      return <circle cx={50} cy={50} r={24} fill={ink} />;
    case "arch":
      return <path d="M18 100V52A32 32 0 0 1 82 52V100Z" fill={ink} />;
    case "split":
      return (
        <>
          <circle cx={50} cy={50} r={34} fill="none" stroke={ink} strokeWidth={6} />
          <path d="M50 16A34 34 0 0 0 50 84Z" fill={ink} />
        </>
      );
    case "bars":
      return (
        <path d="M0 0h12.5v100H0zM25 0h12.5v100H25zM50 0h12.5v100H50zM75 0h12.5v100H75z" fill={ink} />
      );
    case "lens":
      return <path d="M0 50A70 70 0 0 1 100 50A70 70 0 0 1 0 50Z" fill={ink} />;
    case "bow":
      return (
        <path
          d="M0 0H50A50 50 0 0 1 0 50ZM100 100H50A50 50 0 0 1 100 50Z"
          fill={ink}
        />
      );
    case "target":
      return (
        <>
          <circle cx={50} cy={50} r={40} fill={ink} />
          <circle cx={50} cy={50} r={27} fill={paper} />
          <circle cx={50} cy={50} r={14} fill={ink} />
        </>
      );
    case "steps":
      return <path d="M0 100V75H25V50H50V25H75V0H100V100Z" fill={ink} />;
    case "solid":
      return <rect width={100} height={100} fill={ink} />;
    case "blank":
      return null;
  }
}

interface TileProps {
  motif: TileMotif;
  rotate?: number;
  invert?: boolean;
  paper?: string;
}

/** One tile, drawn in a 100x100 cell. Use inside an <svg>. */
export function Tile({ motif, rotate = 0, invert = false, paper = "var(--background)" }: TileProps) {
  const ink = invert ? paper : "currentColor";
  const ground = invert ? "currentColor" : "transparent";
  return (
    <>
      {/* Always present: gives the tile a 100x100 fill-box to rotate about. */}
      <rect width={100} height={100} fill={ground} />
      <g transform={rotate ? `rotate(${rotate} 50 50)` : undefined}>
        <Motif motif={motif} ink={ink} paper={invert ? "currentColor" : paper} />
      </g>
    </>
  );
}

interface TileFieldProps {
  cols: number;
  rows: number;
  /** Same seed, same wall. Use a product id to give each product its own. */
  seed?: string;
  motifs?: readonly TileMotif[];
  /** Share of tiles drawn paper-on-ink. */
  invert?: number;
  /** Share of tiles that slowly turn, a quarter at a time. */
  animate?: number;
  /** Tiles turn a quarter on hover. */
  interactive?: boolean;
  /** Draw thin grout lines between tiles. */
  grout?: boolean;
  paper?: string;
  className?: string;
  /** "slice" crops to fill the box; "meet" letterboxes. */
  fit?: "slice" | "meet";
}

/** A deterministic wall of Ponti tiles. Server-safe: no hooks, no effects. */
export function TileField({
  cols,
  rows,
  seed = "ship-it",
  motifs = DEFAULT_MOTIFS,
  invert = 0.18,
  animate = 0,
  interactive = false,
  grout = true,
  paper = "var(--background)",
  className,
  fit = "slice",
}: TileFieldProps) {
  const rand = createRandom(seed);
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const motif = rand.pick(motifs);
      const rotate = rand.pick(ROTATIONS);
      const inverted = rand.next() < invert;
      const turns = rand.next() < animate;
      const delay = (-rand.next() * 24).toFixed(2);
      const duration = (18 + rand.next() * 14).toFixed(1);
      cells.push(
        <g
          key={`${r}-${c}`}
          transform={`translate(${c * 100} ${r * 100})`}
          className={interactive ? "tile-cell" : undefined}
        >
          <g
            className={turns ? "tile-turn" : interactive ? "tile-spin" : undefined}
            style={turns ? { animationDelay: `${delay}s`, animationDuration: `${duration}s` } : undefined}
          >
            <Tile motif={motif} rotate={rotate} invert={inverted} paper={paper} />
          </g>
        </g>,
      );
    }
  }

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${cols * 100} ${rows * 100}`}
      preserveAspectRatio={`xMidYMid ${fit}`}
      className={cn("block", interactive ? "" : "pointer-events-none", className)}
    >
      {cells}
      {grout && (
        <path
          d={[
            ...Array.from({ length: cols - 1 }, (_, i) => `M${(i + 1) * 100} 0V${rows * 100}`),
            ...Array.from({ length: rows - 1 }, (_, i) => `M0 ${(i + 1) * 100}H${cols * 100}`),
          ].join("")}
          stroke={paper}
          strokeWidth={3}
          fill="none"
          className="pointer-events-none"
        />
      )}
    </svg>
  );
}

/** A single tile as an inline glyph, for icons and typographic ornaments. */
export function TileGlyph({
  motif,
  rotate = 0,
  invert = false,
  className,
  paper,
}: {
  motif: TileMotif;
  rotate?: number;
  invert?: boolean;
  className?: string;
  paper?: string;
}) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 100 100" className={cn("inline-block", className)}>
      <Tile motif={motif} rotate={rotate} invert={invert} paper={paper} />
    </svg>
  );
}

/**
 * Stock as a moon phase: full disc in stock, half disc running low, empty ring
 * sold out, and a dotted ring while checking.
 */
export function PhaseGlyph({
  phase,
  className,
}: {
  phase: "full" | "half" | "empty" | "unknown";
  className?: string;
}) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 20 20" className={cn("inline-block size-3.5 shrink-0", className)}>
      {phase === "unknown" ? (
        <circle
          cx={10}
          cy={10}
          r={8}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeDasharray="2 3"
          className="svg-spin animate-orbit [animation-duration:6s]"
        />
      ) : (
        <>
          <circle cx={10} cy={10} r={8} fill="none" stroke="currentColor" strokeWidth={2} />
          {phase === "full" && <circle cx={10} cy={10} r={8} fill="currentColor" />}
          {phase === "half" && <path d="M10 2A8 8 0 0 0 10 18Z" fill="currentColor" />}
        </>
      )}
    </svg>
  );
}
