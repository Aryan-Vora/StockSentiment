"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  EmptySignal,
  SignalModule,
  SignalModuleBody,
  SignalModuleDescription,
  SignalModuleHeader,
  SignalModuleTitle,
} from "@/components/ui/kibo-ui/intelligence";
import type { SentimentTimeseriesPoint, StockHistoryPoint } from "@/lib/api";
import { formatCurrency, formatScore } from "@/lib/format";
import { RangeSelector } from "./range-selector";
import type { RangeKey } from "./date-ranges";

interface SignalEvolutionChartProps {
  activeRangeDescription: string;
  rangeKey: RangeKey;
  onRangeChange: (value: string) => void;
  stockData: StockHistoryPoint[];
  sentimentData: SentimentTimeseriesPoint[];
}

interface ChartDatum {
  date: number;
  dateStr: string;
  price: number | null;
  sentimentScore: number | null;
  sentiment: string | null;
  postCount: number;
}

interface TooltipEntry {
  name?: string;
  value?: number | null;
  color?: string;
  payload?: ChartDatum;
}

export function SignalEvolutionChart({
  activeRangeDescription,
  rangeKey,
  onRangeChange,
  stockData,
  sentimentData,
}: SignalEvolutionChartProps) {
  const chartData = useMemo(() => {
    const sentimentByDate = new Map(sentimentData.map((point) => [point.date, point]));

    return stockData.map((stockPoint) => {
      const sentimentPoint = sentimentByDate.get(stockPoint.date);

      return {
        date: new Date(`${stockPoint.date}T00:00:00`).getTime(),
        dateStr: stockPoint.date,
        price: stockPoint.close,
        sentimentScore: sentimentPoint?.score ?? null,
        sentiment: sentimentPoint?.sentiment ?? null,
        postCount: sentimentPoint?.post_count ?? 0,
      };
    });
  }, [stockData, sentimentData]);

  return (
    <SignalModule>
      <SignalModuleHeader>
        <div>
          <SignalModuleTitle>Signal evolution</SignalModuleTitle>
          <SignalModuleDescription>
            Closing price and daily Reddit sentiment over {activeRangeDescription.toLowerCase()}.
          </SignalModuleDescription>
        </div>
        <RangeSelector onValueChange={onRangeChange} value={rangeKey} />
      </SignalModuleHeader>

      <SignalModuleBody>
        {stockData.length ? (
          <div className="h-[330px] max-w-full overflow-hidden sm:h-[430px] xl:h-[520px]">
            <ResponsiveContainer height="100%" width="100%">
              <LineChart data={chartData} margin={{ top: 16, right: 12, left: -12, bottom: 12 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={formatAxisDate}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  orientation="left"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => `$${Number(value).toFixed(0)}`}
                  tickLine={false}
                  width={66}
                  yAxisId="price"
                />
                <YAxis
                  axisLine={false}
                  domain={[-1, 1]}
                  orientation="right"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  width={42}
                  yAxisId="sentiment"
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="line" />
                <ReferenceLine
                  opacity={0.55}
                  stroke="hsl(var(--chart-3))"
                  strokeDasharray="2 2"
                  y={0.05}
                  yAxisId="sentiment"
                />
                <ReferenceLine
                  opacity={0.55}
                  stroke="hsl(var(--chart-2))"
                  strokeDasharray="2 2"
                  y={-0.05}
                  yAxisId="sentiment"
                />
                <ReferenceLine
                  opacity={0.35}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="2 2"
                  y={0}
                  yAxisId="sentiment"
                />
                <Line
                  activeDot={{ r: 4, stroke: "hsl(var(--chart-1))", strokeWidth: 2 }}
                  dataKey="price"
                  dot={false}
                  name="Stock price"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2.5}
                  type="monotone"
                  yAxisId="price"
                />
                <Line
                  activeDot={{ r: 5, stroke: "hsl(var(--chart-2))", strokeWidth: 2 }}
                  connectNulls={false}
                  dataKey="sentimentScore"
                  dot={{ r: 2, fill: "hsl(var(--chart-2))", stroke: "hsl(var(--background))", strokeWidth: 1 }}
                  name="Reddit sentiment"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  type="monotone"
                  yAxisId="sentiment"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptySignal>No stock history came back for this ticker.</EmptySignal>
        )}
      </SignalModuleBody>
    </SignalModule>
  );
}

function ChartTooltip({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: number;
  payload?: TooltipEntry[];
}) {
  if (!active || !payload?.length) return null;

  const datum = payload[0]?.payload;

  return (
    <div className="rounded-lg border bg-card p-3 text-sm text-card-foreground shadow-lg">
      <p className="font-medium">{formatTooltipDate(label)}</p>
      <div className="mt-2 space-y-1">
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: {formatTooltipValue(entry)}
          </p>
        ))}
      </div>
      {datum?.postCount ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {datum.postCount} posts, {datum.sentiment || "neutral"} mood
        </p>
      ) : null}
    </div>
  );
}

function formatTooltipValue(entry: TooltipEntry) {
  if (entry.value === null || entry.value === undefined) return "No data";
  if (entry.name === "Stock price") return formatCurrency(entry.value);
  return formatScore(entry.value);
}

function formatAxisDate(value: number) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
}

function formatTooltipDate(value?: number) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
