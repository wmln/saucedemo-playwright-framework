# saucedemo-playwright-framework — Claude Instructions

## Project Identity

Blueprint QA automation framework, developed against a public demo target
(saucedemo.com) and intended to be copied into real client engagements.

Part of: `qa-framework` domain inside `ai-frameworks`.

Everything here should be written as if it will be copied. Target-specific
values are isolated so they can be changed in one place.

---

## Stack

- @playwright/test 1.59.1
- TypeScript 6.x (strict mode)
- Node.js 24.x (nvm: v24.15.0)
- CI: GitHub Actions (ubuntu-latest)

---

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env.local        # .env.local, not .env — see Configuration
npm test
```

---

## Commands

```bash
npm test                                        # run all projects
npm run test:headed                             # run with browser visible
npm run test:debug                              # open Playwright Inspector
npm run test:ui                                 # open Playwright UI mode
npm run test:smoke                              # @smoke tagged tests only
npm run lint                                    # TypeScript type-check (no emit)

npx playwright test --project=e2e               # authenticated UI specs
npx playwright test --project=e2e-anon          # unauthenticated UI specs
npx playwright test --project=setup             # regenerate auth state only
npx playwright test --list                      # what resolves where
npx playwright show-report                      # open last HTML report
```

---

## Architecture

### Import chain

Tests never import from `@playwright/test` directly:

```
@playwright/test  →  fixtures/base.fixture.ts  →  tests/**/*.spec.ts
```

```typescript
// CORRECT
import { test, expect } from '../../fixtures/base.fixture';

// WRONG — bypasses fixtures
import { test, expect } from '@playwright/test';
```

**One root fixture.** `fixtures/base.fixture.ts` is the only place
`base.extend()` is called. Every Page Object is declared in its `Fixtures` type.
Do not add per-feature fixture files that each export their own `test` — a spec
needing two Page Objects could then import neither. Fixtures are lazy, so this
file can hold dozens of Page Objects at no cost.

Exception: `tests/setup/*.setup.ts` import from `@playwright/test` directly.
They are not specs, and importing the root fixture there would be circular.

### Page Object rules

- Locators are `readonly` properties declared in the constructor. Parameterized
  locators (`productCard(name)`, `cartItem(name)`) are allowed only when derived
  from a constructor locator — never a new raw `page.locator(...)` in a method
- Methods are actions only (`click`, `fill`, `navigate`) — no `expect()` calls
- Specs assert against the Page Object's public locators
- Specs never reach through a Page Object: destructure `page` alongside it —
  `async ({ loginPage, page })`, never `loginPage.page`
- Page Objects navigate with relative paths; `baseURL` comes from config
- UI shared across pages is a component object, not duplicated per page —
  `HeaderComponent` holds the menu, cart button and cart badge
- After any navigation, assert **content on the destination page**, not only
  the URL. saucedemo is a single-page app: the URL changes before the page
  renders, so `toHaveURL` alone passes on a blank page
- Several pages reuse the same test-ids (`inventory-item-name`, `-price`).
  Assert something unique to the new page first, or the locator can match the
  page just left

### Fixtures

Two kinds, both in `fixtures/base.fixture.ts`:

- **Page Object fixtures** construct an object and do nothing else. They never
  navigate, so a Page Object stays usable from any entry point.
- **State fixtures** put the app into a known state before the test — e.g.
  `cartItems`, which fills the cart and yields what it added. Setup goes before
  `use()`, a check that setup worked comes right after it, and teardown goes
  after `use()`. Fixtures are preferred over `beforeEach`/`afterEach` because
  setup and cleanup live together (Playwright docs).

`cartProducts` is an option fixture: override the default products per file
with `test.use({ cartProducts: [...] })`.

### Test layers

Each layer is a project in `playwright.config.ts`:

| Project | Folder | Auth | Notes |
|---|---|---|---|
| `setup` | `tests/setup/` | — | Produces `.auth/standard-user.json` |
| `e2e` | `tests/e2e/*.spec.ts` | storageState | `dependencies: ['setup']` |
| `e2e-anon` | `tests/e2e/*.anon.spec.ts` | none | **No** setup dependency |
| `api` | `tests/api/` | — | Lands in pass 2 |

A spec opts out of authentication by being named `*.anon.spec.ts`. Do **not**
use an in-file `test.use({ storageState: ... })`: that still inherits
`dependencies: ['setup']`, so broken auth would take out the very login tests
needed to diagnose it. The `e2e-anon` project has no such dependency.

Setup tests do not need CI grep tags. Project dependencies resolve
independently of `--grep`, so a setup project named in `dependencies: [...]`
runs regardless of whether its own tests match the filter. Verified:
`--grep @smoke` pulls in the untagged setup test, and INV-01 passes against
freshly written auth state.

### Configuration

`config/env.ts` holds everything target-specific:

- `TEST_ID_ATTRIBUTE` — the attribute `getByTestId()` resolves against.
  Per-**application**, not per-environment. `'data-test'` is saucedemo's;
  most apps use `'data-testid'`. **Change this first when copying to a client.**
- `envConfig` — `TEST_ENV → { baseURL, retries }`. Only `local` ships
  configured; `staging` and `prod` are commented template rows. An unconfigured
  `TEST_ENV` throws with a message naming the file rather than running silently.
- `requireEnv(name)` — reads a required variable, failing with the fix in the message
- `STORAGE_STATE` — path to the saved auth state

`TEST_ENV` defaults to `local`, and dotenv loads `.env.${TEST_ENV}` first with a
fallback to `.env`. That is why setup is `cp .env.example .env.local` — a file
named `.env` is not read at the default `TEST_ENV`.

`playwright.config.ts` — `workers: '50%'`, retries=2 in CI, blob reporter in CI
(prerequisite for shard merging), Chromium only.

`tsconfig.json` — ES2022 strict, no path aliases (`baseUrl` deprecated in TS6),
`"types": ["node"]` required for `process.env`.

### Test data

- Credentials: environment variables via `requireEnv()`, never generated
- Generated entities: `factories/`, built on Faker (`createCustomer()`).
  Random values stay reproducible because traces record what was typed
- **Cleanup:** saucedemo keeps all state (cart, session) in browser storage,
  and every test gets a fresh browser context that Playwright discards, so
  there is nothing to delete. Against an app with a backend, a state fixture
  creates records before `use()` and deletes them after it — demonstrated in
  pass 2 with restful-booker.

### Known application defects

A scenario that hits a real bug asserts the **correct** behaviour and is marked
`test.fail()` with an issue annotation:

```typescript
test('MENU-02 reset clears cart buttons', {
  annotation: { type: 'issue', description: 'Reset App State leaves "Remove" buttons' },
}, async ({ ... }) => {
  test.fail();
  ...
});
```

The suite stays green, the defect stays visible in the report, and Playwright
reports an error the day the bug is fixed. Use `test.fixme()` only for tests
that crash or hang — it does not run the test at all.

Confirmed saucedemo defects, not yet covered (Medium/Low batch):
Reset App State leaves "Remove" buttons; empty-cart orders complete at $0;
an unknown product id (`?id=999`) can be added to the cart; the open menu is
`aria-hidden`, hiding its items from assistive tech.

### Tagging convention

Tags go in the details object, not the title:

```typescript
test('LOGIN-01 valid credentials reach inventory', { tag: '@smoke' }, async ({ loginPage }) => { ... });
```

Run with `npm run test:smoke` (`--grep @smoke`).

---

## Folder Contract

| Folder | Purpose |
|---|---|
| `config/` | Environment and target-specific configuration |
| `pages/` | Page Object classes, one per page, plus component objects for shared UI (`HeaderComponent`) |
| `tests/e2e/` | UI specs — `.anon.spec.ts` for unauthenticated ones |
| `tests/api/` | API specs (pass 2) |
| `tests/setup/` | Auth state producers, not specs |
| `fixtures/` | `base.fixture.ts` — the single root fixture |
| `factories/` | Test data generators (contract only until pass 2) |
| `helpers/` | Pure utility functions (`money.ts` — price parsing) |
| `.auth/` | Saved auth state (gitignored) |
| `playwright-report/` | HTML report output (gitignored) |
| `test-results/` | Trace/video/screenshot artifacts (gitignored) |

---

## Convention resolutions

The `playwright-best-practices` community skill contradicts itself in places.
Resolutions taken here, so the decision is not re-litigated each time:

| Conflict | Winner | Why |
|---|---|---|
| Setup project vs `globalSetup` for auth | **Setup project** | `core/global-setup.md` and `core/projects-dependencies.md` both name it recommended; it gets Playwright fixtures. `advanced/authentication.md` says globalSetup — overruled. |
| `workers: 1` vs `'50%'` in CI | **`'50%'`** | `parallel-sharding.md` lists `workers: 1` in CI as an explicit anti-pattern. Only `ci-cd.md` still shows it. |
| Three competing directory trees | **`pom-vs-fixtures.md` shape**, adapted | It is the most scale-oriented and has an explicit layer-responsibility table. Adapted to keep `pages/` and `fixtures/` at root rather than nested under `tests/`. |
| Factories location (`factories/` vs `fixtures/data/`) | **`factories/`** | Skill's recommended shape; scales to traits and entity relationships. |

`mergeTests()` is deliberately not used — it appears nowhere in the bundle, and
a single root fixture is simpler for a framework meant to be copied.

---

## Browser Scope

Development: Chromium only (fast iteration).
CI: Chromium only until the suite is stable, then add firefox and webkit.

---

## Built So Far

- `config/env.ts` — env matrix, `TEST_ID_ATTRIBUTE`, `requireEnv`
- `fixtures/base.fixture.ts` — root fixture: 8 Page Object fixtures, plus the
  `cartProducts` option and `cartItems` state fixture
- `pages/` — Login, Inventory, ProductDetail, Cart, CheckoutInfo,
  CheckoutOverview, CheckoutComplete, and `HeaderComponent`
- `factories/customer.factory.ts` — Faker-based checkout customer
- `helpers/money.ts` — `parseMoney`, `sum`
- `tests/setup/auth.setup.ts` — storageState producer
- `tests/e2e/login.anon.spec.ts` — LOGIN-01..05, unauthenticated
- `tests/e2e/access-control.anon.spec.ts` — ACC-01
- `tests/e2e/inventory.spec.ts` — INV-01, 02, 07
- `tests/e2e/menu.spec.ts` — MENU-01
- `tests/e2e/product-detail.spec.ts` — PDP-01
- `tests/e2e/cart.spec.ts` — CART-01
- `tests/e2e/checkout.spec.ts` — CHK-01, 02, 05
- 16 tests; the 8 High-priority post-login scenarios are covered. Medium and
  Low scenarios (sorting, removal, the defect cases above) are mapped but not
  yet implemented
- Target app: saucedemo.com

### Next passes

- **Pass 2 — layers.** API tests against restful-booker, `APIRequestContext`
  fixtures, Zod contract validation, API seeding, factory implementations.
  DB layer as adapter interface + docs only.
- **Pass 3 — CI.** Sharding, blob-report merging, browser caching, tag-driven
  PR-vs-nightly split, flake tracking, selector drift detection (report only,
  never auto-repair).
- **Pass 4 — packaging.** Extract `qa-framework/CLAUDE-template.md` and a
  copy-to-client checklist.

---

## What Does Not Belong Here

- API mocking configuration belongs in individual test files using `page.route()`
- Credentials never hardcoded and never committed — `requireEnv()` from
  `config/env.ts`, `.env.local` locally, GitHub Secrets in CI. `.env.example` is
  the only committed env file, and only because saucedemo's credentials are
  printed on its own login page.
- Framework-level `CLAUDE.md` or skills. Per `ai-frameworks/CLAUDE.md`, framework
  folders are structure-only so each project stays self-contained and skills do
  not bleed across the tree.

---

## Selector Priority

1. `getByRole()` — preferred for interactive elements
2. `getByLabel()` — for form inputs
3. `getByText()` — for readable content assertions
4. `getByTestId()` — when roles are insufficient; resolves against
   `TEST_ID_ATTRIBUTE` in `config/env.ts`, which is per-application
5. CSS/XPath — last resort, always add a comment explaining why

---

## Naming Conventions

- Page Objects: `PascalCase` → `LoginPage.ts`, `CartPage.ts`; shared UI → `HeaderComponent.ts`
- Test files: `kebab-case.spec.ts`, `kebab-case.anon.spec.ts` when unauthenticated
- Setup files: `<role>.setup.ts`
- Factories: `<entity>.factory.ts`, exporting `create<Entity>(overrides)`
- Test descriptions: `ID plain-English behaviour` → `"LOGIN-01 valid credentials navigate to inventory page"`

---

## Async Rules

- Always use `waitForResponse()` for API assertions
- Never use arbitrary `waitForTimeout()`

---

## Test Independence

Tests must be fully independent — fixtures and `beforeEach` for setup only.
Never rely on state from a previous test.

---

## Simplicity Rule

- Avoid premature optimization of test architecture
- A test that is easy to read and maintain is better than a clever one

---

## Before Creating Anything

- Check if a Page Object or fixture already exists before building a new one
- Reuse and extend before building from scratch
- New Page Object means one line in the `Fixtures` type and one fixture in
  `base.fixture.ts` — never a new fixture file

---

## Before Generating Tests

- Always confirm scope, risk, and **test layer** before generating
- Always run qa-test-reviewer after generating tests

---

## Skills Reference

Skills live at `.claude/skills/`. Invoke via `/` commands in Claude Code:

| Skill | Purpose |
|---|---|
| `qa-test-cases` | Map test scenarios and assign each one a layer |
| `qa-test-reviewer` | Review generated tests before accepting |
| `qa-bug-report` | Document bugs in structured format |
| `qa-ci-debug` | Diagnose CI/CD failures |
| `playwright-structure` | Scaffold POM files and fixtures |
| `playwright-selectors` | Choose the right locator strategy |
| `mcp-setup` | Configure Playwright MCP |
| `qa-prompt-templates` | Reusable prompt patterns |

`playwright-best-practices` and `test-driven-development` are community skills —
do not edit them; edits are lost on update.
