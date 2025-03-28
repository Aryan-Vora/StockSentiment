'use client'
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import dynamic from 'next/dynamic';

// Tech to import dynamically while disabling SSR (lets us build without the window is not defined error)
// bless up https://sentry.io/answers/window-is-not-defined/#resolving-in-nextjs
// const NetworkAnimation = dynamic(
//   () => import("@/components/network-animation").then((mod) => mod.NetworkAnimation),
//   { ssr: false }
// );

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="#">
          <span className="font-bold text-xl">StockSentiment</span>
        </Link>
      </header>
      <main className="flex-1">
        {/* <NetworkAnimation /> */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Track Market Sentiment in Real-Time
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Analyze social media and news sentiment for any stock ticker.
                  Make more informed investment decisions.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form action="/dashboard" className="flex space-x-2">
                  <input
                    className="flex h-10 w-full rounded-md border border-gray-700 bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:border-[3px] focus-visible:border-primary focus-visible:outline-none dark:text-gray-200 dark:placeholder:text-gray-400"                    
                    placeholder="Enter stock ticker (e.g., AAPL)"
                    type="text"
                    name="ticker"
                    required
                  />
                  <Button type="submit">
                    Analyze
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Try popular tickers: TSLA, AAPL, MSFT, AMZN, GOOGL
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
