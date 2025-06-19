import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fetch_stock_data import get_stock_data

def test_get_stock_data():
    data = get_stock_data("NVDA")
    assert isinstance(data, dict), "Response should be a dictionary"
    assert "info" in data, "Response should contain 'info'"
    assert "history" in data, "Response should contain 'history'"
    assert isinstance(data["info"], dict), "'info' should be a dictionary"
    assert isinstance(data["history"], list), "'history' should be a list"
    assert len(data["history"]) > 0, "'history' should contain at least one record"
    for record in data["history"]:
        assert isinstance(record, dict), "Each record in 'history' should be a dictionary"
        assert "Open" in record, "Each record should contain 'Open'"
        assert "High" in record, "Each record should contain 'High'"
        assert "Low" in record, "Each record should contain 'Low'"
        assert "Close" in record, "Each record should contain 'Close'"
        assert "Volume" in record, "Each record should contain 'Volume'"
    assert data["info"]["symbol"] == "NVDA", "Ticker symbol in 'info' should match the requested ticker"

def test_info_contains_some_expected_fields():
    expected_fields = [
        "symbol",
        "longName",
        "sector",
        "industry",
        "marketCap",
        "currentPrice",
        "website",
        "country",
        "dividendYield",
        "beta"
    ]
    data = get_stock_data("NVDA")
    info = data["info"]
    missing = [field for field in expected_fields if field not in info]
    assert not missing, f"Missing fields in info: {missing}"

    data = get_stock_data("NVDA")
    info = data["info"]
    missing = [field for field in expected_fields if field not in info]
    assert not missing, f"Missing fields in info: {missing}"

