'use client';

import { useMemo } from 'react';
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
} from 'recharts';
import type { SentimentTimeseriesPoint, StockHistoryPoint } from '@/lib/api';
import { formatCurrency, formatScore } from '@/lib/format';

interface CombinedChartProps {
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

export function CombinedChart({ stockData, sentimentData }: CombinedChartProps) {
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
    <div className="h-[340px] max-w-full overflow-hidden lg:h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 24, left: 0, bottom: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis
            dataKey="date"
            tickFormatter={formatAxisDate}
            tick={{ fontSize: 12, fill: '#71717a' }}
            tickLine={false}
          />
          <YAxis
            yAxisId="price"
            orientation="left"
            tick={{ fontSize: 12, fill: '#71717a' }}
            tickLine={false}
            axisLine={false}
            width={72}
            tickFormatter={(value) => `$${Number(value).toFixed(0)}`}
          />
          <YAxis
            yAxisId="sentiment"
            orientation="right"
            domain={[-1, 1]}
            tick={{ fontSize: 12, fill: '#71717a' }}
            tickLine={false}
            axisLine={false}
            width={52}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend />
          <ReferenceLine yAxisId="sentiment" y={0.05} stroke="#059669" strokeDasharray="2 2" opacity={0.55} />
          <ReferenceLine yAxisId="sentiment" y={-0.05} stroke="#e11d48" strokeDasharray="2 2" opacity={0.55} />
          <ReferenceLine yAxisId="sentiment" y={0} stroke="#71717a" strokeDasharray="2 2" opacity={0.35} />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="price"
            stroke="#18181b"
            strokeWidth={2.5}
            name="Stock price"
            dot={false}
            activeDot={{ r: 4, stroke: '#18181b', strokeWidth: 2 }}
          />
          <Line
            yAxisId="sentiment"
            type="monotone"
            dataKey="sentimentScore"
            stroke="#e11d48"
            strokeWidth={2}
            name="Reddit sentiment"
            dot={{ r: 2, fill: '#e11d48', stroke: 'white', strokeWidth: 1 }}
            activeDot={{ r: 5, stroke: '#e11d48', strokeWidth: 2 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: number;
}) {
  if (!active || !payload?.length) return null;

  const datum = payload[0]?.payload;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 text-sm shadow-lg">
      <p className="font-medium text-zinc-950">{formatTooltipDate(label)}</p>
      <div className="mt-2 space-y-1">
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: {formatTooltipValue(entry)}
          </p>
        ))}
      </div>
      {datum?.postCount ? (
        <p className="mt-2 text-xs text-zinc-500">
          {datum.postCount} posts, {datum.sentiment || 'neutral'} mood
        </p>
      ) : null}
    </div>
  );
}

function formatTooltipValue(entry: TooltipEntry) {
  if (entry.value === null || entry.value === undefined) return 'No data';
  if (entry.name === 'Stock price') return formatCurrency(entry.value);
  return formatScore(entry.value);
}

function formatAxisDate(value: number) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value));
}

function formatTooltipDate(value?: number) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}
