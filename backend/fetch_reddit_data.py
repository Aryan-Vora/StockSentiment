import os
import random
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any

import asyncpraw
from dotenv import load_dotenv
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

from cache import TTLCache
from schemas import RedditPost, SentimentLabel

load_dotenv()
app_id = os.getenv("REDDIT_CLIENT_ID")
client_secret = os.getenv("REDDIT_CLIENT_SECRET")

analyzer = SentimentIntensityAnalyzer()
_reddit_cache = TTLCache[list[dict[str, Any]]](ttl_seconds=86400)


def classify_sentiment(score: float) -> SentimentLabel:
    if score >= 0.05:
        return "positive"
    if score <= -0.05:
        return "negative"
    return "neutral"


def sentiment_display_label(label: SentimentLabel) -> str:
    return {
        "positive": "Bullish Reddit mood",
        "negative": "Bearish Reddit mood",
        "neutral": "Neutral Reddit mood",
    }[label]


def get_async_reddit():
    if not app_id or not client_secret:
        raise RuntimeError("Reddit credentials are not configured")

    return asyncpraw.Reddit(
        client_id=app_id,
        client_secret=client_secret,
        user_agent="android:" + app_id + ":v1.0 (by u/K6av6ai82j0zo8HB721)"
    )


async def get_reddit_data(ticker: str, limit: int = 10):
    normalized_ticker = ticker.upper().strip()
    cache_key = f"{normalized_ticker}:{limit}"
    cached = _reddit_cache.get(cache_key)
    if cached is not None:
        return cached

    reddit = get_async_reddit()
    posts = []
    try:
        query = f"${normalized_ticker}"
        subreddit = await reddit.subreddit("all")
        async for submission in subreddit.search(query, limit=limit):
            posts.append(format_submission(submission))
    finally:
        await reddit.close()

    return _reddit_cache.set(cache_key, posts)


def format_submission(submission: Any) -> dict[str, Any]:
    title = getattr(submission, "title", "") or ""
    selftext = getattr(submission, "selftext", "") or ""
    text_content = f"{title} {selftext}"
    compound_score = analyzer.polarity_scores(text_content)["compound"]
    avatar_num = random.randint(0, 7)
    avatar_url = f"https://www.redditstatic.com/avatars/defaults/v2/avatar_default_{avatar_num}.png"
    author = getattr(submission, "author", None)
    author_name = getattr(author, "name", None)
    subreddit = getattr(submission, "subreddit", None)

    post = RedditPost(
        id=str(getattr(submission, "id", "")),
        username=f"u/{author_name}" if author_name else "u/[deleted]",
        handle=author_name if author_name else "[deleted]",
        avatar=avatar_url,
        content=title + ("\n\n" + selftext if selftext else ""),
        platform="reddit",
        date=float(getattr(submission, "created_utc", 0)),
        sentiment=classify_sentiment(compound_score),
        score=float(compound_score),
        likes=int(getattr(submission, "score", 0) or 0),
        comments=int(getattr(submission, "num_comments", 0) or 0),
        url=str(getattr(submission, "url", "")),
        subreddit=getattr(subreddit, "display_name", "unknown") if subreddit else "unknown",
    )
    return post.model_dump()


async def categorize_sentiment(ticker: str):
    posts = await get_reddit_data(ticker)

    if not posts:
        return {
            "sentiment": "No market sentiment",
            "label": "neutral",
            "displayLabel": "No Reddit posts found",
            "score": 0.0,
            "postCount": 0,
        }

    compound_scores = [post["score"] for post in posts]
    avg_compound = sum(compound_scores) / len(compound_scores)
    label = classify_sentiment(avg_compound)
    legacy_sentiment = {
        "positive": "Bullish market sentiment",
        "negative": "Bearish market sentiment",
        "neutral": "Neutral market sentiment",
    }[label]
    return {
        "sentiment": legacy_sentiment,
        "label": label,
        "displayLabel": sentiment_display_label(label),
        "score": avg_compound,
        "postCount": len(posts),
    }


async def get_sentiment_timeseries(ticker: str, days: int = 30):
    posts = await get_reddit_data(ticker, limit=50)

    if not posts:
        return []

    posts_by_date = defaultdict(list)

    for post in posts:
        post_date = datetime.fromtimestamp(post["date"], tz=timezone.utc).date()
        posts_by_date[post_date].append(post["score"])

    sentiment_timeseries = []
    end_date = datetime.now(timezone.utc).date()
    start_date = end_date - timedelta(days=days)

    current_date = start_date
    while current_date <= end_date:
        if current_date in posts_by_date:
            scores = posts_by_date[current_date]
            avg_score = sum(scores) / len(scores)
            post_count = len(scores)
            sentiment_category = classify_sentiment(avg_score)

            sentiment_timeseries.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "score": avg_score,
                "sentiment": sentiment_category,
                "post_count": post_count
            })
        else:
            sentiment_timeseries.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "score": 0.0,
                "sentiment": "neutral",
                "post_count": 0
            })

        current_date += timedelta(days=1)

    return sentiment_timeseries
