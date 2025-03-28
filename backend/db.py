from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import requests
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Try to connect to MongoDB Atlas, fall back to local if needed
try:
    uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    
    # Use a safe connection approach
    if "mongodb+srv" in uri or ".mongodb.net" in uri:
        # This is an Atlas connection string
        client = MongoClient(
            uri,
            serverSelectionTimeoutMS=5000,  # Reduce timeout for faster failures
            tlsInsecure=True  # For development only! Disable in production
        )
    else:
        # Local MongoDB
        client = MongoClient(uri)
    
    # Test the connection
    client.admin.command('ping')
    logger.info("Successfully connected to MongoDB")
    
    db = client["StockSentiment"]
    stocks_collection = db["stocks"]
    posts_collection = db["reddit_posts"]  # Ensure consistent collection names
    
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    logger.warning("Falling back to mock database")
    
    # Mock database fallback
    from typing import Dict, List, Any, Optional

    class MockCollection:
        def __init__(self, name):
            self.name = name
            self.data = {}
        
        def find_one(self, query, projection=None):
            """Mock find_one that returns None for any query"""
            return None
            
        def find(self, query=None, projection=None):
            """Mock find that returns empty list"""
            return []
            
        def insert_one(self, document):
            """Mock insert_one that pretends to insert a document"""
            logger.info(f"Mock insert: {document}")
            return True
            
        def update_one(self, filter, update, upsert=False):
            """Mock update_one that pretends to update a document"""
            logger.info(f"Mock update: {filter}, {update}")
            return True

    # Create mock collections
    db = {"name": "MockDB"}
    stocks_collection = MockCollection("stocks")
    posts_collection = MockCollection("reddit_posts")

def get_stock_data(ticker):
    """
    Get stock data from database. If not available or outdated, fetch from Alpha Vantage.
    
    Args:
        ticker (str): The stock ticker symbol
        
    Returns:
        dict: Stock data
    """
    try:
        # Check if stock exists in database
        stock_data = stocks_collection.find_one({"ticker": ticker})
        
        current_time = datetime.now()
        
        # Check if we need to update from API
        needs_update = True
        if stock_data and "last_updated" in stock_data:
            # Convert string time to datetime if needed
            last_updated = stock_data["last_updated"]
            if isinstance(last_updated, str):
                try:
                    last_updated = datetime.fromisoformat(last_updated.replace('Z', '+00:00'))
                except ValueError:
                    try:
                        last_updated = datetime.strptime(last_updated, "%Y-%m-%dT%H:%M:%S.%f")
                    except ValueError:
                        # Fallback for any datetime format issues
                        last_updated = current_time - timedelta(days=2)
            
            # Only update if data is over 1 day old
            if (current_time - last_updated) < timedelta(days=1):
                needs_update = False
        
        # If stock doesn't exist or needs update, fetch from API
        if not stock_data or needs_update:
            # Fetch from Alpha Vantage
            API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")
            if not API_KEY:
                logger.warning("No Alpha Vantage API key found, using mock data")
                # Return mock data if no API key
                return {
                    "ticker": ticker,
                    "price": 150.0,
                    "change": 2.5,
                    "change_percent": "1.5",
                    "last_updated": current_time
                }
                
            BASE_URL = "https://www.alphavantage.co/query"
            
            try:
                response = requests.get(BASE_URL, params={
                    "function": "GLOBAL_QUOTE",
                    "symbol": ticker,
                    "apikey": API_KEY
                })
                
                if response.status_code == 200:
                    av_data = response.json()
                    if "Global Quote" in av_data and av_data["Global Quote"]:
                        quote = av_data["Global Quote"]
                        if "05. price" in quote:  # Make sure we have valid data
                            stock_data = {
                                "ticker": ticker,
                                "price": float(quote.get("05. price", 0)),
                                "change": float(quote.get("09. change", 0)),
                                "change_percent": quote.get("10. change percent", "0%").strip("%"),
                                "last_updated": current_time
                            }
                            
                            # Update database
                            stocks_collection.update_one(
                                {"ticker": ticker},
                                {"$set": stock_data},
                                upsert=True
                            )
                        else:
                            # Return mock data if we can't get real data
                            logger.warning(f"Invalid Alpha Vantage data for {ticker}")
                            stock_data = {
                                "ticker": ticker,
                                "price": 150.0,
                                "change": 2.5,
                                "change_percent": "1.5",
                                "last_updated": current_time
                            }
                    else:
                        # Return mock data if we can't get real data
                        logger.warning(f"No Alpha Vantage data for {ticker}")
                        stock_data = {
                            "ticker": ticker,
                            "price": 150.0,
                            "change": 2.5,
                            "change_percent": "1.5",
                            "last_updated": current_time
                        }
            except Exception as e:
                logger.error(f"Error fetching Alpha Vantage data: {e}")
                # Return mock data on error
                stock_data = {
                    "ticker": ticker,
                    "price": 150.0,
                    "change": 2.5,
                    "change_percent": "1.5",
                    "last_updated": current_time
                }
                
    except Exception as e:
        logger.error(f"Error in get_stock_data: {e}")
        # Return mock data on any error
        stock_data = {
            "ticker": ticker,
            "price": 150.0,
            "change": 2.5,
            "change_percent": "1.5", 
            "last_updated": datetime.now()
        }
                
    return stock_data
