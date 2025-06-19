# This file tests tests all functions in fetch_reddit_data.py to ensure they return valid responses.

import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fetch_reddit_data import get_reddit_data, categorize_sentiment

@pytest.mark.asyncio
async def test_get_reddit_data():
    posts = await get_reddit_data("NVDA", limit=5)
    assert isinstance(posts, list), "Response should be a list"
    assert len(posts) <= 5, "Response should contain at most 5 posts"
    for post in posts:
        assert "id" in post, "Post should contain 'id'"
        assert "title" in post, "Post should contain 'title'"
        assert "content" in post, "Post should contain 'content'"
        assert "url" in post, "Post should contain 'url'"
        assert "sentiment" in post, "Post should contain 'sentiment'"
        assert isinstance(post["sentiment"], dict), "'sentiment' should be a dictionary"
        assert "compound" in post["sentiment"], "'sentiment' should contain 'compound'"

@pytest.mark.asyncio
async def test_categorize_sentiment():
    sentiment = await categorize_sentiment("NVDA")
    assert isinstance(sentiment, dict), "Response should be a dictionary"
    assert "sentiment" in sentiment, "Response should contain 'sentiment'"
    assert "score" in sentiment, "Response should contain 'score'"
    assert isinstance(sentiment["score"], float), "'score' should be a float"
    sentiment = await categorize_sentiment("NVDA")
    assert isinstance(sentiment, dict), "Response should be a dictionary"
    assert "sentiment" in sentiment, "Response should contain 'sentiment'"
    assert "score" in sentiment, "Response should contain 'score'"
    assert isinstance(sentiment["score"], float), "'score' should be a float"
