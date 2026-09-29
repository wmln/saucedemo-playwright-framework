# helpers/

Utility functions that are NOT page interactions and NOT fixtures.

Examples:
- `helpers/date.ts` — date formatting/parsing helpers
- `helpers/api.ts` — direct API call wrappers for test data setup
- `helpers/random.ts` — random data generators

Rules:
- No Playwright imports in helpers (keep them framework-agnostic)
- All helpers must be pure functions where possible
- Export named functions, not default exports
