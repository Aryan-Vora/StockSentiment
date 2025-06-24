'use client';

import { useEffect, useState } from 'react';

interface LoadingBarProps {
  isLoading: boolean;
  isCompleting?: boolean;
  onComplete?: () => void;
}

export function LoadingBar({ isLoading, isCompleting = false, onComplete }: LoadingBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isCompleting) {
      setProgress(100);
      return;
    }

    if (!isLoading) {
      setProgress(0);
      return;
    }

    setProgress(0);

    let startTime = Date.now();
    let interval: NodeJS.Timeout;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed <= 20000) {
        const newProgress = (elapsed / 20000) * 80;
        setProgress(Math.min(newProgress, 80));
      } else {
        const secondsAfter20 = (elapsed - 20000) / 1000;
        const newProgress = 80 + secondsAfter20;
        setProgress(Math.min(newProgress, 96));
      }
    };

    interval = setInterval(updateProgress, 100);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading, isCompleting]);

  if (!isLoading && !isCompleting) {
    return null;
  }

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
        }}
      />
      <div className="text-center mt-2 text-sm text-gray-600">
        {Math.round(progress)}% - {
          isCompleting ? 'Complete!' : 
          progress < 80 ? 'Fetching data...' : 
          progress < 96 ? 'Processing sentiment...' : 
          'Almost done...'
        }
      </div>
    </div>
  );
}
