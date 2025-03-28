from fastapi import APIRouter, HTTPException
from pymongo import MongoClient
from db import stocks_collection, posts_collection, get_stock_data
from datetime import datetime, timedelta
import logging
import random
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Mock Stock and Post models since we won't actually use DB
class Stock(BaseModel):
    symbol: str
    
class Post(BaseModel):
    id: str
    title: str
    content: str
    source: str
    url: str
    stocks: List[Stock]

# Create a new post
@router.post("/posts/")
async def create_post(post: Post):
    # Just return a success response without actually saving to DB
    return {"message": "Post added", "post_id": post.id}


@router.get("/posts/")
async def get_posts():
    # Return an empty list of posts
    return []


@router.get("/stocks/{symbol}")
async def get_stock(symbol: str):
    # Return a mock stock with empty posts
    return {
        "_id": symbol,
        "name": f"{symbol} Inc.",
        "posts": []
    }


# Update the dashboard endpoint with better error handling
@router.get("/api/dashboard/{ticker}")
async def get_dashboard_data(ticker: str):
    try:
        # Get real stock data using our database function
        stock_info = get_stock_data(ticker)
        if not stock_info:
            # If stock data is None, create default data
            stock_info = {
                "ticker": ticker,
                "price": 0,
                "change": 0,
                "change_percent": "0",
                "last_updated": datetime.now()
            }
        
        # Get Reddit posts from database (might be empty)
        try:
            reddit_posts = list(posts_collection.find({"ticker": ticker}))
        except Exception as e:
            logger.error(f"Error fetching Reddit posts: {e}")
            reddit_posts = []
        
        # Generate placeholder sentiment data using actual stock price
        start_date = datetime.now() - timedelta(days=7)
        sentiment_data = []
        
        # Create 7 days of data points with the real stock price but neutral sentiment
        for i in range(7):
            day = start_date + timedelta(days=i)
            # Use the real stock price (or a placeholder if not available)
            try:
                price = float(stock_info.get("price", 100))
            except (ValueError, TypeError):
                price = 100
            
            # Add some minor variation to make the chart look realistic
            price_with_variation = price * (1 + (i - 3) * 0.01)
            
            sentiment_data.append({
                "date": day.isoformat(),
                "left": 0,  # Neutral sentiment placeholder
                "right": price_with_variation,
                "event": False
            })
        
        return {
            "stockInfo": {
                "ticker": ticker,
                "price": stock_info.get("price", 0),
                "change": stock_info.get("change", 0),
                "changePercent": stock_info.get("change_percent", "0"),
                "overallSentiment": "neutral",  # Placeholder
                "sentimentScore": 0  # Placeholder
            },
            "sentimentData": sentiment_data,
            "redditPosts": reddit_posts,
            "newsItems": [],  # Empty for now
            "socialPosts": []  # Empty for now
        }
    except Exception as e:
        logger.error(f"Error in dashboard endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

