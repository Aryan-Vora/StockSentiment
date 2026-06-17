import {
  SignalStat,
  SignalStatStrip,
} from "@/components/ui/kibo-ui/intelligence";
import type { AnalysisMetrics, SentimentSummary } from "@/lib/api";
import { formatPercent, formatScore } from "@/lib/format";

interface MarketNarrativeProps {
  sentiment: SentimentSummary;
  metrics: AnalysisMetrics;
}

export function MarketNarrative({ sentiment, metrics }: MarketNarrativeProps) {
  return (
    <SignalStatStrip>
      <SignalStat
        detail={`${sentiment.postCount} Reddit posts in the sample`}
        label="Average mood"
        tone={sentiment.label === "positive" ? "positive" : sentiment.label === "negative" ? "negative" : "neutral"}
        value={formatScore(metrics.averageSentiment ?? sentiment.score)}
      />
      <SignalStat
        detail={
          <span className="font-mono text-[0.7rem] text-foreground">
            Sentiment {formatScore(metrics.averageSentiment ?? sentiment.score)} / Price{" "}
            {formatExactPercent(metrics.priceChangePercent)}
          </span>
        }
        label="Price alignment"
        tone={metrics.alignment === "inverse" ? "warning" : metrics.alignment === "aligned" ? "positive" : "neutral"}
        value={formatAlignment(metrics.alignment)}
      />
      <SignalStat
        detail="Pearson read across overlapping daily points"
        label="Correlation"
        tone={correlationTone(metrics.correlation)}
        value={metrics.correlation === null || metrics.correlation === undefined ? "Unknown" : formatPercent(metrics.correlation * 100)}
      />
    </SignalStatStrip>
  );
}

function formatAlignment(value: AnalysisMetrics["alignment"]) {
  return {
    aligned: "Aligned",
    inverse: "Inverse watch",
    mixed: "Mixed",
    insufficient_data: "Insufficient",
  }[value];
}

function correlationTone(value?: number | null) {
  if (value === null || value === undefined) return "neutral";
  if (value > 0.25) return "positive";
  if (value < -0.25) return "warning";
  return "neutral";
}

function formatExactPercent(value?: number | null) {
  if (value === null || value === undefined) return "Unknown";
  return `${value > 0 ? "+" : ""}${value.toFixed(3)}%`;
}
