import { KandinskyGlyph } from "@/components/art/kandinsky-glyph";
import { cn } from "@/lib/utils";

// Shown before the first message in either agent chat.
export function AgentEmptyState({
  eyebrow,
  title,
  description,
  starters,
  onStarter,
  disabled,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  /** Optional one-tap prompts. */
  starters?: string[];
  onStarter?: (text: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-10 text-center", className)}>
      <KandinskyGlyph className="size-36" />
      <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-balance">{title}</h2>
      <p className="mt-2 max-w-xs text-sm text-pretty text-muted-foreground">{description}</p>
      {starters && starters.length > 0 && (
        <ul className="mt-8 w-full max-w-xs border-t border-foreground text-left">
          {starters.map((s, i) => (
            <li key={s} className="border-b border-border">
              <button
                type="button"
                onClick={() => onStarter?.(s)}
                disabled={disabled}
                className="group flex w-full items-baseline gap-3 py-3 text-sm transition-colors hover:text-muted-foreground disabled:opacity-50"
              >
                <span className="font-mono text-[10px] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">{s}</span>
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
