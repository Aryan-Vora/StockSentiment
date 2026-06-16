from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

import pytest

import fetch_reddit_data


def test_classify_sentiment_thresholds():
    assert fetch_reddit_data.classify_sentiment(0.05) == "positive"
    assert fetch_reddit_data.classify_sentiment(-0.05) == "negative"
    assert fetch_reddit_data.classify_sentiment(0.049) == "neutral"
    assert fetch_reddit_data.classify_sentiment(-0.049) == "neutral"


def test_format_submission_returns_frontend_contract(monkeypatch):
    monkeypatch.setattr(fetch_reddit_data.random, "randint", lambda _start, _end: 3)
    submission = SimpleNamespace(
        id="abc123",
        title="NVDA is unstoppable",
        selftext="Calls everywhere",
        author=SimpleNamespace(name="valuehunter"),
        created_utc=1750184049,
        score=420,
        num_comments=69,
        url="https://reddit.com/r/stocks/comments/abc123",
        subreddit=SimpleNamespace(display_name="stocks"),
    )

    post = fetch_reddit_data.format_submission(submission)

    assert post["id"] == "abc123"
    assert post["username"] == "u/valuehunter"
    assert post["platform"] == "reddit"
    assert post["sentiment"] in {"positive", "neutral", "negative"}
    assert isinstance(post["score"], float)
    assert post["avatar"].endswith("avatar_default_3.png")
    assert post["subreddit"] == "stocks"


@pytest.mark.asyncio
async def test_categorize_sentiment_uses_normalized_labels(monkeypatch):
    async def fake_posts(_ticker, limit=10):
        return [
            {"score": 0.7},
            {"score": 0.3},
        ]

    monkeypatch.setattr(fetch_reddit_data, "get_reddit_data", fake_posts)

    result = await fetch_reddit_data.categorize_sentiment("NVDA")

    assert result["label"] == "positive"
    assert result["sentiment"] == "Bullish market sentiment"
    assert result["displayLabel"] == "Bullish Reddit mood"
    assert result["score"] == pytest.approx(0.5)
    assert result["postCount"] == 2


@pytest.mark.asyncio
async def test_categorize_sentiment_handles_no_posts(monkeypatch):
    async def fake_posts(_ticker, limit=10):
        return []

    monkeypatch.setattr(fetch_reddit_data, "get_reddit_data", fake_posts)

    result = await fetch_reddit_data.categorize_sentiment("EMPTY")

    assert result == {
        "sentiment": "No market sentiment",
        "label": "neutral",
        "displayLabel": "No Reddit posts found",
        "score": 0.0,
        "postCount": 0,
    }


@pytest.mark.asyncio
async def test_get_sentiment_timeseries_groups_recent_posts(monkeypatch):
    now = datetime.now(timezone.utc)
    today = now.timestamp()
    yesterday = (now - timedelta(days=1)).timestamp()

    async def fake_posts(_ticker, limit=50):
        return [
            {"date": today, "score": 0.4},
            {"date": today, "score": 0.2},
            {"date": yesterday, "score": -0.4},
        ]

    monkeypatch.setattr(fetch_reddit_data, "get_reddit_data", fake_posts)

    series = await fetch_reddit_data.get_sentiment_timeseries("AAPL", days=2)

    assert len(series) == 3
    assert series[-1]["score"] == pytest.approx(0.3)
    assert series[-1]["sentiment"] == "positive"
    assert series[-1]["post_count"] == 2
    assert series[-2]["sentiment"] == "negative"


def test_get_async_reddit_requires_credentials(monkeypatch):
    monkeypatch.setattr(fetch_reddit_data, "app_id", None)
    monkeypatch.setattr(fetch_reddit_data, "client_secret", None)

    with pytest.raises(RuntimeError, match="Reddit credentials"):
        fetch_reddit_data.get_async_reddit()
