'use client';

import { useState } from 'react';
import { ExternalLink, Heart, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import type { RedditPost } from '@/lib/api';
import { formatDateTime, formatScore } from '@/lib/format';

interface SocialPostProps {
  post: RedditPost;
}

const sentimentColor = {
  positive: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-50',
  negative: 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-50',
  neutral: 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-100',
};

export function SocialPost({ post }: SocialPostProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxContentLength = 240;
  const shouldTruncate = post.content.length > maxContentLength;
  const displayContent = shouldTruncate && !isExpanded
    ? `${post.content.substring(0, maxContentLength)}...`
    : post.content;

  return (
    <Card className="overflow-hidden rounded-xl border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={post.avatar} alt={post.username} />
              <AvatarFallback className="bg-zinc-950 text-white">
                {post.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-zinc-950">{post.username}</div>
              <div className="truncate text-xs text-zinc-500">r/{post.subreddit || post.handle}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Badge variant="outline" className={sentimentColor[post.sentiment]}>
              {post.sentiment} ({formatScore(post.score)})
            </Badge>
            <CardDescription className="text-xs">{formatDateTime(post.date)}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="whitespace-pre-line break-words text-sm leading-7 text-zinc-700">{displayContent}</p>
        <div className="flex flex-wrap items-center gap-3">
          {shouldTruncate ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded((value) => !value)}
              className="h-auto p-0 text-sm font-medium text-zinc-950 hover:bg-transparent"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </Button>
          ) : null}
          {post.url ? (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-950"
            >
              <ExternalLink className="h-3 w-3" />
              Open post
            </a>
          ) : null}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/70 px-6 py-3 text-sm text-zinc-600">
        <div className="flex items-center gap-5">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {post.likes}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            {post.comments}
          </span>
        </div>
        <span className="text-xs text-zinc-400">Reddit</span>
      </CardFooter>
    </Card>
  );
}
