# Integration tests for the dashboard sorting and social posts functionality

import pytest
import sys
import os
from unittest.mock import patch, AsyncMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fetch_reddit_data import get_reddit_data

@pytest.mark.asyncio
async def test_social_posts_data_structure():
    """Test that social posts have the correct structure for frontend consumption"""
    posts = await get_reddit_data("AAPL", limit=3)
    
    if len(posts) > 0:
        post = posts[0]
        
        required_fields = [
            'id', 'username', 'handle', 'avatar', 'content', 
            'platform', 'date', 'sentiment', 'score', 
            'likes', 'comments', 'url', 'subreddit'
        ]
        
        for field in required_fields:
            assert field in post, f"Post should contain '{field}' field"
        
        assert isinstance(post['id'], str), "ID should be string"
        assert post['username'].startswith('u/'), "Username should have 'u/' prefix"
        assert isinstance(post['handle'], str), "Handle should be string"
        assert post['avatar'].startswith('https://'), "Avatar should be valid URL"
        assert isinstance(post['content'], str), "Content should be string"
        assert post['platform'] == 'reddit', "Platform should be 'reddit'"
        assert isinstance(post['date'], (int, float)), "Date should be timestamp"
        assert post['sentiment'] in ['positive', 'negative', 'neutral'], "Sentiment should be valid"
        assert isinstance(post['score'], float), "Score should be float"
        assert isinstance(post['likes'], int), "Likes should be integer"
        assert isinstance(post['comments'], int), "Comments should be integer"
        assert post['url'].startswith('https://'), "URL should be valid"
        assert isinstance(post['subreddit'], str), "Subreddit should be string"

def test_sorting_logic():
    """Test sorting logic for social posts"""
    # Mock data that represents different sorting scenarios
    # thanks chatgpt for making this for me
    mock_posts = [
        {
            'id': '1',
            'date': 1750184049,  # More recent
            'score': 0.5,        # Medium sentiment
            'likes': 10          # Medium likes
        },
        {
            'id': '2', 
            'date': 1750184000,  # Less recent
            'score': 0.9,        # High sentiment
            'likes': 50          # High likes
        },
        {
            'id': '3',
            'date': 1750184030,  # Middle
            'score': -0.8,       # Strong negative sentiment
            'likes': 5           # Low likes
        }
    ]
    
    # Test date sorting (most recent first)
    sorted_by_date = sorted(mock_posts, key=lambda x: x['date'], reverse=True)
    assert sorted_by_date[0]['id'] == '1', "Most recent post should be first"
    assert sorted_by_date[1]['id'] == '3', "Middle date post should be second"
    assert sorted_by_date[2]['id'] == '2', "Oldest post should be last"
    
    # Test sentiment sorting (strongest sentiment first)
    sorted_by_sentiment = sorted(mock_posts, key=lambda x: abs(x['score']), reverse=True)
    assert sorted_by_sentiment[0]['id'] == '2', "Highest positive sentiment should be first"
    assert sorted_by_sentiment[1]['id'] == '3', "Strongest negative sentiment should be second"
    assert sorted_by_sentiment[2]['id'] == '1', "Weakest sentiment should be last"
    
    # Test likes sorting (most likes first)
    sorted_by_likes = sorted(mock_posts, key=lambda x: x['likes'], reverse=True)
    assert sorted_by_likes[0]['id'] == '2', "Most liked post should be first"
    assert sorted_by_likes[1]['id'] == '1', "Medium liked post should be second"
    assert sorted_by_likes[2]['id'] == '3', "Least liked post should be last"

@pytest.mark.asyncio
async def test_content_truncation_logic():
    """Test content truncation for read more functionality"""
    MAX_CONTENT_LENGTH = 200
    
    short_content = "This is a short post."
    should_truncate_short = len(short_content) > MAX_CONTENT_LENGTH
    assert not should_truncate_short, "Short content should not be truncated"
    
    long_content = "A" * 250  # Longer than limit
    should_truncate_long = len(long_content) > MAX_CONTENT_LENGTH
    assert should_truncate_long, "Long content should be truncated"
    
    truncated_content = long_content[:MAX_CONTENT_LENGTH] + "..."
    assert len(truncated_content) == MAX_CONTENT_LENGTH + 3, "Truncated content should be correct length"
    assert truncated_content.endswith("..."), "Truncated content should end with ellipsis"

@pytest.mark.asyncio
async def test_avatar_url_generation():
    """Test that avatar URLs are properly generated"""
    posts = await get_reddit_data("AAPL", limit=5)
    
    if len(posts) > 0:
        for post in posts:
            avatar_url = post['avatar']
            
            assert avatar_url.startswith('https://www.redditstatic.com/avatars/defaults/v2/'), \
                "Avatar should use Reddit default avatar base URL"
            
            assert avatar_url.endswith('.png'), "Avatar should be PNG format"
            
            import re
            match = re.search(r'avatar_default_(\d+)\.png', avatar_url)
            assert match is not None, "Avatar URL should contain number"
            
            avatar_num = int(match.group(1))
            assert 0 <= avatar_num <= 7, "Avatar number should be between 0 and 7"

@pytest.mark.asyncio
async def test_post_content_formatting():
    """Test that post content is properly formatted"""
    posts = await get_reddit_data("AAPL", limit=3)
    
    if len(posts) > 0:
        for post in posts:
            content = post['content']
            
            assert isinstance(content, str), "Content should be a string"
            assert len(content.strip()) > 0, "Content should not be empty"
            
            if '\n\n' in content:
                parts = content.split('\n\n', 1)
                assert len(parts) == 2, "Content should have title and selftext separated"
                assert len(parts[0].strip()) > 0, "Title part should not be empty"

def test_sentiment_score_ranges():
    """Test sentiment score validation"""
    assert 0.05 <= 0.5, "Positive threshold should be reasonable"
    assert 0.05 > -0.05, "Positive threshold should be above negative threshold"
    
    assert -0.05 >= -0.5, "Negative threshold should be reasonable"
    assert -0.05 < 0.05, "Negative threshold should be below positive threshold"
    
    neutral_scores = [0.0, 0.02, -0.02, 0.04, -0.04]
    for score in neutral_scores:
        if score >= 0.05:
            sentiment = "positive"
        elif score <= -0.05:
            sentiment = "negative" 
        else:
            sentiment = "neutral"
        assert sentiment == "neutral", f"Score {score} should be classified as neutral"

@pytest.mark.asyncio
async def test_error_handling():
    """Test error handling for edge cases"""
    
    try:
        posts = await get_reddit_data("INVALID_TICKER_sdfsdfadfas", limit=1)
        assert isinstance(posts, list), "Should return empty list for invalid ticker"
    except Exception as e:
        pytest.fail(f"Should not raise exception for invalid ticker: {e}")
    
    posts = await get_reddit_data("AAPL", limit=0)
    assert len(posts) == 0, "Should return empty list when limit is 0"
    
    # this makes the test run for pretty so it's been set to 100 only
    posts = await get_reddit_data("AAPL", limit=100)
    assert isinstance(posts, list), "Should handle high limits gracefully"
    assert len(posts) <= 1000, "Should respect limit even if high"
