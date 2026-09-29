---
name: playwright-structure
description: "Scaffold Playwright files in this project's architecture: Page Object classes, registering them in the single root fixture (fixtures/base.fixture.ts), spec files, and auth setup with storageState. Use when creating a new Page Object, spec, fixture or setup file, or when unsure where a new test file belongs."
---

# playwright-structure

## The import chain

```
@playwright/test  →  fixtures/base.fixture.ts  →  tests/**/*.spec.ts
```

Specs never import from `@playwright/test`. Page Objects reach them through the
one root fixture.

## Page Object

```typescript
import { Page, Locator } from '@playwright/test';

export class ExamplePage {
  readonly page: Page;
  readonly submitButton: Locator;
  readonly emailInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.emailInput = page.getByLabel('Email');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/example');
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
```

Rules: locators are `readonly` and declared in the constructor, never built
inside methods. Methods are actions. No `expect()` — assertions belong to specs,
which reach the locators as public properties.

## Parameterized locators

When a locator depends on data (one product among many), derive it from a
constructor locator — never build a new raw selector inside a method:

```typescript
constructor(page: Page) {
  this.inventoryItems = page.getByTestId('inventory-item');
  this.itemNames = page.getByTestId('inventory-item-name');
}

// Matches the exact name element, not any text in the card.
productCard(name: string): Locator {
  return this.inventoryItems.filter({ has: this.itemNames.getByText(name, { exact: true }) });
}
```

## Shared UI — component objects

UI that appears on every page (header, menu, cart badge) gets its own class,
e.g. `pages/HeaderComponent.ts`, with its own fixture. Page Objects do not
redeclare its locators.

## Root fixture — the only place `base.extend()` is called

```typescript
// fixtures/base.fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ExamplePage } from '../pages/ExamplePage';

type Fixtures = {
  loginPage: LoginPage;
  examplePage: ExamplePage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  examplePage: async ({ page }, use) => {
    await use(new ExamplePage(page));
  },
});

export { expect } from '@playwright/test';
```

Adding a Page Object means adding one line to `Fixtures` and one fixture here.
Fixtures are lazy, so a spec pays nothing for the ones it does not destructure.

Fixtures yield objects and **do not navigate** — a Page Object must be usable
from any entry point.

## State fixtures

A fixture that puts the app into a known state before the test. Setup before
`use()`, a check that it worked, teardown after `use()`:

```typescript
cartProducts: [['Sauce Labs Backpack', 'Sauce Labs Bike Light'], { option: true }],

cartItems: async ({ inventoryPage, header, cartProducts }, use) => {
  await inventoryPage.navigate();
  const items = [];
  for (const name of cartProducts) {
    items.push({ name, price: await inventoryPage.productPrice(name).innerText() });
    await inventoryPage.addToCart(name);
  }
  await expect(header.cartBadge).toHaveText(String(cartProducts.length));
  await use(items);
  // teardown: delete anything created on a backend
},
```

Page Object fixtures never navigate; state fixtures drive the app because that
is their job.

## Spec

```typescript
import { test, expect } from '../../fixtures/base.fixture';

test.describe('Feature name', () => {
  test.beforeEach(async ({ examplePage }) => {
    await examplePage.navigate();
  });

  test('EX-01 should do something expected', { tag: '@smoke' }, async ({ examplePage, page }) => {
    await examplePage.fillEmail('test@example.com');
    await examplePage.submit();
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

Note `page` destructured alongside `examplePage` when the raw page is needed —
never `examplePage.page`. Tags go in the details object, not the title.

## Authentication — setup project, not a fixture

```typescript
// tests/setup/auth.setup.ts
import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { STORAGE_STATE, requireEnv } from '../../config/env';

setup('authenticate as standard user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login(requireEnv('TEST_USER'), requireEnv('TEST_PASSWORD'));
  await expect(page).toHaveURL(/inventory/);
  await page.context().storageState({ path: STORAGE_STATE });
});
```

Setup files import from `@playwright/test` directly — they are not specs, and
importing the root fixture would be circular.

```typescript
// playwright.config.ts
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },

  // No auth, and no dependency on setup — so these still run when auth breaks.
  { name: 'e2e-anon', testDir: './tests/e2e', testMatch: /.*\.anon\.spec\.ts/,
    use: { storageState: { cookies: [], origins: [] } } },

  { name: 'e2e', testDir: './tests/e2e', testIgnore: /.*\.anon\.spec\.ts/,
    dependencies: ['setup'], use: { storageState: STORAGE_STATE } },
]
```

A spec opts out of authentication by being named `*.anon.spec.ts` — not with an
in-file `test.use()`, which would still inherit `dependencies: ['setup']`.

## Anti-patterns

```typescript
// bypasses the fixture chain
import { test, expect } from '@playwright/test';

// module-level page object + manual instantiation
let examplePage: ExamplePage;
test.beforeEach(async ({ page }) => { examplePage = new ExamplePage(page); });

// per-feature fixture file exporting its own `test`
//   a spec needing two page objects can then import neither

// reaching through the page object
await expect(examplePage.page).toHaveURL(/x/);

// hardcoded credentials
await loginPage.login('standard_user', 'secret_sauce');
```
