import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

interface NewsCardProps {
  item: {
    title: string
    source: string
    date: string
    url: string
    sentiment: "positive" | "negative" | "neutral"
    score: number
  }
}

export function NewsCard({ item }: NewsCardProps) {
  const sentimentColor = {
    positive: "bg-green-100 text-green-800 hover:bg-green-200",
    negative: "bg-red-100 text-red-800 hover:bg-red-200",
    neutral: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
        </div>
        <CardDescription className="flex justify-between items-center">
          <span>{item.source}</span>
          <span>{new Date(item.date).toLocaleDateString()}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={sentimentColor[item.sentiment]}>
            {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)} ({item.score.toFixed(2)})
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline flex items-center"
        >
          Read full article <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      </CardFooter>
    </Card>
  )
}

