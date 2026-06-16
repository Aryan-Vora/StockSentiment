# StockSentiment

StockSentiment is a free experiment for comparing Reddit stock chatter with real price movement.

After hearing so many stories about WallStreetBets moving markets, I wanted to see whether the crowd was actually useful at predicting stock direction. The app lets someone enter a ticker, pulls recent Reddit posts that mention it, scores the posts with VADER sentiment, and lines that mood up against Defeat Beta market data.

Sometimes Reddit looks early. Sometimes it looks late. Sometimes it is wrong enough that the inverse signal is the interesting part.

Live site: https://stock-sentiment-eosin.vercel.app/

## Project Structure

- `backend/`: FastAPI API, Reddit/Defeat Beta provider calls, sentiment scoring, aggregation metrics.
- `frontend/`: Next.js dashboard and homepage.
- `mobileView/`: Expo WebView wrapper around the web app.

## Backend API

Current hosted backend: https://stocksentiment-omux.onrender.com

### `GET /api/analysis/{ticker}?period=1mo&days=30&limit=30`

Returns the normalized dashboard payload:

```json
{
  "ticker": "GME",
  "stock": {},
  "sentiment": {},
  "sentimentSeries": [],
  "posts": [],
  "metrics": {},
  "generatedAt": "2026-06-15T00:00:00Z",
  "sources": ["Defeat Beta API", "Reddit", "VADER"],
  "partialErrors": []
}
```

Legacy endpoints still exist:

- `GET /api/stock/{ticker}`
- `GET /api/reddit/{ticker}?limit=30`
- `GET /api/redditSentiment/{ticker}`
- `GET /api/sentimentTimeseries/{ticker}?days=30`

## Environment

Backend:

```sh
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
```

Frontend:

```sh
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Mobile:

```sh
EXPO_PUBLIC_STOCKSENTIMENT_URL=https://stock-sentiment-eosin.vercel.app/
```

## Running Locally

Backend:

```sh
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python server.py
```

Frontend:

```sh
cd frontend
npm install
npm run dev
```

## Tests

Backend tests use mocked provider data by default, so they do not depend on Reddit or market data providers responding during CI.

```sh
cd backend
pytest
```

## Caveats

- This is not financial advice.
- Reddit sentiment is noisy and easy to misread.
- The hosted backend runs on Render, so the first request may cold-start and take about a minute.
