import { test, expect } from '../../fixtures/base.fixture';

test.describe('Access control', () => {
  test('ACC-01 opening the inventory while logged out redirects to login with an error', async ({ inventoryPage, loginPage }) => {
    await inventoryPage.navigate();

    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.errorMessage).toContainText("You can only access '/inventory.html' when you are logged in");
  });
});
