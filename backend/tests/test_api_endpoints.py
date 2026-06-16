import pytest
from fastapi import HTTPException

import server
from schemas import (
    AnalysisMetrics,
    AnalysisResponse,
    SentimentSummary,
    StockSummary,
)


def test_health_endpoint():
    assert server.health() == {"status": "ok"}


@pytest.mark.asyncio
async def test_analysis_endpoint_returns_normalized_contract(monkeypatch):
    async def fake_analysis(ticker, period, days, limit):
        assert ticker == "NVDA"
        assert period == "1mo"
        assert days == 30
        assert limit == 30
        return AnalysisResponse(
            ticker="NVDA",
            stock=StockSummary(symbol="NVDA", currentPrice=100, history=[]),
            sentiment=SentimentSummary(
                label="negative",
                displayLabel="Bearish Reddit mood",
                score=-0.3,
                postCount=4,
            ),
            sentimentSeries=[],
            posts=[],
            metrics=AnalysisMetrics(
                averageSentiment=-0.3,
                alignment="inverse",
                alignmentLabel="Reddit leaned one way while price moved the other",
                inverseSignal="watch",
            ),
            generatedAt="2026-06-15T00:00:00Z",
            sources=["Defeat Beta API", "Reddit", "VADER"],
            partialErrors=[],
        )

    monkeypatch.setattr(server.analysis_service, "get_analysis", fake_analysis)

    response = await server.get_analysis("nvda", period="1mo", days=30, limit=30)

    data = response.model_dump()
    assert data["ticker"] == "NVDA"
    assert data["sentiment"]["label"] == "negative"
    assert data["metrics"]["alignment"] == "inverse"


@pytest.mark.asyncio
async def test_analysis_endpoint_validates_ticker():
    with pytest.raises(HTTPException) as exc:
        await server.get_analysis("123INVALID", period="1mo", days=30, limit=30)

    assert exc.value.status_code == 422


@pytest.mark.asyncio
async def test_legacy_routes_validate_ticker():
    with pytest.raises(HTTPException) as exc:
        await server.get_reddit_data("123INVALID", limit=1)

    assert exc.value.status_code == 422


@pytest.mark.asyncio
async def test_legacy_reddit_endpoint_uses_mocked_provider(monkeypatch):
    async def fake_posts(_ticker, limit=30):
        return [
            {
                "id": "abc",
                "username": "u/test",
                "handle": "test",
                "avatar": "https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png",
                "content": "AAPL maybe",
                "platform": "reddit",
                "date": 1750184049,
                "sentiment": "neutral",
                "score": 0.0,
                "likes": 10,
                "comments": 2,
                "url": "https://reddit.com/example",
                "subreddit": "stocks",
            }
        ][:limit]

    monkeypatch.setattr(server.fetch_reddit_data, "get_reddit_data", fake_posts)

    response = await server.get_reddit_data("AAPL", limit=1)

    assert response[0]["sentiment"] == "neutral"


def test_app_exposes_analysis_route():
    paths = {route.path for route in server.app.routes}

    assert "/api/analysis/{ticker}" in paths
