from fastapi import FastAPI, Query
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import fetch_reddit_data
import fetch_stock_data

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Stock Sentiment API"}


@app.get("/api/stock/{ticker}")
async def get_stock_data(ticker: str):
    return fetch_stock_data.get_stock_data(ticker)


@app.get("/api/reddit/{ticker}")
async def get_reddit_data(ticker: str, limit: int = 30):
    return await fetch_reddit_data.get_reddit_data(ticker, limit=limit)


@app.get("/api/redditSentiment/{ticker}")
async def get_sentiment(ticker: str):
    return await fetch_reddit_data.categorize_sentiment(ticker)


@app.get("/api/sentimentTimeseries/{ticker}")
async def get_sentiment_timeseries(ticker: str, days: int = 30):
    return await fetch_reddit_data.get_sentiment_timeseries(ticker, days)

if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        reload=True,
        port=8000,
    )
