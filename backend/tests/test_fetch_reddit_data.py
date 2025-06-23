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
        assert "username" in post, "Post should contain 'username'"
        assert "handle" in post, "Post should contain 'handle'"
        assert "avatar" in post, "Post should contain 'avatar'"
        assert "content" in post, "Post should contain 'content'"
        assert "platform" in post, "Post should contain 'platform'"
        assert "date" in post, "Post should contain 'date'"
        assert "sentiment" in post, "Post should contain 'sentiment'"
        assert "score" in post, "Post should contain 'score'"
        assert "likes" in post, "Post should contain 'likes'"
        assert "comments" in post, "Post should contain 'comments'"
        assert "url" in post, "Post should contain 'url'"
        assert "subreddit" in post, "Post should contain 'subreddit'"
        
        assert isinstance(post["id"], str), "'id' should be a string"
        assert isinstance(post["username"], str), "'username' should be a string"
        assert isinstance(post["handle"], str), "'handle' should be a string"
        assert isinstance(post["avatar"], str), "'avatar' should be a string"
        assert isinstance(post["content"], str), "'content' should be a string"
        assert post["platform"] == "reddit", "'platform' should be 'reddit'"
        assert isinstance(post["date"], (int, float)), "'date' should be a number"
        assert post["sentiment"] in ["positive", "negative", "neutral"], "'sentiment' should be valid category"
        assert isinstance(post["score"], float), "'score' should be a float"
        assert isinstance(post["likes"], int), "'likes' should be an integer"
        assert isinstance(post["comments"], int), "'comments' should be an integer"
        assert isinstance(post["url"], str), "'url' should be a string"
        assert isinstance(post["subreddit"], str), "'subreddit' should be a string"
        
        assert "redditstatic.com/avatars/defaults/v2/avatar_default_" in post["avatar"], "Avatar should be a default Reddit avatar"
        assert post["avatar"].endswith(".png"), "Avatar should be a PNG file"

@pytest.mark.asyncio
async def test_get_reddit_data_empty_ticker():
    """Test with empty ticker should still return a list"""
    posts = await get_reddit_data("", limit=5)
    assert isinstance(posts, list), "Response should be a list even with empty ticker"

@pytest.mark.asyncio
async def test_get_reddit_data_limit():
    """Test that limit parameter is respected"""
    posts = await get_reddit_data("AAPL", limit=3)
    assert len(posts) <= 3, "Response should respect the limit parameter"

@pytest.mark.asyncio
async def test_categorize_sentiment():
    sentiment = await categorize_sentiment("NVDA")
    assert isinstance(sentiment, dict), "Response should be a dictionary"
    assert "sentiment" in sentiment, "Response should contain 'sentiment'"
    assert "score" in sentiment, "Response should contain 'score'"
    assert isinstance(sentiment["score"], float), "'score' should be a float"
    
    valid_sentiments = [
        "Bullish market sentiment",
        "Bearish market sentiment", 
        "Neutral market sentiment",
        "No market sentiment"
    ]
    assert sentiment["sentiment"] in valid_sentiments, f"Sentiment should be one of {valid_sentiments}"
    
    assert 0 <= sentiment["score"] <= 1.5, "Score should be between 0 and 1.5"

@pytest.mark.asyncio
async def test_categorize_sentiment_no_posts():
    """Test sentiment categorization when no posts are found"""
    # this ticker should not have posts (hopefully lol)
    sentiment = await categorize_sentiment("kasjdflkssajfklsajflksadjf")
    assert sentiment["sentiment"] == "No market sentiment", "Should return 'No market sentiment' for no posts"
    assert sentiment["score"] == 0.5, "Score should be 0.5 for no posts"


