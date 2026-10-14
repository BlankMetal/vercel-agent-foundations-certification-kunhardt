import Link from "next/link";
import { Search } from "lucide-react";
import { AgentButton } from "@/components/agent-button";
import { CartButton } from "@/components/cart-button";
import { ShopMark } from "@/components/art/shop-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { headerIconClass } from "@/components/header-icon-class";

const NAV = [
  { href: "/search", label: "Catalog" },
  { href: "/search?category=hoodies", label: "Hoodies" },
  { href: "/search?category=mugs", label: "Mugs" },
  { href: "/search?category=desk", label: "Desk" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <ShopMark />
          <span className="text-[15px] font-semibold tracking-[-0.02em]">Ship It Shop</span>
        </Link>

        <nav
          aria-label="Shop"
          className="hidden flex-1 items-center justify-center gap-7 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground md:flex"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative py-1 transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-foreground after:transition-transform after:duration-500 hover:text-foreground hover:after:scale-x-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-0.5">
          <Link href="/search" className={headerIconClass} aria-label="Search products">
            <Search className="size-[18px]" />
          </Link>
          <CartButton />
          <AgentButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
