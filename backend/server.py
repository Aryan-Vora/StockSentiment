import re

import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

import analysis_service
import fetch_reddit_data
import fetch_stock_data
from schemas import AnalysisResponse

TICKER_PATTERN = r"^[A-Za-z][A-Za-z0-9.\-]{0,9}$"
PERIOD_PATTERN = r"^(5d|1mo|3mo|6mo|1y|2y|5y|all)$"
TICKER_ERROR = "Ticker must be 1-10 letters, numbers, dots, or dashes."

app = FastAPI(
    title="StockSentiment API",
    description="Compare Reddit sentiment with actual stock price movement.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://stock-sentiment-eosin.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)


def validate_ticker(ticker: str) -> str:
    normalized = ticker.upper().strip()
    if not re.fullmatch(TICKER_PATTERN, normalized):
        raise HTTPException(status_code=422, detail=TICKER_ERROR)
    return normalized


@app.get("/")
def read_root():
    return {"message": "Welcome to the Stock Sentiment API"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/stock/{ticker}")
async def get_stock_data(
    ticker: str,
    period: str = Query("1mo", pattern=PERIOD_PATTERN),
):
    normalized_ticker = validate_ticker(ticker)
    try:
        return fetch_stock_data.get_stock_data(normalized_ticker, period=period)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/reddit/{ticker}")
async def get_reddit_data(
    ticker: str,
    limit: int = Query(30, ge=1, le=100),
):
    normalized_ticker = validate_ticker(ticker)
    try:
        return await fetch_reddit_data.get_reddit_data(normalized_ticker, limit=limit)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/redditSentiment/{ticker}")
async def get_sentiment(ticker: str):
    normalized_ticker = validate_ticker(ticker)
    try:
        return await fetch_reddit_data.categorize_sentiment(normalized_ticker)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/sentimentTimeseries/{ticker}")
async def get_sentiment_timeseries(
    ticker: str,
    days: int = Query(30, ge=1, le=3650),
):
    normalized_ticker = validate_ticker(ticker)
    try:
        return await fetch_reddit_data.get_sentiment_timeseries(normalized_ticker, days)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/analysis/{ticker}", response_model=AnalysisResponse)
async def get_analysis(
    ticker: str,
    period: str = Query("1mo", pattern=PERIOD_PATTERN),
    days: int = Query(30, ge=1, le=3650),
    limit: int = Query(30, ge=1, le=100),
):
    normalized_ticker = validate_ticker(ticker)
    return await analysis_service.get_analysis(normalized_ticker, period=period, days=days, limit=limit)


if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        reload=True,
        port=8000,
    )
