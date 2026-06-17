import type { AnalysisPeriod } from "@/lib/api";

export type RangeKey = "1mo" | "6mo" | "1y" | "5y" | "all";

export const dateRangeOptions = [
  { key: "1mo", label: "1m", description: "Last 30 days", period: "1mo", days: 30 },
  { key: "6mo", label: "6m", description: "Last 6 months", period: "6mo", days: 180 },
  { key: "1y", label: "1yr", description: "Last year", period: "1y", days: 365 },
  { key: "5y", label: "5yr", description: "Last 5 years", period: "5y", days: 1825 },
  { key: "all", label: "ALL time", description: "All available history", period: "all", days: 3650 },
] satisfies Array<{
  key: RangeKey;
  label: string;
  description: string;
  period: AnalysisPeriod;
  days: number;
}>;

export function isRangeKey(value: string | null): value is RangeKey {
  return dateRangeOptions.some((option) => option.key === value);
}

export function getDateRange(key: RangeKey) {
  return dateRangeOptions.find((option) => option.key === key) ?? dateRangeOptions[0];
}
