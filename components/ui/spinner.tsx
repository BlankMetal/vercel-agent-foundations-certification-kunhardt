import { cn } from "@/lib/utils"

// An orbit rather than a ring: a planet circling a fixed sun. The whole glyph
// turns, which leaves the centred sun and the faint track visually still.
function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      role="status"
      aria-label="Loading"
      viewBox="0 0 24 24"
      className={cn("size-4 shrink-0 animate-orbit", className)}
      {...props}
    >
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
      <path d="M12 3A9 9 0 0 1 21 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="21" cy="12" r="2.5" fill="currentColor" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  )
}

export { Spinner }
