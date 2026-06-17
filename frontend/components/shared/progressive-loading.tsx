"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import {
  Status,
  StatusIndicator,
  StatusLabel,
} from "@/components/ui/kibo-ui/status";

interface ProgressiveLoadingProps {
  isLoading: boolean;
  isCompleting?: boolean;
}

export function ProgressiveLoading({
  isLoading,
  isCompleting = false,
}: ProgressiveLoadingProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    let resetTimer: NodeJS.Timeout | undefined;

    if (isCompleting) {
      resetTimer = setTimeout(() => setProgress(100), 0);

      return () => {
        if (resetTimer) clearTimeout(resetTimer);
      };
    }

    if (!isLoading) {
      resetTimer = setTimeout(() => setProgress(0), 0);

      return () => {
        if (resetTimer) clearTimeout(resetTimer);
      };
    }

    resetTimer = setTimeout(() => setProgress(0), 0);

    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed <= 20_000) {
        setProgress(Math.min((elapsed / 20_000) * 80, 80));
        return;
      }

      const secondsAfter20 = (elapsed - 20_000) / 1000;
      setProgress(Math.min(80 + secondsAfter20, 96));
    };

    interval = setInterval(updateProgress, 100);

    return () => {
      if (resetTimer) clearTimeout(resetTimer);
      if (interval) clearInterval(interval);
    };
  }, [isLoading, isCompleting]);

  if (!isLoading && !isCompleting) {
    return null;
  }

  const label = isCompleting
    ? "Done"
    : progress < 80
      ? "Fetching Reddit and price data"
      : progress < 96
        ? "Scoring the crowd mood"
        : "Almost there";

  return (
    <div className="grid gap-3">
      <Progress className="h-2" value={progress} />
      <Status className="mx-auto" status={isCompleting ? "online" : "degraded"}>
        <StatusIndicator />
        <StatusLabel>
          {Math.round(progress)}% - {label}
        </StatusLabel>
      </Status>
    </div>
  );
}
