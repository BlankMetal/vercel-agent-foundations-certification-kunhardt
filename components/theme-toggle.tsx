"use client";

import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// A half-lit disc. The rotation is driven by the `.dark` class in CSS (see
// .theme-glyph in globals.css), so the server render never has to know the
// theme and there is nothing to mismatch on hydration.
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle colour theme"
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" className="theme-glyph size-[18px]">
        <circle cx={10} cy={10} r={7.5} fill="none" stroke="currentColor" strokeWidth={1.75} />
        <path d="M10 2.5A7.5 7.5 0 0 0 10 17.5Z" fill="currentColor" />
      </svg>
    </button>
  );
}
