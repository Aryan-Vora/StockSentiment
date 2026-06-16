'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpDown,
  Download,
  RefreshCw,
  Search,
  TriangleAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CombinedChart } from '@/components/combined-chart';
import { LoadingBar } from '@/components/loading-bar';
import { SocialPost } from '@/components/social-post';
import { StockInfo } from '@/components/stock-info';
import { fetchAnalysis, isValidTicker, normalizeTicker, type AnalysisPeriod, type AnalysisResponse, type RedditPost } from '@/lib/api';

type SortKey = 'date' | 'sentiment' | 'likes';
type RangeKey = '1mo' | '6mo' | '1y' | '5y' | 'all';

const dateRangeOptions = [
  { key: '1mo', label: '1M', description: 'Last 30 days', period: '1mo', days: 30 },
  { key: '6mo', label: '6M', description: 'Last 6 months', period: '6mo', days: 180 },
  { key: '1y', label: '1Y', description: 'Last year', period: '1y', days: 365 },
  { key: '5y', label: '5Y', description: 'Last 5 years', period: '5y', days: 1825 },
  { key: 'all', label: 'All', description: 'All available history', period: 'all', days: 3650 },
] satisfies Array<{
  key: RangeKey;
  label: string;
  description: string;
  period: AnalysisPeriod;
  days: number;
}>;

function isRangeKey(value: string | null): value is RangeKey {
  return dateRangeOptions.some((option) => option.key === value);
}

export function DashboardClient() {
  const searchParams = useSearchParams();
  const requestedTicker = normalizeTicker(searchParams.get('ticker') || 'AAPL');
  const ticker = isValidTicker(requestedTicker) ? requestedTicker : 'AAPL';
  const requestedRange = searchParams.get('range');
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [rangeKey, setRangeKey] = useState<RangeKey>(isRangeKey(requestedRange) ? requestedRange : '1mo');
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeRange = dateRangeOptions.find((option) => option.key === rangeKey) || dateRangeOptions[1];

  useEffect(() => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    async function loadAnalysis() {
      setLoading(true);
      setIsCompleting(false);
      setError(null);

      try {
        const result = await fetchAnalysis(
          ticker,
          { period: activeRange.period, days: activeRange.days, limit: 30 },
          controller.signal,
        );
        if (controller.signal.aborted) return;
        setAnalysis(result);
        setIsCompleting(true);
        window.setTimeout(() => {
          if (controller.signal.aborted) return;
          setLoading(false);
          setIsCompleting(false);
          abortControllerRef.current = null;
        }, 250);
      } catch (err) {
        if (controller.signal.aborted) return;
        const message = err instanceof Error ? err.message : 'Something went sideways while loading data.';
        setError(message);
        setLoading(false);
        setIsCompleting(false);
        abortControllerRef.current = null;
      }
    }

    loadAnalysis();

    return () => {
      controller.abort();
    };
  }, [ticker, activeRange.period, activeRange.days]);

  const sortedPosts = useMemo(() => {
    const posts = analysis?.posts || [];
    return [...posts].sort((a, b) => sortPosts(a, b, sortBy));
  }, [analysis?.posts, sortBy]);

  function handleExportData() {
    if (!analysis) return;
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${analysis.ticker}_reddit_vs_price.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  function handleRangeChange(value: string) {
    if (isRangeKey(value)) {
      setRangeKey(value);
    }
  }

  if (loading || isCompleting) {
    return <LoadingState ticker={ticker} isLoading={loading} isCompleting={isCompleting} />;
  }

  if (error) {
    return <ErrorState ticker={ticker} error={error} />;
  }

  if (!analysis) {
    return <ErrorState ticker={ticker} error="No analysis came back from the API." />;
  }

  const stock = analysis.stock;
  const metrics = analysis.metrics;

  return (
    <div className="min-h-screen bg-[#f8f7f2] text-zinc-950">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-[#f8f7f2]/90 backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <span className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs text-zinc-600 lg:hidden">
              Not financial advice
            </span>
          </div>
          <form action="/dashboard" className="flex flex-1 flex-col gap-2 sm:flex-row lg:ml-auto lg:max-w-lg">
            <input type="hidden" name="range" value={rangeKey} />
            <label className="relative flex-1">
              <span className="sr-only">Ticker</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                className="h-10 w-full rounded-md border border-zinc-300 bg-white pl-9 pr-3 text-sm font-medium uppercase outline-none focus:border-zinc-500"
                name="ticker"
                defaultValue={ticker}
                pattern="[A-Za-z][A-Za-z0-9.-]{0,9}"
                required
              />
            </label>
            <Button className="h-10 rounded-md bg-zinc-950 text-white hover:bg-zinc-800" type="submit">
              Compare
            </Button>
            <Button className="h-10 rounded-md" type="button" variant="outline" onClick={handleExportData}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        {analysis.partialErrors.length > 0 ? (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <TriangleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-medium">Some data did not load.</p>
              <p className="mt-1">{analysis.partialErrors.join(' ')}</p>
            </div>
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <StockInfo stock={stock} sentiment={analysis.sentiment} metrics={metrics} />

          <Card className="overflow-hidden rounded-xl border-zinc-200 bg-white shadow-sm">
            <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Price vs. Reddit sentiment</CardTitle>
                <CardDescription>
                  Closing price with daily Reddit sentiment over {activeRange.description.toLowerCase()}.
                </CardDescription>
              </div>
              <label className="grid gap-1 sm:min-w-32">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">Range</span>
                <Select value={rangeKey} onValueChange={handleRangeChange}>
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue placeholder="Range" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateRangeOptions.map((option) => (
                      <SelectItem key={option.key} value={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </CardHeader>
            <CardContent>
              {stock?.history.length ? (
                <CombinedChart stockData={stock.history} sentimentData={analysis.sentimentSeries} />
              ) : (
                <EmptyPanel message="No stock history came back for this ticker." />
              )}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Reddit posts</h2>
              <p className="text-sm text-zinc-600">Sorted posts used for the sentiment read.</p>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-zinc-500" />
              <Select value={sortBy} onValueChange={(value: SortKey) => setSortBy(value)}>
                <SelectTrigger className="w-[190px] bg-white">
                  <SelectValue placeholder="Sort posts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Newest first</SelectItem>
                  <SelectItem value="sentiment">Strongest mood</SelectItem>
                  <SelectItem value="likes">Most upvoted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {sortedPosts.length ? (
            <div className="grid gap-4">
              {sortedPosts.map((post) => (
                <SocialPost key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <EmptyPanel message="No Reddit posts were found for this ticker. That is a signal too, just a quieter one." />
          )}
        </section>
      </main>

      <footer className="mx-auto w-full max-w-7xl px-4 pb-8 text-sm text-zinc-500 sm:px-6">
        Exploratory sentiment tool. Not investment advice.
      </footer>
    </div>
  );
}

function LoadingState({
  ticker,
  isLoading,
  isCompleting,
}: {
  ticker: string;
  isLoading: boolean;
  isCompleting: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f2] text-zinc-950">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6">
        <Link href="/" className="font-semibold">StockSentiment</Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-zinc-950" />
          <h1 className="mt-4 text-xl font-semibold">Checking Reddit against {ticker}</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            If Render is waking up, this can take a couple minutes.
          </p>
          <div className="mt-6">
            <LoadingBar isLoading={isLoading} isCompleting={isCompleting} />
          </div>
        </div>
      </main>
    </div>
  );
}

function ErrorState({ ticker, error }: { ticker: string; error: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f2] text-zinc-950">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6">
        <Link href="/" className="font-semibold">StockSentiment</Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-rose-200 bg-white p-6 text-center shadow-sm">
          <TriangleAlert className="mx-auto h-8 w-8 text-rose-600" />
          <h1 className="mt-4 text-xl font-semibold">Could not analyze {ticker}</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{error}</p>
          <div className="mt-6 flex justify-center gap-2">
            <Button onClick={() => window.location.reload()} className="bg-zinc-950 text-white hover:bg-zinc-800">
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Pick another ticker</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center text-sm text-zinc-500">
      {message}
    </div>
  );
}

function sortPosts(a: RedditPost, b: RedditPost, sortBy: SortKey) {
  if (sortBy === 'sentiment') return Math.abs(b.score) - Math.abs(a.score);
  if (sortBy === 'likes') return b.likes - a.likes;
  return b.date - a.date;
}
