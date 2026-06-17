'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Download } from 'lucide-react';
import {
  ErrorState,
  LoadingState,
  PartialErrorsBanner,
} from '@/components/dashboard/dashboard-feedback';
import {
  getDateRange,
  isRangeKey,
} from '@/components/dashboard/date-ranges';
import { MarketNarrative } from '@/components/dashboard/market-narrative';
import { RedditActivityFeed } from '@/components/dashboard/reddit-activity-feed';
import { SignalEvolutionChart } from '@/components/dashboard/signal-evolution-chart';
import { StockIntelligenceSummary } from '@/components/dashboard/stock-intelligence-summary';
import { TickerSearchForm } from '@/components/shared/ticker-search-form';
import { Button } from '@/components/ui/button';
import {
  IntelligenceMain,
  IntelligenceShell,
  IntelligenceTopbar,
  IntelligenceTopbarInner,
} from '@/components/ui/kibo-ui/intelligence';
import {
  RelativeTime,
  RelativeTimeZone,
  RelativeTimeZoneDate,
  RelativeTimeZoneDisplay,
  RelativeTimeZoneLabel,
} from '@/components/ui/kibo-ui/relative-time';
import {
  Status,
  StatusIndicator,
  StatusLabel,
} from '@/components/ui/kibo-ui/status';
import {
  fetchAnalysis,
  isValidTicker,
  normalizeTicker,
  type AnalysisResponse,
} from '@/lib/api';

export function DashboardClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const requestedTicker = normalizeTicker(searchParams.get('ticker') || 'AAPL');
  const ticker = isValidTicker(requestedTicker) ? requestedTicker : 'AAPL';
  const requestedRange = searchParams.get('range');
  const rangeKey = isRangeKey(requestedRange) ? requestedRange : '1mo';
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeRange = getDateRange(rangeKey);

  useEffect(() => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    let completionTimer: number | undefined;
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
        completionTimer = window.setTimeout(() => {
          if (controller.signal.aborted) return;
          setLoading(false);
          setIsCompleting(false);
          abortControllerRef.current = null;
        }, 250);
      } catch (err) {
        if (controller.signal.aborted) return;

        const message = err instanceof Error
          ? err.message
          : 'Something went sideways while loading data.';
        setError(message);
        setLoading(false);
        setIsCompleting(false);
        abortControllerRef.current = null;
      }
    }

    loadAnalysis();

    return () => {
      controller.abort();
      if (completionTimer) {
        window.clearTimeout(completionTimer);
      }
    };
  }, [ticker, activeRange.period, activeRange.days]);

  const handleExportData = useCallback(() => {
    if (!analysis) return;

    const blob = new Blob([JSON.stringify(analysis, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${analysis.ticker}_reddit_vs_price.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, [analysis]);

  const handleRangeChange = useCallback(
    (value: string) => {
      if (!isRangeKey(value)) return;

      const params = new URLSearchParams(searchParams.toString());
      params.set('ticker', ticker);
      params.set('range', value);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams, ticker],
  );

  if (loading || isCompleting) {
    return (
      <LoadingState
        isCompleting={isCompleting}
        isLoading={loading}
        ticker={ticker}
      />
    );
  }

  if (error) {
    return <ErrorState error={error} ticker={ticker} />;
  }

  if (!analysis) {
    return <ErrorState error="No analysis came back from the API." ticker={ticker} />;
  }

  const stock = analysis.stock;
  const metrics = analysis.metrics;
  const generatedAt = new Date(analysis.generatedAt);
  const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <IntelligenceShell>
      <IntelligenceTopbar>
        <IntelligenceTopbarInner className="flex-col items-stretch lg:flex-row lg:items-center">
          <div className="flex items-center justify-between gap-3">
            <Button asChild size="sm" variant="ghost">
              <Link href="/">
                <ArrowLeft className="size-4" />
                Back
              </Link>
            </Button>
          </div>

          <div className="hidden flex-col gap-2 sm:flex sm:flex-row lg:ml-auto lg:w-[610px]">
            <TickerSearchForm
              className="min-w-0 flex-1"
              compact
              defaultTicker={analysis.ticker}
              range={rangeKey}
            />
            <Button
              className="h-11 shrink-0"
              onClick={handleExportData}
              type="button"
              variant="outline"
            >
              <Download className="size-4" />
              Export
            </Button>
          </div>
        </IntelligenceTopbarInner>
      </IntelligenceTopbar>

      <IntelligenceMain className="space-y-5">
        <PartialErrorsBanner errors={analysis.partialErrors} />

        <section className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
          <StockIntelligenceSummary
            metrics={metrics}
            sentiment={analysis.sentiment}
            stock={stock}
          />

          <div className="grid min-w-0 gap-5">
            <SignalEvolutionChart
              activeRangeDescription={activeRange.description}
              onRangeChange={handleRangeChange}
              rangeKey={rangeKey}
              sentimentData={analysis.sentimentSeries}
              stockData={stock?.history ?? []}
            />
            <MarketNarrative metrics={metrics} sentiment={analysis.sentiment} />
          </div>
        </section>

        <RedditActivityFeed posts={analysis.posts} />
      </IntelligenceMain>

      <footer className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 pb-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Status status="maintenance">
          <StatusIndicator />
          <StatusLabel>Exploratory sentiment tool</StatusLabel>
        </Status>
        <RelativeTime
          dateFormatOptions={{ month: 'short', day: 'numeric' }}
          time={generatedAt}
          timeFormatOptions={{ hour: 'numeric', minute: '2-digit' }}
        >
          <RelativeTimeZone zone={localTimeZone}>
            <RelativeTimeZoneLabel>Run</RelativeTimeZoneLabel>
            <RelativeTimeZoneDate />
            <RelativeTimeZoneDisplay className="pl-0" />
          </RelativeTimeZone>
        </RelativeTime>
      </footer>
    </IntelligenceShell>
  );
}
