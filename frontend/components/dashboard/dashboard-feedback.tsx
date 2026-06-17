import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Banner, BannerIcon, BannerTitle } from "@/components/ui/kibo-ui/banner";
import { Spinner } from "@/components/ui/kibo-ui/spinner";
import {
  IntelligenceShell,
  SignalModule,
} from "@/components/ui/kibo-ui/intelligence";
import { Button } from "@/components/ui/button";
import { ProgressiveLoading } from "@/components/shared/progressive-loading";

export function PartialErrorsBanner({ errors }: { errors: string[] }) {
  if (!errors.length) return null;

  return (
    <Banner inset className="border bg-secondary text-secondary-foreground">
      <BannerIcon icon={TriangleAlert} />
      <BannerTitle>Some data did not load. {errors.join(" ")}</BannerTitle>
    </Banner>
  );
}

export function LoadingState({
  isCompleting,
  isLoading,
  ticker,
}: {
  isCompleting: boolean;
  isLoading: boolean;
  ticker: string;
}) {
  return (
    <IntelligenceShell className="flex flex-col">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6">
        <Button asChild variant="ghost">
          <Link href="/">StockSentiment</Link>
        </Button>
      </header>
      <main className="flex flex-1 items-center justify-center px-4">
        <SignalModule className="w-full max-w-md text-center">
          <Spinner className="mx-auto" size={36} variant="ring" />
          <h1 className="mt-4 text-lg font-semibold">Checking Reddit against {ticker}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            If Render is waking up, this can take a couple minutes.
          </p>
          <div className="mt-5">
            <ProgressiveLoading isCompleting={isCompleting} isLoading={isLoading} />
          </div>
        </SignalModule>
      </main>
    </IntelligenceShell>
  );
}

export function ErrorState({ error, ticker }: { error: string; ticker: string }) {
  return (
    <IntelligenceShell className="flex flex-col">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6">
        <Button asChild variant="ghost">
          <Link href="/">StockSentiment</Link>
        </Button>
      </header>
      <main className="flex flex-1 items-center justify-center px-4">
        <SignalModule className="w-full max-w-md text-center">
          <TriangleAlert className="mx-auto size-8 text-destructive" />
          <h1 className="mt-4 text-lg font-semibold">Could not analyze {ticker}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{error}</p>
          <div className="mt-5 flex justify-center gap-2">
            <Button onClick={() => window.location.reload()}>Try again</Button>
            <Button asChild variant="outline">
              <Link href="/">Pick another ticker</Link>
            </Button>
          </div>
        </SignalModule>
      </main>
    </IntelligenceShell>
  );
}
