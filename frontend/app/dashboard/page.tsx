'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SentimentChartSimple } from '@/components/sentiment-chart';
import { NewsCard } from '@/components/news-card';
import { SocialPost } from '@/components/social-post';
import { StockInfo } from '@/components/stock-info';
import { generateMockData } from '@/lib/mock-data';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const ticker = searchParams.get('ticker')?.toUpperCase() || 'AAPL';
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Simulate API call with a delay
    setLoading(true);
    const timer = setTimeout(() => {
      setData(generateMockData(ticker));
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [ticker]);

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

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <span className="font-bold text-xl">StockSentiment</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </nav>
      </header>
      <main className="flex-1 py-6 px-4 md:px-6">
        <div className="flex items-center mb-6">
          <Link href="/" className="mr-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{ticker} Sentiment Analysis</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <StockInfo data={data.stockInfo} />

          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Overview</CardTitle>
                <CardDescription>
                  Sentiment analysis based on social media and news over the
                  past 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SentimentChartSimple data={data.sentimentData} />
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="news" className="mt-6">
          <TabsList>
            <TabsTrigger value="news">News Headlines</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
          </TabsList>
          <TabsContent value="news" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.newsItems.map((item: any, index: number) => (
                <NewsCard key={index} item={item} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="social" className="mt-4">
            <div className="grid gap-4">
              {data.socialPosts.map((post: any, index: number) => (
                <SocialPost key={index} post={post} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
