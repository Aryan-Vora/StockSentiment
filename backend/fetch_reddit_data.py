import os
from dotenv import load_dotenv
import asyncpraw
import random
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

load_dotenv()
app_id = os.getenv("REDDIT_CLIENT_ID")
client_secret = os.getenv("REDDIT_CLIENT_SECRET")

analyzer = SentimentIntensityAnalyzer()


def get_async_reddit():
    return asyncpraw.Reddit(
        client_id=app_id,
        client_secret=client_secret,
        user_agent="android:" + app_id + ":v1.0 (by u/K6av6ai82j0zo8HB721)"
    )


async def get_reddit_data(ticker: str, limit: int = 10):
    """Fetch Reddit posts for all tickers and return them as a dictionary."""
    reddit = get_async_reddit()
    posts = []
    query = f"${ticker}"
    subreddit = await reddit.subreddit("all")
    async for submission in subreddit.search(query, limit=limit):
        text_content = submission.title + " " + submission.selftext
        sentiment_scores = analyzer.polarity_scores(text_content)
        compound_score = sentiment_scores["compound"]
        
        if compound_score >= 0.05:
            sentiment_category = "positive"
        elif compound_score <= -0.05:
            sentiment_category = "negative"
        else:
            sentiment_category = "neutral"
        
        # Uses a random avatar because when i made it fetch the avatar it took too long and was lowkey sketchy
        avatar_num = random.randint(0, 7)
        avatar_url = f"https://www.redditstatic.com/avatars/defaults/v2/avatar_default_{avatar_num}.png"
        
        posts.append({
            "id": submission.id,
            "username": f"u/{submission.author.name}" if submission.author else "u/[deleted]",
            "handle": submission.author.name if submission.author else "[deleted]",
            "avatar": avatar_url,
            "content": submission.title + ("\n\n" + submission.selftext if submission.selftext else ""),
            "platform": "reddit",
            "date": submission.created_utc,
            "sentiment": sentiment_category,
            "score": compound_score,
            "likes": submission.score,
            "comments": submission.num_comments,
            "url": submission.url,
            "subreddit": submission.subreddit.display_name if submission.subreddit else "unknown"
        })
    await reddit.close()
    return posts


async def categorize_sentiment(ticker: str):
    posts = await get_reddit_data(ticker)

    if not posts:
        return {"sentiment": "No market sentiment", "score": 0.5}

    compound_scores = [post["score"] for post in posts]
    avg_compound = sum(compound_scores) / len(compound_scores)
    if avg_compound >= 0.05:
        return {"sentiment": "Bullish market sentiment", "score": 0.5 + avg_compound}
    elif avg_compound <= -0.05:
        return {"sentiment": "Bearish market sentiment", "score": 0.5 + avg_compound}
    else:
        return {"sentiment": "Neutral market sentiment", "score": 0.5 + avg_compound}


async def get_sentiment_timeseries(ticker: str, days: int = 30):
    """
    Aggregate Reddit sentiment data by date for time-series visualization
    """
    posts = await get_reddit_data(ticker, limit=50)
    
    if not posts:
        return []
    
    from collections import defaultdict
    from datetime import datetime, timedelta
    
    posts_by_date = defaultdict(list)
    
    for post in posts:
        post_date = datetime.fromtimestamp(post["date"]).date()
        posts_by_date[post_date].append(post["score"])
    
    sentiment_timeseries = []
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days)
    
    current_date = start_date
    while current_date <= end_date:
        if current_date in posts_by_date:
            scores = posts_by_date[current_date]
            avg_score = sum(scores) / len(scores)
            post_count = len(scores)
            
            if avg_score >= 0.05:
                sentiment_category = "positive"
            elif avg_score <= -0.05:
                sentiment_category = "negative"
            else:
                sentiment_category = "neutral"
                
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
if __name__ == "__main__":
    import asyncio

    async def main():
        print(await get_reddit_data("NVDA"))
        print(await categorize_sentiment("NVDA"))

    asyncio.run(main())
