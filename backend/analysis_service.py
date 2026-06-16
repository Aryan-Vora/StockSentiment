from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Any

from starlette.concurrency import run_in_threadpool

import fetch_reddit_data
import fetch_stock_data
from schemas import (
    AnalysisMetrics,
    AnalysisResponse,
    SentimentSummary,
    StockHistoryPoint,
    StockSummary,
)


def _as_float(value: Any) -> float | None:
    try:
        if value is None:
            return None
        number = float(value)
        if math.isnan(number) or math.isinf(number):
            return None
        return number
    except (TypeError, ValueError):
        return None


def _as_int(value: Any) -> int | None:
    number = _as_float(value)
    return int(number) if number is not None else None


def _normalize_stock(ticker: str, stock_data: dict[str, Any] | None) -> StockSummary | None:
    if not stock_data:
        return None

    info = stock_data.get("info") or {}
    history = [
        StockHistoryPoint(
            date=row.get("Date") or row.get("date"),
            open=_as_float(row.get("Open") if "Open" in row else row.get("open")),
            high=_as_float(row.get("High") if "High" in row else row.get("high")),
            low=_as_float(row.get("Low") if "Low" in row else row.get("low")),
            close=_as_float(row.get("Close") if "Close" in row else row.get("close")),
            volume=_as_int(row.get("Volume") if "Volume" in row else row.get("volume")),
        )
        for row in stock_data.get("history", [])
        if row.get("Date") or row.get("date")
    ]

    current_price = _as_float(info.get("currentPrice"))
    if current_price is None and history:
        current_price = history[-1].close

    previous_close = _as_float(info.get("previousClose"))
    if previous_close is None and len(history) > 1:
        previous_close = history[-2].close

    change = _as_float(info.get("regularMarketChange"))
    change_percent = _as_float(info.get("regularMarketChangePercent"))
    if change is None and current_price is not None and previous_close is not None:
        change = current_price - previous_close
    if change_percent is None and change is not None and previous_close:
        change_percent = (change / previous_close) * 100

    return StockSummary(
        symbol=str(info.get("symbol") or ticker),
        name=info.get("longName") or info.get("shortName"),
        currentPrice=current_price,
        previousClose=previous_close,
        change=change,
        changePercent=change_percent,
        currency=info.get("currency"),
        sector=info.get("sector"),
        industry=info.get("industry"),
        marketCap=_as_int(info.get("marketCap")),
        volume=_as_int(info.get("regularMarketVolume") or info.get("volume")),
        fiftyTwoWeekLow=_as_float(info.get("fiftyTwoWeekLow")),
        fiftyTwoWeekHigh=_as_float(info.get("fiftyTwoWeekHigh")),
        peRatio=_as_float(info.get("trailingPE")),
        beta=_as_float(info.get("beta")),
        history=history,
    )


def _build_sentiment(posts: list[dict[str, Any]]) -> SentimentSummary:
    if not posts:
        return SentimentSummary(
            label="neutral",
            displayLabel="No Reddit posts found",
            score=0.0,
            postCount=0,
        )

    average = sum(float(post["score"]) for post in posts) / len(posts)
    label = fetch_reddit_data.classify_sentiment(average)
    return SentimentSummary(
        label=label,
        displayLabel=fetch_reddit_data.sentiment_display_label(label),
        score=average,
        postCount=len(posts),
    )


def _pearson(x_values: list[float], y_values: list[float]) -> float | None:
    if len(x_values) < 3 or len(x_values) != len(y_values):
        return None
    x_mean = sum(x_values) / len(x_values)
    y_mean = sum(y_values) / len(y_values)
    numerator = sum((x - x_mean) * (y - y_mean) for x, y in zip(x_values, y_values))
    x_denominator = math.sqrt(sum((x - x_mean) ** 2 for x in x_values))
    y_denominator = math.sqrt(sum((y - y_mean) ** 2 for y in y_values))
    if not x_denominator or not y_denominator:
        return None
    return round(numerator / (x_denominator * y_denominator), 3)


def _build_metrics(
    stock: StockSummary | None,
    sentiment: SentimentSummary,
    sentiment_series: list[dict[str, Any]],
) -> AnalysisMetrics:
    history = stock.history if stock else []
    closes = [point.close for point in history if point.close is not None]
    if len(closes) < 2 or sentiment.postCount == 0:
        return AnalysisMetrics(
            averageSentiment=sentiment.score if sentiment.postCount else None,
            alignment="insufficient_data",
            alignmentLabel="Not enough Reddit and price data yet",
            inverseSignal="unknown",
        )

    price_change = closes[-1] - closes[0]
    price_change_percent = (price_change / closes[0]) * 100 if closes[0] else None
    if price_change_percent is None:
        price_direction = "unknown"
    elif price_change_percent > 0.5:
        price_direction = "up"
    elif price_change_percent < -0.5:
        price_direction = "down"
    else:
        price_direction = "flat"

    sentiment_direction = {
        "positive": "up",
        "negative": "down",
        "neutral": "flat",
    }[sentiment.label]

    if price_direction == "unknown":
        alignment = "insufficient_data"
    elif price_direction == "flat" or sentiment_direction == "flat":
        alignment = "mixed"
    elif price_direction == sentiment_direction:
        alignment = "aligned"
    else:
        alignment = "inverse"

    alignment_label = {
        "aligned": "Reddit and price moved in the same direction",
        "inverse": "Reddit leaned one way while price moved the other",
        "mixed": "The signal is noisy or flat",
        "insufficient_data": "Not enough data yet",
    }[alignment]

    inverse_signal = "none"
    if alignment == "inverse":
        inverse_signal = "strong" if abs(sentiment.score) >= 0.2 and abs(price_change_percent or 0) >= 2 else "watch"
    elif alignment == "mixed":
        inverse_signal = "unclear"

    sentiment_by_date = {item["date"]: item["score"] for item in sentiment_series}
    matched_sentiment: list[float] = []
    matched_prices: list[float] = []
    base_close = closes[0]
    for point in history:
        if point.close is None or point.date not in sentiment_by_date or not base_close:
            continue
        matched_sentiment.append(float(sentiment_by_date[point.date]))
        matched_prices.append(((point.close - base_close) / base_close) * 100)

    return AnalysisMetrics(
        averageSentiment=sentiment.score,
        priceChange=round(price_change, 3),
        priceChangePercent=round(price_change_percent, 3) if price_change_percent is not None else None,
        priceDirection=price_direction,
        alignment=alignment,
        alignmentLabel=alignment_label,
        inverseSignal=inverse_signal,
        correlation=_pearson(matched_sentiment, matched_prices),
    )


async def get_analysis(ticker: str, period: str, days: int, limit: int) -> AnalysisResponse:
    normalized_ticker = ticker.upper().strip()
    partial_errors: list[str] = []
    stock = None
    posts: list[dict[str, Any]] = []
    sentiment_series: list[dict[str, Any]] = []

    try:
        stock_data = await run_in_threadpool(fetch_stock_data.get_stock_data, normalized_ticker, period)
        stock = _normalize_stock(normalized_ticker, stock_data)
    except Exception as exc:
        partial_errors.append(f"Stock data unavailable: {exc}")

    try:
        posts = await fetch_reddit_data.get_reddit_data(normalized_ticker, limit=limit)
        sentiment_series = await fetch_reddit_data.get_sentiment_timeseries(normalized_ticker, days=days)
    except Exception as exc:
        partial_errors.append(f"Reddit data unavailable: {exc}")

    sentiment = _build_sentiment(posts)
    metrics = _build_metrics(stock, sentiment, sentiment_series)

    return AnalysisResponse(
        ticker=normalized_ticker,
        stock=stock,
        sentiment=sentiment,
        sentimentSeries=sentiment_series,
        posts=posts,
        metrics=metrics,
        generatedAt=datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        sources=["Defeat Beta API", "Reddit", "VADER"],
        partialErrors=partial_errors,
    )
