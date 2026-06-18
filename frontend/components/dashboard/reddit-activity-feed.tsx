"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, ExternalLink, Heart, MessageSquare } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  EmptySignal,
  SignalModule,
  SignalModuleBody,
  SignalModuleDescription,
  SignalModuleHeader,
  SignalModuleTitle,
} from "@/components/ui/kibo-ui/intelligence";
import {
  Pill,
  PillIcon,
  PillIndicator,
  PillStatus,
} from "@/components/ui/kibo-ui/pill";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RedditPost } from "@/lib/api";
import { formatDateTime, formatScore } from "@/lib/format";

type SortKey = "date" | "sentiment" | "likes";

interface RedditActivityFeedProps {
  posts: RedditPost[];
}

const sentimentIndicator = {
  positive: "success",
  negative: "error",
  neutral: "info",
} as const;

export function RedditActivityFeed({ posts }: RedditActivityFeedProps) {
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => sortPosts(a, b, sortBy)),
    [posts, sortBy]
  );

  return (
    <SignalModule>
      <SignalModuleHeader>
        <div>
          <SignalModuleTitle>Reddit activity</SignalModuleTitle>
          <SignalModuleDescription>
            Source posts behind the sentiment score.
          </SignalModuleDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">


          <Select onValueChange={(value: SortKey) => setSortBy(value)} value={sortBy}>
            <SelectTrigger className="h-9 w-[175px]">
              <SelectValue placeholder="Sort posts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Newest first</SelectItem>
              <SelectItem value="sentiment">Strongest mood</SelectItem>
              <SelectItem value="likes">Most upvoted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SignalModuleHeader>

      <SignalModuleBody className="grid gap-3">
        {sortedPosts.length ? (
          sortedPosts.map((post) => <RedditEvidencePost key={post.id} post={post} />)
        ) : (
          <EmptySignal>
            No Reddit posts were found for this ticker. That is a signal too, just a quieter one.
          </EmptySignal>
        )}
      </SignalModuleBody>
    </SignalModule>
  );
}

function RedditEvidencePost({ post }: { post: RedditPost }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxContentLength = 240;
  const shouldTruncate = post.content.length > maxContentLength;
  const displayContent =
    shouldTruncate && !isExpanded
      ? `${post.content.substring(0, maxContentLength)}...`
      : post.content;
  const contentBlocks = displayContent
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <article className="rounded-lg border bg-background/72 p-4 transition hover:border-primary/35">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-10 flex-shrink-0">
            <AvatarImage alt={post.username} src={post.avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {post.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-foreground">
              {post.username}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              r/{post.subreddit || post.handle}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Pill variant="secondary">
            <PillStatus>
              <PillIndicator variant={sentimentIndicator[post.sentiment]} />
              {post.sentiment}
            </PillStatus>
            {formatScore(post.score)}
          </Pill>
          <span className="text-xs text-muted-foreground">{formatDateTime(post.date)}</span>
        </div>
      </div>

      <div className="mt-4 space-y-2 break-words text-sm leading-5 text-muted-foreground">
        {contentBlocks.map((block, index) => (
          <p className="whitespace-pre-line" key={`${post.id}-content-${index}`}>
            {block}
          </p>
        ))}
      </div>

      <div className="mt-1.5 flex flex-col items-start gap-3">
        {shouldTruncate ? (
          <Button
            className="h-auto p-0 text-sm font-medium hover:bg-transparent"
            onClick={() => setIsExpanded((value) => !value)}
            size="sm"
            type="button"
            variant="ghost"
          >
            {isExpanded ? "Show less" : "Read more"}
          </Button>
        ) : null}
        {post.url ? (
          <Button asChild size="sm" variant="outline">
            <a href={post.url} rel="noopener noreferrer" target="_blank">
              <ExternalLink className="size-3" />
              Open post
            </a>
          </Button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3 text-muted-foreground">
        <Pill variant="outline">
          <PillIcon icon={Heart} />
          {post.likes}
        </Pill>
        <Pill variant="outline">
          <PillIcon icon={MessageSquare} />
          {post.comments}
        </Pill>
      </div>
    </article>
  );
}

function sortPosts(a: RedditPost, b: RedditPost, sortBy: SortKey) {
  if (sortBy === "sentiment") return Math.abs(b.score) - Math.abs(a.score);
  if (sortBy === "likes") return b.likes - a.likes;
  return b.date - a.date;
}
