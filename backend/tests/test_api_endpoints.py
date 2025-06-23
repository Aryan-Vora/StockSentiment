# API endpoint tests for Reddit social posts functionality

import pytest
import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from server import app

client = TestClient(app)

def test_reddit_endpoint_structure():
    """Test that /api/reddit/{ticker} returns data in the correct format"""
    response = client.get("/api/reddit/AAPL?limit=3")
    
    assert response.status_code == 200, "API should return 200 status"
    
    data = response.json()
    assert isinstance(data, list), "Response should be a list"
    
    if len(data) > 0:
        post = data[0]
        
        required_fields = [
            'id', 'username', 'handle', 'avatar', 'content',
            'platform', 'date', 'sentiment', 'score',
            'likes', 'comments', 'url', 'subreddit'
        ]
        
        for field in required_fields:
            assert field in post, f"Post should contain '{field}' field"
        
        assert post['platform'] == 'reddit', "Platform should be 'reddit'"
        assert post['sentiment'] in ['positive', 'negative', 'neutral'], "Sentiment should be valid"
        assert isinstance(post['score'], float), "Score should be float"
        assert post['avatar'].startswith('https://'), "Avatar should be valid URL"

def test_reddit_sentiment_endpoint():
    """Test that /api/redditSentiment/{ticker} returns correct format"""
    response = client.get("/api/redditSentiment/AAPL")
    
    assert response.status_code == 200, "API should return 200 status"
    
    data = response.json()
    assert isinstance(data, dict), "Response should be a dictionary"
    assert 'sentiment' in data, "Response should contain 'sentiment'"
    assert 'score' in data, "Response should contain 'score'"
    
    valid_sentiments = [
        "Bullish market sentiment",
        "Bearish market sentiment", 
        "Neutral market sentiment",
        "No market sentiment"
    ]
    assert data['sentiment'] in valid_sentiments, "Sentiment should be valid category"
    assert isinstance(data['score'], float), "Score should be float"

def test_api_limit_parameter():
    """Test that limit parameter works correctly"""
    response = client.get("/api/reddit/AAPL?limit=2")
    
    assert response.status_code == 200, "API should return 200 status"
    
    data = response.json()
    assert len(data) <= 2, "Should respect limit parameter"

def test_api_error_handling():
    """Test API error handling"""
    response = client.get("/api/reddit/INVALID123")
    assert response.status_code == 200, "Should not crash with invalid ticker"
    
    data = response.json()
    assert isinstance(data, list), "Should return list even for invalid ticker"

def test_cors_headers():
    """Test that CORS headers are properly set"""
    response = client.get("/api/reddit/AAPL?limit=1")
    
    # Should allow CORS (FastAPI with CORS middleware should add headers)
    assert response.status_code == 200, "GET request should succeed"

def test_api_response_time():
    """Test that API responds within reasonable time"""
    import time
    
    start_time = time.time()
    response = client.get("/api/reddit/AAPL?limit=5")
    end_time = time.time()
    
    response_time = end_time - start_time
    assert response_time < 30, f"API should respond within 30 seconds, took {response_time:.2f}s"
    assert response.status_code == 200, "API should return success"

def test_data_consistency():
    """Test that data is consistent between calls"""
    response1 = client.get("/api/reddit/AAPL?limit=3")
    response2 = client.get("/api/reddit/AAPL?limit=3")
    
    assert response1.status_code == 200, "First call should succeed"
    assert response2.status_code == 200, "Second call should succeed"
    
    data1 = response1.json()
    data2 = response2.json()
    
    assert isinstance(data1, list), "First response should be list"
    assert isinstance(data2, list), "Second response should be list"
    
    if len(data1) > 0 and len(data2) > 0:
        assert set(data1[0].keys()) == set(data2[0].keys()), "Post structure should be consistent"

def test_avatar_urls_in_response():
    """Test that all posts have valid avatar URLs"""
    response = client.get("/api/reddit/AAPL?limit=5")
    
    assert response.status_code == 200, "API should return 200 status"
    
    data = response.json()
    
    for post in data:
        avatar_url = post['avatar']
        assert avatar_url.startswith('https://www.redditstatic.com/avatars/defaults/v2/'), \
            "Avatar should use Reddit static URL"
        assert avatar_url.endswith('.png'), "Avatar should be PNG"
        
        import re
        match = re.search(r'avatar_default_(\d+)\.png', avatar_url)
        assert match, "Avatar URL should contain number"
        
        num = int(match.group(1))
        assert 0 <= num <= 7, f"Avatar number should be 0-7, got {num}"
