'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface SentimentChartSimpleProps {
  data: any[];
}

export function SentimentChartSimple({ data }: SentimentChartSimpleProps) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      setChartData(data);
    }
  }, [data]);

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) =>
              new Date(value).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })
            }
          />
          <YAxis yAxisId="left" domain={[-1, 1]} />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={['auto', 'auto']}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === 'left')
                return [`${Number(value).toFixed(2)}`, 'Sentiment'];
              if (name === 'right')
                return [`${Number(value).toFixed(2)}`, 'Price'];
              return [value, name];
            }}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="left"
            stroke="#8884d8"
            name="Sentiment"
            dot={{ r: 3 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="right"
            stroke="#82ca9d"
            name="Price"
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
