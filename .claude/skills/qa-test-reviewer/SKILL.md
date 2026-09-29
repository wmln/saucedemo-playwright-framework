---
name: qa-test-reviewer
description: "Review Playwright specs and Page Objects against this project's conventions: root-fixture import chain, tag placement, env-var credentials, .anon.spec.ts naming, Page Object encapsulation, selectors, waits and destination-page assertions. Report only, never edits files. Use after generating or modifying any file under tests/ or pages/, and before accepting or committing test code."
---

# qa-test-reviewer

## Goal
Review generated Playwright tests and Page Objects before they are accepted.
Do not modify files — only report issues and suggest corrections.

## When to Use
Always after generating new tests or Page Objects.

## Review Checklist

### Architecture — the import chain
- [ ] Spec imports `{ test, expect }` from `fixtures/base.fixture.ts`, **never** from `@playwright/test`?
- [ ] New Page Objects registered in the `Fixtures` type in `base.fixture.ts`?
- [ ] No new per-feature fixture file exporting its own `test`? Only one root fixture exists — a second one makes multi-page specs impossible.
- [ ] No `let pageObject` + `beforeEach` instantiation? Page Objects arrive via fixtures.
- [ ] **Page Object** fixtures yield the object only, with no navigation inside them?
- [ ] **State** fixtures (e.g. `cartItems`) that drive the app do setup before `use()`, verify the setup worked, and put any teardown after `use()`?

Exception: `tests/setup/*.setup.ts` correctly import from `@playwright/test`. They are not specs, and importing the root fixture there would be circular.

### Structure
- [ ] Follows Page Object Model correctly?
- [ ] Naming consistent with project conventions?
- [ ] File in the right layer folder — `tests/e2e/`, `tests/api/`, `tests/setup/`?
- [ ] Page Object has a constructor taking `page: Page`?
- [ ] Locators are `readonly` properties declared in the constructor? Parameterized locators (`productCard(name)`) are allowed **only when derived from a constructor locator** — never a new raw `page.locator(...)`/`page.getBy...` inside a method.
- [ ] No `expect()` inside Page Objects?

### Encapsulation
- [ ] Spec does not reach through a Page Object into Playwright internals — no `somePage.page.goto()`, no `somePage.page.locator()`?
- [ ] Where a spec needs the raw `Page`, it destructures `page` as its own fixture: `async ({ loginPage, page })`?

### Auth and isolation
- [ ] Specs that must run unauthenticated are named `*.anon.spec.ts`, so they land in the `e2e-anon` project?
- [ ] **Not** opted out with an in-file `test.use({ storageState: { cookies: [], origins: [] } })`? That still inherits `dependencies: ['setup']`, so broken auth would take out the very tests needed to diagnose it.
- [ ] Test runs in isolation, with no dependency on another test's state?
- [ ] Uses fixtures for setup rather than ordering assumptions?

### Credentials and test data
- [ ] **No hardcoded credentials.** Usernames and passwords read via `requireEnv('TEST_USER')` from `config/env.ts`?
- [ ] No secrets in committed files other than `.env.example`?
- [ ] Generated entity data comes from a factory in `factories/`, not literals in the spec?
- [ ] Known application defects asserted as the **correct** behaviour and marked `test.fail()` with an `issue` annotation — not asserted as the buggy behaviour, and not silently skipped?

### Tags
- [ ] Tags in the details object — `test('...', { tag: '@smoke' }, ...)` — not appended to the title string?

### Selectors
- [ ] Uses `getByRole`/`getByLabel` instead of CSS/XPath where possible?
- [ ] `getByTestId()` used only where the target app emits the attribute configured as `TEST_ID_ATTRIBUTE` in `config/env.ts`?
- [ ] Selectors resilient to UI changes?
- [ ] If CSS/XPath used, is there a comment explaining why and flagged for dev-team review?

### Coverage
- [ ] Happy path covered?
- [ ] Edge cases present?
- [ ] Negative scenarios included?
- [ ] All mapped scenarios implemented?
- [ ] Anything verifiable over HTTP pushed down to the API layer rather than tested through the UI?

### Assertions
- [ ] Has meaningful assertions, not just navigation?
- [ ] After any navigation, asserts **content on the destination page**, not only the URL? In single-page apps the URL changes before the page renders, so `toHaveURL` alone passes on a blank or broken page.
- [ ] Where pages share test-ids, asserts something unique to the new page (title, back button) before using the shared locators?
- [ ] Validates the correct behavior?
- [ ] Uses `waitForResponse` for API assertions?

### CI/CD
- [ ] Test will pass in CI, with no local environment dependency?
- [ ] No arbitrary `waitForTimeout`?

## Output
List of issues by category with suggested fix.
Severity: 🔴 Critical | 🟡 Important | 🔵 Suggestion
