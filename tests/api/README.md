# tests/api/

API-layer specs. **Empty by design — lands in pass 2.**

saucedemo has no public API, so this layer will be demonstrated against a second
public target (restful-booker). Until those specs exist there is deliberately no
`api` project in `playwright.config.ts`: a config project that resolves zero
tests is worse than no project at all.

## What arrives in pass 2

- `APIRequestContext` fixtures in `fixtures/base.fixture.ts` for authenticated clients
- An `api` config project with its own `baseURL` and **no `browserName`**, so no
  browser launches — that is what makes this layer fast
- Zod schema validation as the contract check between API and UI layers
- API-based seeding for UI tests: create state over HTTP, assert it through the UI

## Rule

API tests never drive a browser. If a spec needs a page, it belongs in `tests/e2e/`.
