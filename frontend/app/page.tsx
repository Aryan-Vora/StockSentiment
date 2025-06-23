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
    <div className="flex flex-col min-h-screen max-w-full overflow-x-hidden">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="#">
          <span className="font-bold text-xl">StockSentiment</span>
        </Link>
      </header>
      <main className="flex-1">
        {/* <NetworkAnimation /> */}
        <section className="w-full py-8 md:py-12 lg:py-24 xl:py-32">
          <div className="w-full max-w-full overflow-hidden">
            <div className="px-4 lg:px-6 mx-auto">
              <div className="flex flex-col items-center space-y-6 text-center">
              <div className="space-y-4 max-w-full">
                <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl/none">
                  Track Market Sentiment in Real-Time
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 text-base md:text-xl dark:text-gray-400">
                  Analyze social media sentiment for any stock ticker.
                  Make more informed investment decisions.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-3">
                <form action="/dashboard" className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <input
                    className="flex h-10 w-full rounded-md border border-gray-700 bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:border-[3px] focus-visible:border-primary focus-visible:outline-none dark:text-gray-200 dark:placeholder:text-gray-400"                    
                    placeholder="Enter stock ticker (e.g., AAPL)"
                    type="text"
                    name="ticker"
                    required
                  />
                  <Button type="submit" className="w-full sm:w-auto whitespace-nowrap">
                    Analyze
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Try popular tickers: TSLA, AAPL, MSFT, AMZN, GOOGL
                </p>
              </div>
            </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
