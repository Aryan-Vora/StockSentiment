import { Activity, Building2, Gauge, LineChart } from "lucide-react";
import { Pill, PillIcon } from "@/components/ui/kibo-ui/pill";
import {
  Status,
  StatusIndicator,
  StatusLabel,
} from "@/components/ui/kibo-ui/status";
import {
  Ticker,
  TickerPrice,
  TickerPriceChange,
  TickerSymbol,
} from "@/components/ui/kibo-ui/ticker";
import {
  SignalDivider,
  SignalModule,
} from "@/components/ui/kibo-ui/intelligence";
import type { AnalysisMetrics, SentimentSummary, StockSummary } from "@/lib/api";
import { formatCompactNumber, formatCurrency, formatPercent, formatScore } from "@/lib/format";

interface StockIntelligenceSummaryProps {
  stock: StockSummary | null;
  sentiment: SentimentSummary;
  metrics: AnalysisMetrics;
}

const sentimentStatus = {
  positive: "online",
  negative: "offline",
  neutral: "maintenance",
} as const;

export function StockIntelligenceSummary({
  stock,
  sentiment,
  metrics,
}: StockIntelligenceSummaryProps) {
  if (!stock) {
    return (
      <SignalModule compact>
        <p className="font-semibold">Stock data unavailable</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Market data did not return a usable stock snapshot.
        </p>
      </SignalModule>
    );
  }

  const companyLine =
    stock.sector && stock.industry
      ? `${stock.sector} / ${stock.industry}`
      : stock.name || "Stock snapshot";

  return (
    <SignalModule className="xl:sticky xl:top-20">
      <div className="flex items-start justify-between gap-3">
        <Ticker
          aria-label={`${stock.symbol} market snapshot`}
          className="min-w-0 cursor-default text-left"
        >
          <span className="flex min-w-0 flex-col">
            <TickerSymbol className="text-lg leading-none" symbol={stock.symbol} />
            <span className="mt-1 truncate text-xs font-normal text-muted-foreground">
              {companyLine}
            </span>
          </span>
        </Ticker>
        <Status className="shrink-0" status={sentimentStatus[sentiment.label]}>
          <StatusIndicator />
          <StatusLabel>{sentiment.displayLabel}</StatusLabel>
        </Status>
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Current price
        </p>
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          {stock.currentPrice !== null && stock.currentPrice !== undefined ? (
            <Ticker className="cursor-default text-3xl font-semibold tracking-normal">
              <TickerPrice className="text-foreground" price={stock.currentPrice} />
            </Ticker>
          ) : (
            <span className="text-3xl font-semibold tracking-normal">
              {formatCurrency(stock.currentPrice)}
            </span>
          )}
          {stock.change !== null && stock.change !== undefined ? (
            <Ticker className="cursor-default text-sm font-medium">
              <TickerPriceChange
                change={stock.changePercent ?? stock.change}
                isPercent={stock.changePercent !== null && stock.changePercent !== undefined}
              />
              <span className="text-muted-foreground">({formatCurrency(stock.change)})</span>
            </Ticker>
          ) : null}
        </div>
        <ToolFindingSummary metrics={metrics} sentiment={sentiment} />
      </div>

      <SignalDivider className="my-5" />

      <div className="mt-5 grid gap-3 text-sm">
        <MarketFact
          icon={LineChart}
          label="Price move"
          value={formatPercent(metrics.priceChangePercent, { signed: true })}
        />
        <MarketFact icon={Activity} label="Volume" value={formatCompactNumber(stock.volume)} />
        <MarketFact icon={Building2} label="Market cap" value={formatCompactNumber(stock.marketCap)} />
        <MarketFact icon={LineChart} label="52 week low" value={formatCurrency(stock.fiftyTwoWeekLow)} />
        <MarketFact icon={LineChart} label="52 week high" value={formatCurrency(stock.fiftyTwoWeekHigh)} />
        <MarketFact icon={Gauge} label="P/E ratio" value={stock.peRatio?.toFixed(2) || "Unknown"} />
        <MarketFact icon={Gauge} label="Beta" value={stock.beta?.toFixed(2) || "Unknown"} />
      </div>
    </SignalModule>
  );
}

function ToolFindingSummary({
  metrics,
  sentiment,
}: {
  metrics: AnalysisMetrics;
  sentiment: SentimentSummary;
}) {
  return (
    <div className="mt-4 border-l-2 border-primary/30 pl-3 text-sm leading-6 text-muted-foreground">
      <p>
        Reddit mood is {sentiment.displayLabel.toLowerCase()} at{" "}
        <span className="font-mono text-foreground">
          {formatScore(metrics.averageSentiment ?? sentiment.score)}
        </span>{" "}
        while price moved{" "}
        <span className="font-mono text-foreground">
          {formatPercent(metrics.priceChangePercent, { signed: true })}
        </span>
        .
      </p>
      <p className="mt-1">
        The daily overlap shows {describeCorrelation(metrics.correlation)} correlation{" "}
        <span className="font-mono text-foreground">
          {formatCorrelation(metrics.correlation)}
        </span>
        .
      </p>
    </div>
  );
}

function MarketFact({
  icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <Pill className="w-full justify-between rounded-md border bg-background px-4 py-3" variant="outline">
      <span className="inline-flex min-w-0 items-center gap-2 text-muted-foreground">
        <PillIcon className="size-4" icon={icon} />
        <span className="truncate text-sm">{label}</span>
      </span>
      <span className="text-base font-semibold text-foreground">{value}</span>
    </Pill>
  );
}

function describeCorrelation(value?: number | null) {
  if (value === null || value === undefined) return "an unknown";
  const absoluteValue = Math.abs(value);
  const direction = value < 0 ? "negative" : "positive";

  if (absoluteValue >= 0.6) return `a strong ${direction}`;
  if (absoluteValue >= 0.3) return `a moderate ${direction}`;
  if (absoluteValue >= 0.1) return `a light ${direction}`;
  return "a weak";
}

function formatCorrelation(value?: number | null) {
  if (value === null || value === undefined) return "(unknown)";
  return `(${value > 0 ? "+" : ""}${value.toFixed(3)})`;
}
