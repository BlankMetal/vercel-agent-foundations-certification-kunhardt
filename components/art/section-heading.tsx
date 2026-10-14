import { cn } from "@/lib/utils";

// Catalogue-style section header: a numbered mono eyebrow over a display
// title, with an optional action pinned to the baseline.
export function SectionHeading({
  index,
  eyebrow,
  title,
  action,
  className,
  as: Heading = "h2",
}: {
  index?: string;
  eyebrow: string;
  title: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className={cn("flex items-end justify-between gap-6 border-b border-foreground pb-4", className)}>
      <div className="min-w-0">
        <Eyebrow index={index}>{eyebrow}</Eyebrow>
        <Heading className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl">
          {title}
        </Heading>
      </div>
      {action && <div className="shrink-0 pb-1">{action}</div>}
    </div>
  );
}

export function Eyebrow({
  index,
  children,
  className,
}: {
  index?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground",
        className,
      )}
    >
      {index && <span className="text-foreground">{index}</span>}
      <span aria-hidden="true" className="h-px w-8 bg-current opacity-60" />
      <span>{children}</span>
    </p>
  );
}
