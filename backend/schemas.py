from typing import Literal

from pydantic import BaseModel, Field


SentimentLabel = Literal["positive", "neutral", "negative"]
AlignmentLabel = Literal["aligned", "inverse", "mixed", "insufficient_data"]
PriceDirection = Literal["up", "down", "flat", "unknown"]


class StockHistoryPoint(BaseModel):
    date: str
    open: float | None = None
    high: float | None = None
    low: float | None = None
    close: float | None = None
    volume: int | None = None


class StockSummary(BaseModel):
    symbol: str
    name: str | None = None
    currentPrice: float | None = None
    previousClose: float | None = None
    change: float | None = None
    changePercent: float | None = None
    currency: str | None = None
    sector: str | None = None
    industry: str | None = None
    marketCap: int | None = None
    volume: int | None = None
    fiftyTwoWeekLow: float | None = None
    fiftyTwoWeekHigh: float | None = None
    peRatio: float | None = None
    beta: float | None = None
    history: list[StockHistoryPoint] = Field(default_factory=list)


class RedditPost(BaseModel):
    id: str
    username: str
    handle: str
    avatar: str
    content: str
    platform: Literal["reddit"] = "reddit"
    date: float
    sentiment: SentimentLabel
    score: float
    likes: int
    comments: int
    url: str
    subreddit: str


class SentimentSummary(BaseModel):
    label: SentimentLabel
    displayLabel: str
    score: float
    postCount: int


class SentimentTimeseriesPoint(BaseModel):
    date: str
    score: float
    sentiment: SentimentLabel
    post_count: int


class AnalysisMetrics(BaseModel):
    averageSentiment: float | None = None
    priceChange: float | None = None
    priceChangePercent: float | None = None
    priceDirection: PriceDirection = "unknown"
    alignment: AlignmentLabel = "insufficient_data"
    alignmentLabel: str = "Not enough data yet"
    inverseSignal: str = "unknown"
    correlation: float | None = None


class AnalysisResponse(BaseModel):
    ticker: str
    stock: StockSummary | None = None
    sentiment: SentimentSummary
    sentimentSeries: list[SentimentTimeseriesPoint] = Field(default_factory=list)
    posts: list[RedditPost] = Field(default_factory=list)
    metrics: AnalysisMetrics
    generatedAt: str
    sources: list[str] = Field(default_factory=list)
    partialErrors: list[str] = Field(default_factory=list)
