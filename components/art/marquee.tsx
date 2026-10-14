import { cn } from "@/lib/utils";

// An endless ribbon. The track holds two identical runs and slides by half its
// width, so the second run lands exactly where the first began. The copy is
// hidden from assistive tech, so `children` is announced once.
export function Marquee({
  children,
  className,
  duration = 48,
  reverse = false,
}: {
  children: React.ReactNode;
  className?: string;
  /** Seconds per loop. */
  duration?: number;
  reverse?: boolean;
}) {
  return (
    <div className={cn("group/marquee flex overflow-hidden", className)}>
      <div
        className="flex w-max shrink-0 animate-marquee group-hover/marquee:[animation-play-state:paused]"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? "reverse" : undefined,
        }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
