import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowUp, TrendingDown, TrendingUp } from "lucide-react"

interface StockInfoProps {
  data: {
    ticker: string
    price: number
    change: number
    changePercent: number
    overallSentiment: "positive" | "negative" | "neutral"
    sentimentScore: number
  }
}

export function StockInfo({ data }: StockInfoProps) {
  const isPositive = data.change >= 0
  const sentimentColor = {
    positive: "bg-green-100 text-green-800",
    negative: "bg-red-100 text-red-800",
    neutral: "bg-gray-100 text-gray-800",
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{data.ticker}</CardTitle>
        <CardDescription>Current Stock Information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Current Price</p>
            <div
              className="
                flex items-baseline
                flex-col md:flex-col lg:flex-row
                md:items-start lg:items-baseline
              "
            >
              <span className="text-2xl font-bold">${data.price.toFixed(2)}</span>
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
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Overall Sentiment</p>
            <div className="mt-1">
              <Badge className={sentimentColor[data.overallSentiment]}>
                {data.overallSentiment.charAt(0).toUpperCase() + data.overallSentiment.slice(1)}
              </Badge>
            </div>
            <div className="mt-2 flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${data.sentimentScore > 0 ? "bg-green-600" : "bg-red-600"}`}
                  style={{ width: `${Math.abs(data.sentimentScore) * 100}%` }}
                ></div>
              </div>
              <span className="ml-2 text-xs">{data.sentimentScore.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Sentiment Trend</p>
            <div className="flex items-center mt-1">
              {data.sentimentScore >= 0.5? (
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
              )}
              <span className="text-sm">
                {data.overallSentiment}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

