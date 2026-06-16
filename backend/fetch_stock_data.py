import math
from datetime import timedelta
from typing import Any

import pandas as pd

from cache import TTLCache


_stock_cache = TTLCache[dict[str, Any]](ttl_seconds=300)
PERIOD_DAYS = {
    "5d": 5,
    "1mo": 31,
    "3mo": 93,
    "6mo": 186,
    "1y": 366,
    "2y": 732,
    "5y": 1830,
    "all": None,
}


def _clean_number(value: Any) -> float | int | None:
    try:
        if value is None:
            return None
        number = float(value)
        if math.isnan(number) or math.isinf(number):
            return None
        return number
    except (TypeError, ValueError):
        return None


def _clean_info(info: dict[str, Any]) -> dict[str, Any]:
    cleaned: dict[str, Any] = {}
    for key, value in info.items():
        if isinstance(value, (str, bool)) or value is None:
            cleaned[key] = value
        elif isinstance(value, (int, float)):
            cleaned[key] = _clean_number(value)
        else:
            cleaned[key] = value
    return cleaned


def _fetch_provider_frames(ticker: str):
    from defeatbeta_api.data.ticker import Ticker

    provider = Ticker(ticker)
    frames = {"price": provider.price()}
    optional_frames = {
        "market_cap": provider.market_capitalization,
        "ttm_pe": provider.ttm_pe,
        "beta": lambda: provider.beta("5y"),
    }

    for key, fetch_frame in optional_frames.items():
        try:
            frames[key] = fetch_frame()
        except Exception:
            frames[key] = None

    return frames


def _row_value(row: Any, key: str) -> Any:
    if hasattr(row, "get"):
        return row.get(key)
    return getattr(row, key, None)


def _format_report_date(value: Any) -> str:
    if hasattr(value, "strftime"):
        return value.strftime("%Y-%m-%d")
    return str(value)[:10]


def _filter_price_frame(price_frame: Any, period: str):
    days = PERIOD_DAYS.get(period)
    if not days or not hasattr(price_frame, "copy"):
        return price_frame

    filtered = price_frame.copy()
    if "report_date" not in getattr(filtered, "columns", []):
        return filtered

    normalized_dates = pd.to_datetime(filtered["report_date"], errors="coerce").dt.date
    latest_date = normalized_dates.max()
    if pd.isna(latest_date):
        return filtered

    cutoff = latest_date - timedelta(days=days)
    return filtered[normalized_dates >= cutoff]


def _latest_row(frame: Any) -> Any | None:
    if frame is None or not hasattr(frame, "empty") or frame.empty:
        return None
    if "report_date" not in getattr(frame, "columns", []):
        return frame.iloc[-1]

    sorted_frame = frame.copy()
    sorted_frame["report_date"] = pd.to_datetime(sorted_frame["report_date"], errors="coerce")
    sorted_frame = sorted_frame.dropna(subset=["report_date"]).sort_values("report_date")
    if sorted_frame.empty:
        return None
    return sorted_frame.iloc[-1]


def _latest_number(frame: Any, *columns: str) -> float | int | None:
    row = _latest_row(frame)
    if row is None:
        return None
    for column in columns:
        value = _clean_number(_row_value(row, column))
        if value is not None:
            return value
    return None


def get_stock_data(ticker: str, period: str = "1mo"):
    normalized_ticker = ticker.upper().strip()
    cache_key = f"{normalized_ticker}:{period}"
    cached = _stock_cache.get(cache_key)
    if cached is not None:
        return cached

    provider_frames = _fetch_provider_frames(normalized_ticker)
    full_price_frame = provider_frames["price"]
    price_frame = _filter_price_frame(full_price_frame, period)
    fifty_two_week_frame = _filter_price_frame(full_price_frame, "1y")

    history_with_dates = []
    for _, row in price_frame.iterrows():
        volume = _clean_number(_row_value(row, "volume"))
        history_with_dates.append({
            "Date": _format_report_date(_row_value(row, "report_date")),
            "Open": _clean_number(_row_value(row, "open")),
            "High": _clean_number(_row_value(row, "high")),
            "Low": _clean_number(_row_value(row, "low")),
            "Close": _clean_number(_row_value(row, "close")),
            "Volume": int(volume) if volume is not None else None,
            "Dividends": None,
            "Stock Splits": None,
        })

    latest = history_with_dates[-1] if history_with_dates else {}
    previous = history_with_dates[-2] if len(history_with_dates) > 1 else {}
    current_price = _clean_number(latest.get("Close"))
    previous_close = _clean_number(previous.get("Close"))
    volume = _clean_number(latest.get("Volume"))
    change = None
    change_percent = None
    if current_price is not None and previous_close is not None:
        change = current_price - previous_close
        change_percent = (change / previous_close) * 100 if previous_close else None
    fifty_two_week_low = _clean_number(fifty_two_week_frame["low"].min()) if "low" in getattr(fifty_two_week_frame, "columns", []) else None
    fifty_two_week_high = _clean_number(fifty_two_week_frame["high"].max()) if "high" in getattr(fifty_two_week_frame, "columns", []) else None

    return _stock_cache.set(
        cache_key,
        {
            "info": _clean_info({
                "symbol": normalized_ticker,
                "currentPrice": current_price,
                "previousClose": previous_close,
                "regularMarketChange": change,
                "regularMarketChangePercent": change_percent,
                "regularMarketVolume": int(volume) if volume is not None else None,
                "volume": int(volume) if volume is not None else None,
                "marketCap": _latest_number(provider_frames.get("market_cap"), "market_capitalization", "marketCap"),
                "fiftyTwoWeekLow": fifty_two_week_low,
                "fiftyTwoWeekHigh": fifty_two_week_high,
                "trailingPE": _latest_number(provider_frames.get("ttm_pe"), "ttm_pe", "trailingPE"),
                "beta": _latest_number(provider_frames.get("beta"), "beta", "beta_5y"),
                "dataProvider": "Defeat Beta API",
            }),
            "history": history_with_dates,
        },
    )
