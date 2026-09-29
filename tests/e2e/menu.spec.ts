import { test, expect } from '../../fixtures/base.fixture';

test.describe('Menu', () => {
  test('MENU-01 logout returns to the login page and ends the session', async ({ inventoryPage, header, loginPage }) => {
    await inventoryPage.navigate();

    await header.logout();

    await expect(loginPage.loginButton).toBeVisible();

    // Proves the session really ended, not just that the page changed.
    await inventoryPage.navigate();
    await expect(loginPage.errorMessage).toContainText("You can only access '/inventory.html' when you are logged in");
  });
});
