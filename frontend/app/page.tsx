import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="#">
          <span className="font-bold text-xl">StockSentiment</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            Features
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#"
          >
            How It Works
          </Link>
        </nav>
      </header>
      <main className="flex-1">
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
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold sm:text-4xl tracking-tighter">
                How It Works
              </h2>
              <p className="mt-4 text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400 max-w-[800px] mx-auto">
                Our platform analyzes thousands of social media posts and news
                articles to determine market sentiment.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-2 lg:max-w-4xl mx-auto max-w-[80%]">
              <div className="flex flex-col items-center text-center space-y-3">
                <h3 className="text-xl font-bold">Data Collection</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-[400px]">
                  We scrape tweets, Reddit posts, and financial news headlines
                  to gather real-time data.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-3">
                <h3 className="text-xl font-bold">NLP Analysis</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-[400px]">
                  Advanced natural language processing classifies sentiment as
                  positive, negative, or neutral.
                </p>
              </div>

              <div className="flex flex-col items-center text-center space-y-3">
                <h3 className="text-xl font-bold">Visualization</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-[400px]">
                  Interactive charts display sentiment trends over time with
                  highlighted key events.
                </p>
              </div>

              <div className="flex flex-col items-center text-center space-y-3">
                <h3 className="text-xl font-bold">Correlation Analysis</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-[400px]">
                  See how sentiment changes correlate with stock price movements
                  for deeper insights.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
