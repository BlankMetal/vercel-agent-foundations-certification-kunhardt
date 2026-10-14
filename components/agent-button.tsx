"use client"

import { useSidebar } from "@/components/ui/sidebar"
import { headerIconClass } from "@/components/header-icon-class"
import { cn } from "@/lib/utils"

// The agent's glyph: a sun with one planet. It speeds into orbit while the
// panel is open.
export function AgentGlyph({ active = false, className }: { active?: boolean; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={cn("size-[18px]", className)}>
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <g className={cn("svg-spin", active && "animate-orbit [animation-duration:5s]")}>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2.6" />
        <circle cx="21" cy="12" r="2.25" fill="currentColor" />
        <rect x="1.5" y="1.5" width="21" height="21" fill="none" />
      </g>
    </svg>
  )
}

export function AgentButton({
  className,
  children,
}: {
  className?: string
  /** When set, renders as a labelled pill instead of an icon button. */
  children?: React.ReactNode
}) {
  const { open, openMobile, isMobile, toggleSidebar } = useSidebar()
  const isOpen = isMobile ? openMobile : open

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label={children ? undefined : "Toggle agent panel"}
      aria-expanded={isOpen}
      className={cn(children ? undefined : headerIconClass, isOpen && !children && "text-foreground", className)}
    >
      <AgentGlyph active={isOpen} />
      {children}
    </button>
  )
}
