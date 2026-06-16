from schemas import SentimentSummary, StockHistoryPoint, StockSummary

import analysis_service


def _stock_with_closes(*closes):
    return StockSummary(
        symbol="TEST",
        history=[
            StockHistoryPoint(date=f"2026-06-{10 + index}", close=close)
            for index, close in enumerate(closes)
        ],
    )


def test_metrics_detect_inverse_signal():
    metrics = analysis_service._build_metrics(
        stock=_stock_with_closes(100, 95, 90),
        sentiment=SentimentSummary(
            label="positive",
            displayLabel="Bullish Reddit mood",
            score=0.45,
            postCount=12,
        ),
        sentiment_series=[],
    )

    assert metrics.priceDirection == "down"
    assert metrics.priceChangePercent == -10
    assert metrics.alignment == "inverse"
    assert metrics.inverseSignal == "strong"


def test_metrics_detect_aligned_signal():
    metrics = analysis_service._build_metrics(
        stock=_stock_with_closes(100, 105, 112),
        sentiment=SentimentSummary(
            label="positive",
            displayLabel="Bullish Reddit mood",
            score=0.2,
            postCount=8,
        ),
        sentiment_series=[],
    )

    assert metrics.priceDirection == "up"
    assert metrics.alignment == "aligned"
    assert metrics.inverseSignal == "none"


def test_metrics_handles_insufficient_data():
    metrics = analysis_service._build_metrics(
        stock=_stock_with_closes(100),
        sentiment=SentimentSummary(
            label="neutral",
            displayLabel="No Reddit posts found",
            score=0.0,
            postCount=0,
        ),
        sentiment_series=[],
    )

    assert metrics.alignment == "insufficient_data"
    assert metrics.priceChangePercent is None
