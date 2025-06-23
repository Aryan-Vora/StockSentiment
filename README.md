# StockSentiment

A full-stack application for analyzing and visualizing stock sentiment from Reddit posts and financial data.

## Project Structure

- **backend/**: FastAPI server providing stock and sentiment APIs
- **frontend/**: Next.js + Tailwind CSS dashboard UI

---

## Backend (FastAPI)

### API Endpoints

#### `GET /api/stock/{ticker}`

Returns stock info and price history for a given ticker (uses Yahoo Finance).

**Response Example:**

```json
{
  "info": { ... },
  "history": [ { ... }, ... ]
}
```

#### `GET /api/reddit/{ticker}?limit=10`

Fetches recent Reddit posts mentioning the ticker. Each post includes sentiment analysis.

**Response Example:**

```json
[
  {
    "id": "abc123",
    "title": "NVDA to the moon!",
    "content": "...",
    "url": "...",
    "sentiment": { "compound": 0.7, ... }
  },
  ...
]
```

#### `GET /api/redditSentiment/{ticker}`

Returns overall Reddit sentiment for the ticker (bullish, bearish, or neutral).

**Response Example:**

```json
{
  "sentiment": "Bullish market sentiment",
  "score": 0.8
}
```

---

## Running Tests

### Backend

Backend tests are written using [pytest](https://docs.pytest.org/).  
To run all backend tests:

```sh
cd backend
pytest tests/ -v
```

Test files are located in the `backend/tests/` directory
