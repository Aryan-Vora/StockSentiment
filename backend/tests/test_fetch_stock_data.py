import pandas as pd

import fetch_stock_data


def test_get_stock_data_normalizes_history_and_uses_cache(monkeypatch):
    fetch_stock_data._stock_cache.clear()
    calls = {"count": 0}

    def fake_provider_frames(ticker):
        calls["count"] += 1
        assert ticker == "TEST"
        return {
            "price": pd.DataFrame([
                {
                    "symbol": "TEST",
                    "report_date": "2026-06-14",
                    "open": 10.0,
                    "high": 12.0,
                    "low": 9.5,
                    "close": 11.5,
                    "volume": 1000,
                },
                {
                    "symbol": "TEST",
                    "report_date": "2026-06-15",
                    "open": 11.5,
                    "high": 13.0,
                    "low": 8.75,
                    "close": 12.5,
                    "volume": 2000,
                },
            ]),
            "market_cap": pd.DataFrame([
                {
                    "symbol": "TEST",
                    "report_date": "2026-06-15",
                    "market_capitalization": 1_250_000_000,
                },
            ]),
            "ttm_pe": pd.DataFrame([
                {
                    "symbol": "TEST",
                    "report_date": "2026-06-15",
                    "ttm_pe": 19.7,
                },
            ]),
            "beta": pd.DataFrame([
                {
                    "symbol": "TEST",
                    "report_date": "2026-06-15",
                    "beta": 1.23,
                },
            ]),
        }

    monkeypatch.setattr(fetch_stock_data, "_fetch_provider_frames", fake_provider_frames)

    first = fetch_stock_data.get_stock_data("test")
    second = fetch_stock_data.get_stock_data("TEST")

    assert calls["count"] == 1
    assert first == second
    assert first["info"]["symbol"] == "TEST"
    assert first["info"]["currentPrice"] == 12.5
    assert first["info"]["previousClose"] == 11.5
    assert first["info"]["volume"] == 2000
    assert first["info"]["marketCap"] == 1_250_000_000.0
    assert first["info"]["fiftyTwoWeekLow"] == 8.75
    assert first["info"]["fiftyTwoWeekHigh"] == 13.0
    assert first["info"]["trailingPE"] == 19.7
    assert first["info"]["beta"] == 1.23
    assert first["info"]["dataProvider"] == "Defeat Beta API"
    assert first["history"][0] == {
        "Date": "2026-06-14",
        "Open": 10.0,
        "High": 12.0,
        "Low": 9.5,
        "Close": 11.5,
        "Volume": 1000,
        "Dividends": None,
        "Stock Splits": None,
    }
