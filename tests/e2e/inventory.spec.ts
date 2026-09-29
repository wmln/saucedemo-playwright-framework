import { test, expect } from '../../fixtures/base.fixture';

/**
 * The decisive check that storageState reuse works.
 *
 * This spec runs in the `e2e` project, which depends on the setup project and
 * loads .auth/standard-user.json. It navigates straight to the inventory page
 * without logging in. If auth reuse is wired correctly it passes; if not,
 * saucedemo redirects to the login page and the title assertion fails.
 */
const PRODUCT = 'Sauce Labs Backpack';

test.describe('Inventory', () => {
  test('INV-01 authenticated session reaches inventory without logging in', { tag: '@smoke' }, async ({ inventoryPage, page }) => {
    await inventoryPage.navigate();

    await expect(page).toHaveURL(/inventory/);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('INV-02 inventory lists products', async ({ inventoryPage }) => {
    await inventoryPage.navigate();

    await expect(inventoryPage.inventoryList).toBeVisible();
    expect(await inventoryPage.inventoryItems.count()).toBeGreaterThan(0);
  });

  test('INV-07 adding a product turns its button into Remove and shows a cart badge of 1', { tag: '@smoke' }, async ({ inventoryPage, header }) => {
    await inventoryPage.navigate();

    await inventoryPage.addToCart(PRODUCT);

    await expect(inventoryPage.productButton(PRODUCT)).toHaveText('Remove');
    await expect(header.cartBadge).toHaveText('1');
  });
});
