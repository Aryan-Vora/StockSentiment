export type SentimentLabel = 'positive' | 'neutral' | 'negative';
export type AlignmentLabel = 'aligned' | 'inverse' | 'mixed' | 'insufficient_data';
export type PriceDirection = 'up' | 'down' | 'flat' | 'unknown';
export type AnalysisPeriod = '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | 'all';

export interface StockHistoryPoint {
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
}

export interface StockSummary {
  symbol: string;
  name?: string | null;
  currentPrice?: number | null;
  previousClose?: number | null;
  change?: number | null;
  changePercent?: number | null;
  currency?: string | null;
  sector?: string | null;
  industry?: string | null;
  marketCap?: number | null;
  volume?: number | null;
  fiftyTwoWeekLow?: number | null;
  fiftyTwoWeekHigh?: number | null;
  peRatio?: number | null;
  beta?: number | null;
  history: StockHistoryPoint[];
}

export interface RedditPost {
  id: string;
  username: string;
  handle: string;
  avatar: string;
  content: string;
  platform: 'reddit';
  date: number;
  sentiment: SentimentLabel;
  score: number;
  likes: number;
  comments: number;
  url: string;
  subreddit: string;
}

export interface SentimentSummary {
  label: SentimentLabel;
  displayLabel: string;
  score: number;
  postCount: number;
}

export interface SentimentTimeseriesPoint {
  date: string;
  score: number;
  sentiment: SentimentLabel;
  post_count: number;
}

export interface AnalysisMetrics {
  averageSentiment: number | null;
  priceChange: number | null;
  priceChangePercent: number | null;
  priceDirection: PriceDirection;
  alignment: AlignmentLabel;
  alignmentLabel: string;
  inverseSignal: string;
  correlation: number | null;
}

export interface AnalysisResponse {
  ticker: string;
  stock: StockSummary | null;
  sentiment: SentimentSummary;
  sentimentSeries: SentimentTimeseriesPoint[];
  posts: RedditPost[];
  metrics: AnalysisMetrics;
  generatedAt: string;
  sources: string[];
  partialErrors: string[];
}

const DEFAULT_API_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : 'https://stocksentiment-omux.onrender.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;

export function normalizeTicker(value: string) {
  return value.trim().toUpperCase();
}

export function isValidTicker(value: string) {
  return /^[A-Z][A-Z0-9.-]{0,9}$/.test(normalizeTicker(value));
}

export interface FetchAnalysisOptions {
  period?: AnalysisPeriod;
  days?: number;
  limit?: number;
}

export async function fetchAnalysis(
  ticker: string,
  options: FetchAnalysisOptions = {},
  signal?: AbortSignal,
): Promise<AnalysisResponse> {
  const normalizedTicker = normalizeTicker(ticker);
  const params = new URLSearchParams({
    period: options.period || '1mo',
    days: String(options.days || 30),
    limit: String(options.limit || 30),
  });
  const response = await fetch(
    `${API_URL}/api/analysis/${encodeURIComponent(normalizedTicker)}?${params.toString()}`,
    { signal },
  );

  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    const message = detail?.detail || `Request failed with ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}
