import type React from 'react';
import { Activity, Building2, Gauge, LineChart, TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AnalysisMetrics, SentimentSummary, StockSummary } from '@/lib/api';
import { formatCompactNumber, formatCurrency, formatPercent } from '@/lib/format';

interface StockInfoProps {
  stock: StockSummary | null;
  sentiment: SentimentSummary;
  metrics: AnalysisMetrics;
}

const sentimentTone = {
  positive: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  negative: 'bg-rose-50 text-rose-800 border-rose-200',
  neutral: 'bg-zinc-100 text-zinc-700 border-zinc-200',
};

export function StockInfo({ stock, sentiment, metrics }: StockInfoProps) {
  if (!stock) {
    return (
      <Card className="rounded-xl border-zinc-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Stock data</CardTitle>
          <CardDescription>Market data did not return usable stock data.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isPositive = (stock.change ?? 0) >= 0;

  return (
    <Card className="rounded-xl border-zinc-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <span className="truncate">{stock.symbol}</span>
          <Badge className={sentimentTone[sentiment.label]} variant="outline">
            {sentiment.label}
          </Badge>
        </CardTitle>
        <CardDescription className="truncate">
          {stock.sector && stock.industry ? `${stock.sector} / ${stock.industry}` : 'Stock snapshot'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-sm font-medium text-zinc-500">Current price</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight">{formatCurrency(stock.currentPrice)}</span>
            {stock.change !== null && stock.change !== undefined ? (
              <span className={`inline-flex items-center text-sm font-medium ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isPositive ? <TrendingUp className="mr-1 h-4 w-4" /> : <TrendingDown className="mr-1 h-4 w-4" />}
                {formatCurrency(stock.change)} ({formatPercent(stock.changePercent, { signed: true })})
              </span>
            ) : null}
          </div>
        </div>

        <div className="divide-y divide-zinc-200 border-y border-zinc-200 text-sm">
          <SignalRow
            label="Price move"
            value={formatPercent(metrics.priceChangePercent, { signed: true })}
            detail={`${formatCurrency(metrics.priceChange)} over the analysis window`}
          />
          <SignalRow
            label="Signal"
            value={formatInverseSignal(metrics.inverseSignal)}
            detail={`${formatAlignment(metrics.alignment)}. ${metrics.alignmentLabel}`}
          />
        </div>

        <div className="grid gap-3 text-sm">
          <InfoRow icon={<Activity className="h-4 w-4" />} label="Volume" value={formatCompactNumber(stock.volume)} />
          <InfoRow icon={<Building2 className="h-4 w-4" />} label="Market cap" value={formatCompactNumber(stock.marketCap)} />
          <InfoRow icon={<LineChart className="h-4 w-4" />} label="52 week low" value={formatCurrency(stock.fiftyTwoWeekLow)} />
          <InfoRow icon={<LineChart className="h-4 w-4" />} label="52 week high" value={formatCurrency(stock.fiftyTwoWeekHigh)} />
          <InfoRow icon={<Gauge className="h-4 w-4" />} label="P/E ratio" value={stock.peRatio?.toFixed(2) || 'Unknown'} />
          <InfoRow icon={<Gauge className="h-4 w-4" />} label="Beta" value={stock.beta?.toFixed(2) || 'Unknown'} />
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-zinc-100 bg-white px-3 py-2">
      <span className="inline-flex items-center gap-2 text-zinc-500">
        {icon}
        {label}
      </span>
      <span className="font-medium text-zinc-950">{value}</span>
    </div>
  );
}

function SignalRow({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="py-3">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium text-zinc-500">{label}</p>
        <p className="text-right text-sm font-semibold text-zinc-950">{value}</p>
      </div>
      <p className="mt-1 text-xs leading-5 text-zinc-500">{detail}</p>
    </div>
  );
}

function formatAlignment(value: AnalysisMetrics['alignment']) {
  return {
    aligned: 'Aligned',
    inverse: 'Inverse watch',
    mixed: 'Mixed',
    insufficient_data: 'Not enough data',
  }[value];
}

function formatInverseSignal(value: string) {
  return {
    strong: 'Strong inverse',
    watch: 'Worth watching',
    none: 'No inverse read',
    unclear: 'Unclear',
    unknown: 'Unknown',
  }[value] || value;
}
