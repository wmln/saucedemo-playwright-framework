# fixtures/

Shared Playwright fixtures. `base.fixture.ts` is the single root — the only
place `base.extend()` is called.

## Rules

- **One root fixture file.** Every Page Object is declared in the `Fixtures` type
  in `base.fixture.ts`. Do not create per-feature fixture files that each export
  their own `test` — a spec needing two Page Objects could then import neither.
- **Specs import `{ test, expect }` from `base.fixture.ts`**, never from
  `@playwright/test`.
- **Fixtures yield objects; they do not navigate.** A Page Object must be usable
  from any starting point, so the spec calls `navigate()`. A fixture that
  navigates makes the Page Object unusable in flows that arrive some other way.
- **Fixtures are lazy.** Playwright constructs only what a test destructures, so
  this file can hold dozens of Page Objects at no runtime cost.
- **Fixtures compose.** One fixture may depend on another (a seeded entity, then
  a page authenticated as that entity). Keep each one doing a single thing.
- Authentication state is produced by `tests/setup/auth.setup.ts` and applied
  per project via `storageState` — not by a fixture that logs in.

## Exception

`tests/setup/*.setup.ts` import from `@playwright/test` directly. They are not
specs, and importing the root fixture there would be circular.
