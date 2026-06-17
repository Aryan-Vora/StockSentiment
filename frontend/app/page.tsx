import Image from "next/image";
import Link from "next/link";
import { Pill } from "@/components/ui/kibo-ui/pill";
import {
  IntelligenceShell,
  IntelligenceTopbar,
  IntelligenceTopbarInner,
} from "@/components/ui/kibo-ui/intelligence";
import { Button } from "@/components/ui/button";
import { TickerSearchForm } from "@/components/shared/ticker-search-form";

const popularTickers = ["GME", "AAPL", "NVDA", "TSLA"];

export default function Home() {
  return (
    <IntelligenceShell>
      <IntelligenceTopbar className="static bg-background/92">
        <IntelligenceTopbarInner className="max-w-6xl">
          <Button asChild variant="ghost">
            <Link href="/">StockSentiment</Link>
          </Button>
        </IntelligenceTopbarInner>
      </IntelligenceTopbar>

      <main className="relative isolate overflow-hidden bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)))]">
        {/* <div className="pointer-events-none absolute left-1/2 top-16 -z-20 h-[250px] w-[580px] -translate-x-1/2 -rotate-3 opacity-100 sm:top-20 sm:h-[360px] sm:w-[900px]  xl:top-24 xl:h-[430px] xl:w-[1120px]">
          <Image
            alt=""
            aria-hidden="true"
            className="h-full w-full object-contain"
            fill
            priority
            sizes="(max-width: 640px) 580px, (max-width: 1280px) 900px, 1120px"
            src="/brand/sentiment-panel.png"
          />
        </div> */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,hsl(var(--background)/0.74),hsl(var(--background)/0.68)_42%,hsl(var(--background)/0.94)_100%)]" />

        <section className="mx-auto flex min-h-[calc(100svh-3.5rem)] w-full max-w-6xl items-start px-4 pb-8 pt-10 sm:px-6 sm:pt-20 xl:pt-28">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-normal sm:text-6xl sm:leading-none">
              Reddit Sentiment Against Market Data
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Type a ticker and compare Reddit discussion with real market data in one compact read.
            </p>

            <TickerSearchForm className="mt-6 max-w-xl" />
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="inline-flex items-center gap-2 px-1 text-xs font-medium text-foreground">
                <span className="size-2 rounded-full bg-sky-500" />
                Popular
              </span>
              {popularTickers.map((ticker) => (
                <Link href={`/dashboard?ticker=${ticker}`} key={ticker}>
                  <Pill variant="outline">{ticker}</Pill>
                </Link>
              ))}
            </div>

            <div className="mt-7 w-full overflow-hidden rounded-lg border bg-card/88 shadow-sm backdrop-blur-sm">
              <h2 className="sr-only">What it does</h2>
              <div className="grid text-center sm:grid-cols-3">
                <div className="px-4 py-4">
                  <Pill className="border-transparent bg-primary text-primary-foreground" variant="outline">
                    01
                  </Pill>
                  <p className="mt-2 font-semibold">Reddit</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Finds recent posts that mention the ticker.
                  </p>
                </div>
                <div className="px-4 py-4 sm:border-l">
                  <Pill className="border-transparent bg-primary text-primary-foreground" variant="outline">
                    02
                  </Pill>
                  <p className="mt-2 font-semibold">VADER</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Scores each post as positive, neutral, or negative.
                  </p>
                </div>
                <div className="px-4 py-4 sm:border-l">
                  <Pill className="border-transparent bg-primary text-primary-foreground" variant="outline">
                    03
                  </Pill>
                  <p className="mt-2 font-semibold">Real Data</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Lines the mood up with historical price movement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </IntelligenceShell>
  );
}
