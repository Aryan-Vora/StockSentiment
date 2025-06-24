'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, RefreshCw, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CombinedChart } from '@/components/combined-chart';
import { SocialPost } from '@/components/social-post';
import { StockInfo } from '@/components/stock-info';

// Use local API routes that proxy to the backend
const API_URL = '';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const ticker = searchParams.get('ticker')?.toUpperCase() || 'AAPL';
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'sentiment' | 'likes'>('date');
  const [data, setData] = useState<any>({
    stockInfo: {},
    stockHistory: [],
    sentimentData: [],
    socialPosts: [],
  });
  const [rawApiData, setRawApiData] = useState<any>({
    stock: null,
    reddit: null,
    redditSentiment: null,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const stockResponse = await fetch(`${API_URL}/api/stock/${ticker}`);
        const redditResponse = await fetch(`${API_URL}/api/reddit/${ticker}`);
        const redditSentimentResponse = await fetch(`${API_URL}/api/redditSentiment/${ticker}`);
        const sentimentTimeseriesResponse = await fetch(`${API_URL}/api/sentimentTimeseries/${ticker}?days=30`);
        
        if (!stockResponse.ok && !redditResponse.ok) {
          throw new Error(`Error fetching data: ${stockResponse.statusText}, ${redditResponse.statusText}`);
        }
    
        const stockResult = await stockResponse.json();
        const redditResult = await redditResponse.json();
        const redditSentimentResult = await redditSentimentResponse.json();
        const sentimentTimeseriesResult = sentimentTimeseriesResponse.ok ? await sentimentTimeseriesResponse.json() : [];

        console.log('Fetched stock data:', stockResult);
        console.log('Fetched reddit data:', redditResult);
        console.log('Fetched reddit sentiment data:', redditSentimentResult);
        console.log('Fetched sentiment timeseries:', sentimentTimeseriesResult);

        //Saving for export
        //Not too big of a fan of saving all of this 
        //Later I should just return the data from a separate api call
        //But for now this is fine
        setRawApiData({
          stock: stockResult,
          reddit: redditResult,
          redditSentiment: redditSentimentResult,
          sentimentTimeseries: sentimentTimeseriesResult,
        });

        const formattedData = {
          stockInfo: {
            ticker: ticker,
            price: stockResult.info.currentPrice || 0,
            ask: stockResult.info.ask || 0,
            change: stockResult.info.regularMarketChange || 0,
            changePercent: stockResult.info.regularMarketChangePercent || 0,
            overallSentiment: redditSentimentResult.sentiment || 'neutral',
            sentimentScore: redditSentimentResult.score || 0,
            volume: stockResult.info.regularMarketVolume || 0,
            marketCap: stockResult.info.marketCap || 0,
            fiftyTwoWeekLow: stockResult.info.fiftyTwoWeekLow || 0,
            fiftyTwoWeekHigh: stockResult.info.fiftyTwoWeekHigh || 0,
            peRatio: stockResult.info.trailingPE || 0,
            forwardPE: stockResult.info.forwardPE || 0,
            dividendYield: stockResult.info.dividendYield || 0,
            beta: stockResult.info.beta || 0,
            dayLow: stockResult.info.regularMarketDayLow || 0,
            dayHigh: stockResult.info.regularMarketDayHigh || 0,
            averageVolume: stockResult.info.averageVolume || 0,
            sector: stockResult.info.sector || 'Unknown',
            industry: stockResult.info.industry || 'Unknown',
          },
          stockHistory: stockResult.history || [],
          sentimentData: sentimentTimeseriesResult || [],
          socialPosts: redditResult, 
        };

        setData(formattedData);
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError(`Failed to load data: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker]);

  const sortedSocialPosts = data.socialPosts ? [...data.socialPosts].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'date':
        const dateA = typeof a.date === 'number' ? a.date : new Date(a.date).getTime() / 1000;
        const dateB = typeof b.date === 'number' ? b.date : new Date(b.date).getTime() / 1000;
        return dateB - dateA; 
      case 'sentiment':
        return Math.abs(b.score) - Math.abs(a.score);
      case 'likes':
        return b.likes - a.likes; 
      default:
        return 0;
    }
  }) : [];

  const handleExportData = () => {
    const exportObj = {
      stock: rawApiData.stock,
      reddit: rawApiData.reddit,
      redditSentiment: rawApiData.redditSentiment,
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ticker}_sentiment_data.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="px-4 lg:px-6 h-14 flex items-center border-b">
          <Link className="flex items-center justify-center" href="/">
            <span className="font-bold text-xl">StockSentiment</span>
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg">Analyzing sentiment for {ticker}...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="px-4 lg:px-6 h-14 flex items-center border-b">
          <Link className="flex items-center justify-center" href="/">
            <span className="font-bold text-xl">StockSentiment</span>
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <p className="text-lg text-red-500">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-full overflow-x-hidden">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b max-w-full">
        <Link className="flex items-center justify-center" href="/">
          <span className="font-bold text-xl">StockSentiment</span>
        </Link>
        <nav className="ml-auto mr-4 flex gap-4 sm:gap-6">
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <div className="px-4 lg:px-6 py-6 max-w-[calc(100vw-1rem)] lg:max-w-[calc(100vw-3rem)] ">
          <div className="flex items-center mb-6 max-w-full">
            <Link href="/" className="mr-4 flex-shrink-0">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>          
          <div className="grid gap-6 lg:grid-cols-4 max-w-full">
            <div className="lg:col-span-1 min-w-0">
              <StockInfo data={data.stockInfo} />
            </div>

            <div className="lg:col-span-3 min-w-0">
              <Card className="max-w-full overflow-hidden">
                <CardHeader>
                  <CardTitle>Stock Price & Sentiment Analysis</CardTitle>
                  <CardDescription>
                    Stock price movement with sentiment analysis from social media over the past month
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-w-full overflow-hidden">
                  {data.stockHistory && data.stockHistory.length > 0 ? (
                    <CombinedChart 
                      stockData={data.stockHistory} 
                      sentimentData={data.sentimentData} 
                    />
                  ) : (
                    <div className="flex justify-center items-center h-64 text-gray-400">
                      Loading stock and sentiment data...
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>          
          <div className="mt-6 max-w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 max-w-full">
              <h3 className="text-lg font-medium">Reddit Posts</h3>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                <Select value={sortBy} onValueChange={(value: 'date' | 'sentiment' | 'likes') => setSortBy(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date (Newest)</SelectItem>
                    <SelectItem value="sentiment">Sentiment Strength</SelectItem>
                    <SelectItem value="likes">Most Upvoted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {sortedSocialPosts && sortedSocialPosts.length > 0 ? (
              <div className="grid gap-4 max-w-full">
                {sortedSocialPosts.map((post: any, index: number) => (
                  <SocialPost key={post.id || index} post={post} />
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-32 bg-gray-50 rounded-md text-gray-400">
                No social media posts available yet
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
