# Production Roadmap

This project should stay free, transparent, and lightweight. Production readiness here means reliability and trust, not turning the app into a sales funnel.

## Done In This Pass

- Added a normalized aggregate analysis API for the dashboard.
- Added validation for ticker, period, days, and post limit.
- Added in-memory caching around provider calls.
- Normalized sentiment labels while keeping readable display labels.
- Reworked the homepage around the actual experiment.
- Rebuilt the dashboard around price, sentiment, posts, and caveats.
- Added mocked backend tests for core provider and analysis behavior.
- Removed stale generated UI pieces and unused visual experiments.
- Updated frontend tooling to Next 16, React 19, TypeScript, ESLint, and production build checks.

## Next Priorities

1. Add frontend unit and component tests with Vitest and React Testing Library.
2. Add Playwright E2E with mocked API responses for the main dashboard journeys.
3. Add structured backend logging with request IDs and provider timing.
4. Add a small persistent cache such as Redis if Render cold starts or repeated traffic become painful.
5. Add server-side rate limiting for Reddit and market-data provider protection.
6. Add dependency scanning in CI and resolve the remaining npm audit findings.
7. Add an uptime check for `/health` and `/api/analysis/GME`.
8. Add frontend error tracking for failed API calls and chart rendering errors.
9. Add a clear data freshness timestamp in the dashboard header.
10. Add an export/share URL for interesting ticker reads.

## Security Notes

- No auth, accounts, billing, or user-generated storage are needed.
- Keep Reddit credentials server-only.
- Continue validating ticker-like input before provider calls.
- Avoid exposing raw provider exception details in public responses if the API becomes higher traffic.
- Keep CORS scoped to known frontend hosts before a production launch.

## Performance Notes

- The main performance risk is external provider latency, not local computation.
- Cache stock, Reddit post, sentiment summary, and sentiment series responses separately.
- Keep chart payloads compact by returning normalized daily points.
- Lazy-load heavier dashboard-only components if the homepage bundle grows.
