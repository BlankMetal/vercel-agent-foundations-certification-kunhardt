import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IsometricField } from "@/components/art/isometric-field";
import { Eyebrow } from "@/components/art/section-heading";

export default function ProductNotFound() {
  return (
    <div className="relative isolate flex flex-1 items-center justify-center overflow-hidden px-4 py-32">
      <IsometricField
        id="not-found-cubes"
        scale={1.4}
        className="-z-10 opacity-[0.14] [mask-image:radial-gradient(closest-side,transparent_35%,black)]"
      />
      <div className="max-w-md border border-foreground bg-background px-8 py-10 text-center">
        <Eyebrow index="404" className="justify-center">
          Lost in the stacks
        </Eyebrow>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em]">
          Product Not Found
        </h1>
        <p className="mt-3 text-muted-foreground">
          The product you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Button asChild className="mt-8 h-11 rounded-full px-6">
          <Link href="/search">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Search
          </Link>
        </Button>
      </div>
    </div>
  );
}
