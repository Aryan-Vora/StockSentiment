# StockSentiment

A full-stack application for analyzing and visualizing stock sentiment from Reddit posts and financial data.

🌐 **Live Site**: [https://stock-sentiment-eosin.vercel.app/](https://stock-sentiment-eosin.vercel.app/)

## Deployment

- **Frontend**: Deployed on Vercel at [https://stock-sentiment-eosin.vercel.app/](https://stock-sentiment-eosin.vercel.app/)
- **Backend**: Deployed on AWS EC2 instance (FastAPI server)

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

#### `GET /api/sentimentTimeseries/{ticker}?days=30`

Returns sentiment data over time for the specified ticker. The `days` parameter is optional (default: 30).

**Response Example:**

```json
[
  {
    "date": "2025-06-23",
    "sentiment_score": 0.8,
    "post_count": 15
  },
  ...
]
```

---

## Development

### Running Backend Locally

1. Navigate to the backend directory:

```sh
cd backend
```

2. Install dependencies:

```sh
pip install -r requirements.txt
```

3. Run the FastAPI server:

```sh
python server.py
```

The backend will be available at `http://localhost:8000`

### Running Frontend Locally

1. Navigate to the frontend directory:

```sh
cd frontend
```

2. Install dependencies:

```sh
npm install
```

3. Run the development server:

```sh
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Running Tests

### Backend

Backend tests are written using [pytest](https://docs.pytest.org/).  
To run all backend tests:

```sh
cd backend
pytest tests/ -v
```

Test files are located in the `backend/tests/` directory
