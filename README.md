# saucedemo-playwright-framework

[![Playwright Tests](https://github.com/wmln/saucedemo-playwright-framework/actions/workflows/playwright.yml/badge.svg)](https://github.com/wmln/saucedemo-playwright-framework/actions/workflows/playwright.yml)

A Playwright + TypeScript test automation framework, built against
[saucedemo.com](https://www.saucedemo.com) and structured to be copied into real
projects. It is developed with an AI-assisted workflow: the conventions are
written down as instructions and review skills that Claude Code follows and
enforces.

## What it demonstrates

- **One root fixture.** Every Page Object is registered in a single
  `base.extend()`, so any test can combine any pages without import conflicts.
- **Log in once per run.** A setup project logs in, saves the browser's
  `storageState`, and every authenticated test starts already logged in.
- **Test layers as config projects.** Authenticated, anonymous and setup tests
  are separate projects. The file name alone (`*.anon.spec.ts`) decides which
  one a spec runs in.
- **State fixtures for test data.** Setup before `use()`, a check that it
  worked, and a marked place for teardown after it.
- **Generated data from factories**, built on Faker. Credentials come from
  environment variables, never literals.
- **Known defects documented as tests.** Real application bugs are asserted as
  the correct behaviour and marked `test.fail()`, so they stay visible without
  breaking the build.
- **Target-specific values isolated** in `config/env.ts`, so moving to a new
  application means changing one file first.

## Test coverage

16 tests, all running in CI on every push.

| Area | Tests | What they cover |
|---|---|---|
| Login | LOGIN-01 to 05 | Valid login, locked-out user, empty fields, wrong password |
| Access control | ACC-01 | Protected pages redirect to login when logged out |
| Inventory | INV-01, 02, 07 | Saved login works, products listed, add to cart updates button and badge |
| Menu | MENU-01 | Logout returns to login **and** the session is really gone |
| Product detail | PDP-01 | Detail page matches the inventory card's name and price |
| Cart | CART-01 | Added products appear with quantity and price |
| Checkout | CHK-01, 02, 05 | Full purchase, form validation, totals add up |

## Architecture

```
@playwright/test  →  fixtures/base.fixture.ts  →  tests/**/*.spec.ts
```

Specs never import from `@playwright/test` directly. They receive Page Objects
and state from the root fixture:

```typescript
test('CART-01 added products appear in the cart', async ({ cartItems, header, cartPage }) => {
  await header.openCart();
  await expect(cartPage.itemNames).toHaveText(cartItems.map((item) => item.name));
});
```

`cartItems` is a state fixture: it fills the cart before the test starts and
tells the test what it added.

### Projects

| Project | Runs | Starts |
|---|---|---|
| `setup` | `tests/setup/*.setup.ts` | Logs in once, saves `.auth/standard-user.json` |
| `e2e` | `tests/e2e/*.spec.ts` | **Logged in**, after `setup` |
| `e2e-anon` | `tests/e2e/*.anon.spec.ts` | **Logged out**, with no dependency on `setup` |

`e2e-anon` deliberately doesn't depend on `setup`, so if authentication breaks,
the login tests that diagnose it still run.

## Project structure

```
config/        Target-specific settings (base URL, test-id attribute)
pages/         Page Objects, plus HeaderComponent for UI shared by every page
fixtures/      base.fixture.ts — the single root fixture
factories/     Test data generators (Faker)
helpers/       Pure utilities (price parsing)
tests/setup/   Login once, save the session
tests/e2e/     UI specs — *.anon.spec.ts run logged out
tests/api/     API layer (planned)
.claude/       Claude Code skills that encode and enforce the conventions
```

## Getting started

Requires Node.js 24.

```bash
npm install
npx playwright install chromium
cp .env.example .env.local
npm test
```

The credentials in `.env.example` are saucedemo's public demo accounts, printed
on its own login page. On a real project that file holds placeholders only.

```bash
npm test                              # full suite
npm run test:smoke                    # @smoke only
npm run test:ui                       # Playwright UI mode
npx playwright test --project=e2e     # authenticated specs only
npx playwright test --list            # which spec runs in which project
```

## Defects found in saucedemo

Exploring the application for this suite turned up four defects. They are
mapped as test scenarios and will be covered with `test.fail()` in the next
batch:

1. **Reset App State** empties the cart badge but leaves product buttons
   showing "Remove".
2. **An empty cart can be checked out**, completing an order for $0.00.
3. **An unknown product id** (`/inventory-item.html?id=999`) shows
   "ITEM NOT FOUND" priced `$√-1`, and it can still be added to the cart.
4. **The open side menu is `aria-hidden`**, which hides Logout and the other
   menu items from screen readers and from `getByRole`.

## AI-assisted workflow

The repo is set up to be worked on with [Claude Code](https://claude.com/claude-code):

- **`CLAUDE.md`** holds the architecture rules, conventions, and the reasoning
  behind decisions, so every session starts from the same standards.
- **`.claude/skills/`** has project skills for mapping scenarios, scaffolding
  Page Objects, choosing selectors, reviewing generated tests, and debugging
  CI.
- **`qa-test-reviewer`** checks generated tests against the conventions. A
  canary file with seeded violations (`tests/__fixtures__/`) records how many
  findings it should report, as a regression check for the reviewer itself.
- **`.mcp.json`** connects the Playwright MCP server, used to explore pages
  and capture accessibility snapshots before writing selectors.

## Roadmap

- **API layer** against a public API with a real backend: `APIRequestContext`
  fixtures, schema validation, and data created before each test and deleted
  after it.
- **CI at scale**: sharding, merged reports, separate PR and nightly runs,
  flaky-test tracking.
- **Remaining saucedemo scenarios**: sorting, removal, and the known defects.
- **Client template**: a stripped-down starting point for new projects.

## Third-party content

`.claude/skills/playwright-best-practices` (Currents Software) and
`.claude/skills/test-driven-development` (Jesse Vincent, obra/superpowers) are
community skills included under their MIT licenses, which are kept alongside
them.

## License

[MIT](LICENSE), except the third-party skills above, which keep their own
licenses.
