---
name: playwright-selectors
description: "Choose locators for Playwright Page Objects using the project's priority order (getByRole, getByLabel, getByText, getByTestId, CSS or XPath last) and patterns for dynamic elements. Use when writing or fixing locators, when a selector breaks, or when deciding between role, label, test-id and CSS."
---

# playwright-selectors

## Selector Priority

### 1. getByRole (preferred)
```typescript
page.getByRole('button', { name: 'Submit' })
page.getByRole('textbox', { name: 'Email' })
page.getByRole('heading', { name: 'Dashboard' })
```

### 2. getByLabel
```typescript
page.getByLabel('Password')
page.getByLabel('Date of birth')
```

### 3. getByText
```typescript
page.getByText('Welcome')
page.getByText('Total: $')
```

### 4. getByTestId
```typescript
page.getByTestId('submit-button')
```

The attribute this resolves against is **per-application configuration**, not a
fixed convention. It is set once in `config/env.ts`:

```typescript
export const TEST_ID_ATTRIBUTE = 'data-test';   // saucedemo
// 'data-testid' is Playwright's default, and what most applications use
```

and spread into `use` in `playwright.config.ts`. When copying this framework to
a new client, check what the application actually emits and change that constant
first — otherwise every `getByTestId()` call silently matches nothing.

### 5. CSS or XPath — last resort only
```typescript
// ⚠️ Only use when none of the above 4 options are viable
// Always add a comment explaining why and flag for dev team review

// Example — third-party component with no accessible role or label:
page.locator('.third-party-datepicker-input')
// TODO: request data-testid from dev team — no accessible selector available

page.locator('//div[@data-custom="submit"]')
// TODO: request data-testid from dev team — no accessible selector available
```

## Selectors to avoid
```typescript
// ❌ Never use dynamically generated IDs
page.locator('#component-abc123-xyz')

// ❌ Never use overly specific CSS chains
page.locator('div > ul > li:first-child > button')

// ❌ Never use XPath with fragile structure
page.locator('//div[3]/span[2]/button')
```

## Patterns for dynamic elements
```typescript
// Element that appears after action
await expect(page.getByText('Saved successfully')).toBeVisible();

// Element with dynamic content
await expect(page.getByRole('status')).toContainText('Total:');

// Wait for API response before asserting
await page.waitForResponse(r => r.url().includes('/api/cart'));
await expect(page.getByText('Updated')).toBeVisible();
```
