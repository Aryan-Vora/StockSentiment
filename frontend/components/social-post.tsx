import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageSquare, Heart, Repeat, ExternalLink } from "lucide-react"
import { useState } from "react"

interface SocialPostProps {
  post: {
    username: string
    handle: string
    avatar?: string
    content: string
    platform: "reddit"
    date: string | number
    sentiment: "positive" | "negative" | "neutral"
    score: number
    likes: number
    comments: number
    shares?: number
    subreddit?: string
    url?: string
  }
}

export function SocialPost({ post }: SocialPostProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const sentimentColor = {
    positive: "bg-green-100 text-green-800 hover:bg-green-200",
    negative: "bg-red-100 text-red-800 hover:bg-red-200",
    neutral: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  }

  const platformIcon = {
    twitter: "X",
    reddit: "r/",
  }

  const formatDate = (date: string | number) => {
    if (typeof date === 'number') {
      return new Date(date * 1000).toLocaleString();
    }
    return new Date(date).toLocaleString();
  }

  // Say read more when it's too long
  const MAX_CONTENT_LENGTH = 200;
  const shouldTruncate = post.content.length > MAX_CONTENT_LENGTH;
  const displayContent = shouldTruncate && !isExpanded 
    ? post.content.substring(0, MAX_CONTENT_LENGTH) + "..."
    : post.content;

  return (
    <Card className="hover:shadow-md transition-shadow max-w-full min-w-0 overflow-hidden">
      <CardHeader className="pb-3 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 max-w-full min-w-0">
          <div className="flex items-center space-x-3 min-w-0 flex-1 overflow-hidden">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={post.avatar || undefined} alt={post.username} />
              <AvatarFallback className="bg-blue-500 text-white">
                {post.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="font-medium text-sm truncate">{post.username}</div>
              <div className="text-xs text-gray-500 truncate">
                {platformIcon[post.platform]}
                {post.subreddit || post.handle}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:items-end gap-2 flex-shrink-0">
            <Badge variant="outline" className={`${sentimentColor[post.sentiment]} text-xs whitespace-nowrap`}>
              {post.sentiment.charAt(0).toUpperCase() + post.sentiment.slice(1)} ({post.score.toFixed(2)})
            </Badge>
            <CardDescription className="text-xs whitespace-nowrap">{formatDate(post.date)}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 overflow-hidden">
        <div className="space-y-3">
          <p className="text-sm leading-relaxed whitespace-pre-line break-words overflow-wrap-anywhere">{displayContent}</p>
          
          <div className="flex flex-col gap-2">
            {shouldTruncate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-auto p-0 text-blue-600 hover:text-blue-800 font-medium self-start"
              >
                {isExpanded ? "Show less" : "Read more"}
              </Button>
            )}
            
            {post.url && post.url !== post.content && !post.content.includes(post.url) && (
              <a 
                href={post.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 text-xs bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors self-start w-fit"
              >
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-xs">View original post</span>
              </a>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-3 border-t bg-gray-50/50">
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{post.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{post.comments}</span>
          </div>
        </div>
        <div className="text-xs text-gray-400 sm:ml-auto">
          Reddit Post
        </div>
      </CardFooter>
    </Card>
  )
}

