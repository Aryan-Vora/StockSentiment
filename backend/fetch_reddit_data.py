import praw
from dotenv import load_dotenv
import os
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import datetime
from db import posts_collection, db
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
app_id = os.getenv("REDDIT_CLIENT_ID")
client_secret = os.getenv("REDDIT_CLIENT_SECRET")

# Initialize Reddit API
reddit = praw.Reddit(
    client_id=app_id,
    client_secret=client_secret,
    user_agent="android:" + app_id + ":v1.0 (by u/K6av6ai82j0zo8HB721)"
)

# Initialize Sentiment Analyzer
analyzer = SentimentIntensityAnalyzer()

# List of stock tickers (replace with dynamic fetching if needed)
tickers = ["AAPL", "TSLA", "GOOGL"]

def fetch_reddit_data():
    """Fetch Reddit posts for all tickers and store in database"""
    try:
        logger.info("Starting Reddit data fetch...")
        for ticker in tickers:
            logger.info(f"Searching for ticker: {ticker}")
            try:
                search_results = reddit.subreddit("all").search(f"${ticker}", limit=100)
                for submission in search_results:
                    sentiment = analyzer.polarity_scores(submission.title)
                    try:
                        posts_collection.insert_one({
                            "ticker": ticker,
                            "title": submission.title,
                            "url": submission.url,
                            "score": submission.score,
                            "sentiment_score": sentiment["compound"],
                            "created_at": datetime.now()
                        })
                        logger.info(f"Added post for {ticker}: {submission.title[:30]}...")
                    except Exception as e:
                        logger.error(f"Error inserting post: {e}")
            except Exception as e:
                logger.error(f"Error searching Reddit for {ticker}: {e}")
    except Exception as e:
        logger.error(f"Error in fetch_reddit_data: {e}")

if __name__ == "__main__":
    fetch_reddit_data()
