import Link from "next/link"
import { Button } from "@/components/ui/button"
import { KandinskyGlyph } from "@/components/art/kandinsky-glyph"

interface SearchEmptyProps {
  query: string
}

export function SearchEmpty({ query }: SearchEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-foreground/40 px-6 py-16 text-center">
      <KandinskyGlyph className="size-36" />
      <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-foreground">No products found</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {query
          ? `We couldn't find any products matching "${query}"`
          : "No products match the selected filters"}
      </p>
      <Button variant="outline" asChild className="mt-6 h-11 rounded-full border-foreground px-6">
        <Link href="/search">Clear filters</Link>
      </Button>
    </div>
  )
}
