import type { Metadata } from "next";
import { IsometricField } from "@/components/art/isometric-field";
import { ShopMark } from "@/components/art/shop-mark";
import { Eyebrow } from "@/components/art/section-heading";
import { LoginForm, type LoginError } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const loginError: LoginError | undefined =
    error === "unconfigured" ? "unconfigured" : error ? "password" : undefined;
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* An endless fall through stacked cubes. */}
      <div className="relative isolate hidden overflow-hidden bg-foreground text-background lg:block">
        <IsometricField id="login-cubes" scale={1.5} paper="var(--foreground)" className="-z-10" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_30%_80%,var(--foreground)_10%,transparent_70%)]" />
        <div className="flex h-full flex-col justify-between p-10">
          <div className="flex items-center gap-3">
            <ShopMark className="size-8 [--background:var(--foreground)]" />
            <span className="font-semibold tracking-[-0.02em]">Ship It Shop</span>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60">
              Operations
            </p>
            <p className="mt-3 text-7xl leading-[0.85] font-semibold tracking-[-0.06em]">
              Store
              <br />
              Admin
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-12 flex items-center gap-3 lg:hidden">
            <ShopMark className="size-8" />
            <span className="font-semibold tracking-[-0.02em]">Ship It Shop</span>
          </div>
          <Eyebrow index="N°00">Restricted</Eyebrow>
          <h1 className="mt-5 text-5xl font-semibold tracking-[-0.05em]">Sign in</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Enter the admin password to open the store agent.
          </p>
          <div className="mt-10">
            <LoginForm error={loginError} />
          </div>
        </div>
      </div>
    </div>
  );
}
