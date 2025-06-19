import os
from dotenv import load_dotenv
import asyncpraw
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
        posts.append({
            "id": submission.id,
            "title": submission.title,
            "content": submission.selftext,
            "url": submission.url,
            "sentiment": analyzer.polarity_scores(submission.title + " " + submission.selftext)
        })
    await reddit.close()
    return posts


async def categorize_sentiment(ticker: str):
    posts = await get_reddit_data(ticker)

    if not posts:
        return {"sentiment": "No market sentiment", "score": 0.5}

    compound_scores = [post["sentiment"]["compound"] for post in posts]
    avg_compound = sum(compound_scores) / len(compound_scores)
    if avg_compound >= 0.05:
        return {"sentiment": "Bullish market sentiment", "score": 0.5 + avg_compound}
    elif avg_compound <= -0.05:
        return {"sentiment": "Bearish market sentiment", "score": 0.5 + avg_compound}
    else:
        return {"sentiment": "Neutral market sentiment", "score": 0.5 + avg_compound}
if __name__ == "__main__":
    import asyncio

    async def main():
        print(await get_reddit_data("NVDA"))
        print(await categorize_sentiment("NVDA"))

    asyncio.run(main())
