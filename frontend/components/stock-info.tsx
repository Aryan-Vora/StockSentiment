import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowUp, TrendingDown, TrendingUp } from "lucide-react"

interface StockInfoProps {
  data: {
    ticker: string
    price: number
    ask?: number
    change: number
    changePercent: number
    overallSentiment: "positive" | "negative" | "neutral"
    sentimentScore: number
    volume?: number
    marketCap?: number
    fiftyTwoWeekLow?: number
    fiftyTwoWeekHigh?: number
    peRatio?: number
    forwardPE?: number
    dividendYield?: number
    beta?: number
    dayLow?: number
    dayHigh?: number
    averageVolume?: number
    sector?: string
    industry?: string
  }
}

export function StockInfo({ data }: StockInfoProps) {
  const isPositive = data.change >= 0
  const sentimentColor = {
    positive: "bg-green-100 text-green-800",
    negative: "bg-red-100 text-red-800",
    neutral: "bg-gray-100 text-gray-800",
  }

  const displayPrice = (data.price === 0 && data.ask && data.ask > 0) ? data.ask : data.price
  const priceLabel = (data.price === 0 && data.ask && data.ask > 0) ? "Ask Price" : "Current Price"

  const formatVolume = (volume?: number) => {
    if (!volume || volume === 0) return 'Unknown'
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`
    return volume.toLocaleString()
  }

  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap || marketCap === 0) return 'Unknown'
    if (marketCap >= 1000000000000) return `$${(marketCap / 1000000000000).toFixed(2)}T`
    if (marketCap >= 1000000000) return `$${(marketCap / 1000000000).toFixed(2)}B`
    if (marketCap >= 1000000) return `$${(marketCap / 1000000).toFixed(2)}M`
    return `$${marketCap.toLocaleString()}`
  }

  const formatPercentage = (value?: number) => {
    if (value === undefined || value === null || value === 0) return 'Unknown'
    return `${(value * 100).toFixed(2)}%`
  }

  const formatNumber = (value?: number, decimals: number = 2) => {
    if (value === undefined || value === null || value === 0) return 'Unknown'
    return value.toFixed(decimals)
  }

  const formatPrice = (value?: number) => {
    if (value === undefined || value === null || value === 0) return 'Unknown'
    return `$${value.toFixed(2)}`
  }

  return (
    <Card className="max-w-full overflow-hidden">
      <CardHeader>
        <CardTitle className="truncate">{data.ticker}</CardTitle>
        <CardDescription className="truncate">
          {data.sector && data.industry && data.sector !== 'Unknown' && data.industry !== 'Unknown' 
            ? `${data.sector} • ${data.industry}` 
            : 'Stock Information'}
        </CardDescription>
      </CardHeader>
      <CardContent className="max-w-full overflow-hidden">
        <div className="h-[350px] sm:h-[350px] lg:h-[500px] max-w-full overflow-hidden overflow-y-auto">
          <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">{priceLabel}</p>
            <div
              className="
                flex items-baseline
                flex-col md:flex-col lg:flex-row
                md:items-start lg:items-baseline
              "
            >
              <span className="text-2xl font-bold">
                {displayPrice > 0 ? `$${displayPrice.toFixed(2)}` : 'Unknown'}
              </span>
              {displayPrice > 0 && (
                <span
                  className={`
                    ml-0 mt-1 md:ml-0 md:mt-1 lg:ml-2 lg:mt-0
                    flex items-center text-sm
                    ${isPositive ? "text-green-600" : "text-red-600"}
                  `}
                >
                  {isPositive ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
                  {Math.abs(data.change).toFixed(2)} ({Math.abs(data.changePercent).toFixed(2)}%)
                </span>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium mb-2">Sentiment Analysis</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge className={sentimentColor[data.overallSentiment]}>
                  {data.overallSentiment.charAt(0).toUpperCase() + data.overallSentiment.slice(1)}
                </Badge>
                <span className="text-xs font-mono">{data.sentimentScore.toFixed(3)}</span>
              </div>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${data.sentimentScore > 0 ? "bg-green-600" : data.sentimentScore < 0 ? "bg-red-600" : "bg-gray-400"}`}
                    style={{ width: `${Math.min(Math.abs(data.sentimentScore) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center text-xs">
                {data.sentimentScore >= 0.05 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">Bullish</span>
                  </>
                ) : data.sentimentScore <= -0.05 ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    <span className="text-red-600">Bearish</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-gray-500">Neutral</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {(data.dayLow && data.dayLow > 0) && (data.dayHigh && data.dayHigh > 0) ? (
            <div>
              <p className="text-sm font-medium">Day Range</p>
              <p className="text-sm text-gray-600">
                ${data.dayLow.toFixed(2)} - ${data.dayHigh.toFixed(2)}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium">Day Range</p>
              <p className="text-sm text-gray-600">Unknown</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium">Volume</p>
              <p className="text-sm text-gray-600">{formatVolume(data.volume)}</p>
            </div>
            <div>
              <p className="text-xs font-medium">Avg Volume</p>
              <p className="text-sm text-gray-600">{formatVolume(data.averageVolume)}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Market Cap</p>
            <p className="text-sm text-gray-600">{formatMarketCap(data.marketCap)}</p>
          </div>

          {(data.fiftyTwoWeekLow && data.fiftyTwoWeekLow > 0) && (data.fiftyTwoWeekHigh && data.fiftyTwoWeekHigh > 0) ? (
            <div>
              <p className="text-sm font-medium">52 Week Range</p>
              <div className="mt-1">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>${data.fiftyTwoWeekLow.toFixed(2)}</span>
                  <span>${data.fiftyTwoWeekHigh.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full relative"
                    style={{ 
                      width: '100%'
                    }}
                  >
                    <div 
                      className="absolute top-0 w-1 h-2 bg-blue-800 rounded-full"
                      style={{ 
                        left: `${((displayPrice - data.fiftyTwoWeekLow) / (data.fiftyTwoWeekHigh - data.fiftyTwoWeekLow)) * 100}%`,
                        transform: 'translateX(-50%)'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium">52 Week Range</p>
              <p className="text-sm text-gray-600">Unknown</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium">P/E Ratio</p>
              <p className="text-sm text-gray-600">{formatNumber(data.peRatio)}</p>
            </div>
            <div>
              <p className="text-xs font-medium">Forward P/E</p>
              <p className="text-sm text-gray-600">{formatNumber(data.forwardPE)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium">Beta</p>
              <p className="text-sm text-gray-600">{formatNumber(data.beta)}</p>
            </div>
            <div>
              <p className="text-xs font-medium">Dividend Yield</p>
              <p className="text-sm text-gray-600">{formatPercentage(data.dividendYield)}</p>
            </div>
          </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

