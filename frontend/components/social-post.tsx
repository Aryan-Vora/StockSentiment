import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Heart, Repeat } from "lucide-react"

interface SocialPostProps {
  post: {
    username: string
    handle: string
    avatar: string
    content: string
    platform: "reddit"
    date: string
    sentiment: "positive" | "negative" | "neutral"
    score: number
    likes: number
    comments: number
    shares: number
  }
}

export function SocialPost({ post }: SocialPostProps) {
  const sentimentColor = {
    positive: "bg-green-100 text-green-800 hover:bg-green-200",
    negative: "bg-red-100 text-red-800 hover:bg-red-200",
    neutral: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  }

  const platformIcon = {
    twitter: "X",
    reddit: "r/",
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.avatar} alt={post.username} />
              <AvatarFallback>{post.username.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{post.username}</div>
              <div className="text-xs text-gray-500">
                {platformIcon[post.platform]}
                {post.handle}
              </div>
            </div>
          </div>
          <Badge variant="outline" className={sentimentColor[post.sentiment]}>
            {post.sentiment.charAt(0).toUpperCase() + post.sentiment.slice(1)} ({post.score.toFixed(2)})
          </Badge>
        </div>
        <CardDescription className="text-xs">{new Date(post.date).toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{post.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center">
            <Heart className="mr-1 h-3 w-3" />
            {post.likes}
          </div>
          <div className="flex items-center">
            <MessageSquare className="mr-1 h-3 w-3" />
            {post.comments}
          </div>
          <div className="flex items-center">
            <Repeat className="mr-1 h-3 w-3" />
            {post.shares}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

