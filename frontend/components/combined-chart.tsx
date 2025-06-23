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
  Legend,
  ReferenceLine,
} from 'recharts';

interface CombinedChartProps {
  stockData: any[];
  sentimentData: any[];
}

export function CombinedChart({ stockData, sentimentData }: CombinedChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (stockData && stockData.length > 0) {
      console.log('Stock data sample:', stockData[0]);
      console.log('Sentiment data sample:', sentimentData?.[0]);
      
      const processedData = stockData.map((stockPoint: any) => {
        let stockDate = '';
        if (stockPoint.Date) {
          stockDate = stockPoint.Date;
        } else {
          console.warn('No Date field found in stock data point:', stockPoint);
          return null;
        }
        
        const sentimentPoint = sentimentData?.find((sentiment: any) => {
          return sentiment.date === stockDate; 
        });
        
        const dateObj = new Date(stockDate + 'T00:00:00');
        
        return {
          date: dateObj.getTime(),
          dateStr: stockDate,
          price: stockPoint.Close,
          open: stockPoint.Open,
          high: stockPoint.High,
          low: stockPoint.Low,
          volume: stockPoint.Volume,
          sentiment: sentimentPoint ? sentimentPoint.sentiment : null,
          sentimentScore: sentimentPoint ? sentimentPoint.score : null,
          postCount: sentimentPoint ? sentimentPoint.post_count : 0,
        };
      }).filter(Boolean);

      console.log('Processed chart data sample:', processedData.slice(0, 3));
      console.log('Sentiment data available for dates:', sentimentData?.map(s => s.date).slice(0, 5));
      setChartData(processedData);
    }
  }, [stockData, sentimentData]);

  const formatDate = (tickItem: any) => {
    try {
      return new Date(tickItem).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return tickItem;
    }
  };

  const formatTooltipDate = (label: any) => {
    try {
      return new Date(label).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return label;
    }
  };

  return (
    <div className="h-[350px] sm:h-[350px] lg:h-[500px] max-w-full overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 60,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="price" 
            orientation="left"
            tick={{ fontSize: 12 }}
            label={{ value: 'Stock Price ($)', angle: -90, position: 'insideLeft' }}
          />
          <YAxis 
            yAxisId="sentiment" 
            orientation="right"
            domain={[-1, 1]}
            tick={{ fontSize: 12 }}
            label={{ value: 'Sentiment Score', angle: 90, position: 'insideRight' }}
          />
          <Tooltip
            formatter={(value: any, name: string) => {
              if (name === 'price') return [`$${Number(value).toFixed(2)}`, 'Stock Price'];
              if (name === 'sentimentScore') return [Number(value).toFixed(3), 'Sentiment Score'];
              return [value, name];
            }}
            labelFormatter={formatTooltipDate}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0]?.payload;
                return (
                  <div className="bg-white p-3 border rounded shadow-lg">
                    <p className="font-medium">{formatTooltipDate(label)}</p>
                    {payload.map((entry: any, index: number) => (
                      <p key={index} style={{ color: entry.color }}>
                        {entry.name}: {entry.name === 'Stock Price' ? `$${Number(entry.value).toFixed(2)}` : Number(entry.value).toFixed(3)}
                      </p>
                    ))}
                    {data?.postCount > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        Posts: {data.postCount} | Sentiment: {data.sentiment || 'neutral'}
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          {/* Reference lines for sentiment thresholds */}
          <ReferenceLine yAxisId="sentiment" y={0.05} stroke="#16a34a" strokeDasharray="2 2" opacity={0.5} />
          <ReferenceLine yAxisId="sentiment" y={-0.05} stroke="#dc2626" strokeDasharray="2 2" opacity={0.5} />
          <ReferenceLine yAxisId="sentiment" y={0} stroke="#6b7280" strokeDasharray="1 1" opacity={0.3} />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="price"
            stroke="#2563eb"
            strokeWidth={2}
            name="Stock Price"
            dot={{ r: 0 }}
            activeDot={{ r: 4, stroke: "#2563eb", strokeWidth: 2 }}
          />
          <Line
            yAxisId="sentiment"
            type="monotone"
            dataKey="sentimentScore"
            stroke="#dc2626"
            strokeWidth={2}
            name="Sentiment Score"
            dot={{ r: 2, fill: "#dc2626", stroke: "white", strokeWidth: 1 }}
            activeDot={{ r: 5, stroke: "#dc2626", strokeWidth: 2 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
