import os
from dotenv import load_dotenv
from db import get_stock_data
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# List of stock tickers (replace with dynamic fetching if needed)
tickers = ["AAPL", "TSLA", "GOOGL", "MSFT", "AMZN", "META", "NFLX", "GOOG"]

def fetch_all_stock_data():
    """Fetch stock data for all tickers in the list"""
    logger.info(f"Starting stock data fetch at {datetime.now()}")
    for ticker in tickers:
        try:
            # This will update data if needed
            stock_data = get_stock_data(ticker)
            logger.info(f"Updated stock data for {ticker}: price={stock_data.get('price', 'N/A')}")
        except Exception as e:
            logger.error(f"Error fetching data for {ticker}: {e}")
    
    logger.info(f"Completed stock data fetch at {datetime.now()}")

if __name__ == "__main__":
    fetch_all_stock_data()
