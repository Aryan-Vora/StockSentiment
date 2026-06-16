# Testing Strategy

StockSentiment is a small public tool, so the test suite should protect the experiment's core promise without becoming heavy process.

## Current Baseline

- Backend tests use mocked Reddit and Defeat Beta data.
- The aggregate analysis contract is covered by route-level tests.
- Sentiment classification, post normalization, stock history normalization, cache behavior, and alignment metrics are covered.
- Frontend quality gates currently rely on TypeScript, ESLint, and production build checks.

## What Matters Most

1. A ticker search returns a coherent dashboard payload.
2. Provider failures degrade gracefully with `partialErrors`.
3. Sentiment labels stay normalized as `positive`, `neutral`, or `negative`.
4. Price movement and sentiment alignment are computed predictably.
5. Loading, empty, and error states remain useful during Render cold starts.

## Backend Coverage

Keep backend tests fast and offline by default.

- Unit tests:
  - Ticker validation and query bounds.
  - Sentiment threshold behavior.
  - Reddit post normalization.
  - Stock history numeric coercion.
  - TTL cache hit and expiry behavior.
- Integration-style tests:
  - `/api/analysis/{ticker}` response shape.
  - Partial stock failure with Reddit success.
  - Partial Reddit failure with stock success.
  - Empty Reddit result sets.
  - Insufficient price history.

## Frontend Coverage

Recommended next layer: Vitest plus React Testing Library.

- Dashboard states:
  - Initial empty ticker state.
  - Loading with cold-start copy.
  - Success metrics.
  - Empty posts.
  - Provider partial errors.
  - Invalid ticker rejection.
- Pure formatting:
  - Currency, percentage, compact numbers, dates, and sentiment display.
- User interactions:
  - Ticker form normalization.
  - Period and limit controls.
  - JSON export.

## End-to-End Coverage

Recommended next layer: Playwright with mocked API responses.

- Desktop happy path.
- Mobile viewport dashboard layout.
- Backend unavailable state.
- Empty Reddit posts state.
- Partial provider failure.

Avoid live Reddit/market-data calls in E2E. Use route interception so failures are deterministic and CI does not depend on external services.

## Required Local Checks

```sh
cd frontend
npm run lint
npx tsc --noEmit
npm run build

cd ../backend
.venv/bin/python -m pytest
```
