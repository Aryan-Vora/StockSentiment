import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const popularTickers = ['GME', 'AAPL', 'NVDA', 'TSLA'];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8f7f2] text-zinc-950">
      <header className="mx-auto flex h-14 w-full max-w-6xl items-center justify-center px-4 sm:justify-start sm:px-6">
        <Link className="text-sm font-semibold tracking-tight text-zinc-800 hover:text-zinc-950" href="/">
          StockSentiment
        </Link>
      </header>

      <main>
        <section className="mx-auto flex min-h-[calc(100svh-3.5rem)] w-full max-w-6xl items-center justify-center px-4 py-6 sm:px-6">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-tight text-zinc-950 sm:text-6xl">
              Reddit Sentiment Against Market Data
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-700 sm:text-lg sm:leading-8">
              Enter a ticker. StockSentiment pulls Reddit posts about that stock, runs VADER sentiment on the text, and compares the result with market data.
            </p>
            <form action="/dashboard" className="mt-8 w-full max-w-xl rounded-xl border border-zinc-200 bg-white p-2 shadow-[0_24px_80px_rgba(24,24,27,0.10)]">
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="relative flex-1">
                  <span className="sr-only">Ticker</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                  <input
                    className="h-12 w-full rounded-lg border border-transparent bg-zinc-50 pl-10 pr-3 text-center text-base font-medium uppercase outline-none transition placeholder:normal-case focus:border-zinc-300 focus:bg-white sm:text-left"
                    placeholder="AAPL, GME, TSLA..."
                    type="text"
                    name="ticker"
                    pattern="[A-Za-z][A-Za-z0-9.-]{0,9}"
                    required
                  />
                </label>
                <Button type="submit" className="h-12 rounded-lg bg-zinc-950 px-5 text-white hover:bg-zinc-800">
                  Compare
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-zinc-500">Popular</span>
              {popularTickers.map((ticker) => (
                <Link
                  key={ticker}
                  href={`/dashboard?ticker=${ticker}`}
                  className="rounded-full border border-zinc-300 bg-white/75 px-3 py-1 font-medium text-zinc-700 transition hover:border-zinc-500 hover:text-zinc-950"
                >
                  {ticker}
                </Link>
              ))}
            </div>

            <div className="mt-8 w-full text-left">
              <div className="text-center">
                <h2 className="text-xl font-semibold tracking-tight">What it does</h2>
              </div>
              <div className="mt-4 grid border-t border-zinc-300 pt-4 text-center sm:grid-cols-3">
                <div className="px-4 py-2">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">01</p>
                  <p className="mt-2 font-semibold text-zinc-950">Reddit</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">
                    Fetches recent posts that mention the ticker.
                  </p>
                </div>
                <div className="border-zinc-300 px-4 py-2 sm:border-l">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">02</p>
                  <p className="mt-2 font-semibold text-zinc-950">VADER</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">
                    Scores the text as positive, neutral, or negative.
                  </p>
                </div>
                <div className="border-zinc-300 px-4 py-2 sm:border-l">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">03</p>
                  <p className="mt-2 font-semibold text-zinc-950">Real Data</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">
                    Compares sentiment with historical price movement.
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
