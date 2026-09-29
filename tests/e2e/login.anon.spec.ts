import { test, expect } from '../../fixtures/base.fixture';
import { requireEnv } from '../../config/env';

/**
 * Anonymous specs (*.anon.spec.ts) run in the `e2e-anon` project: no stored auth
 * state, and no dependency on the setup project — so these still run, and can
 * still diagnose the problem, when authentication itself is broken.
 */
test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test('LOGIN-01 valid credentials navigate to inventory page', { tag: '@smoke' }, async ({ loginPage, inventoryPage, page }) => {
    await loginPage.login(requireEnv('TEST_USER'), requireEnv('TEST_PASSWORD'));
    await expect(page).toHaveURL(/inventory/);
    // The URL changes before the SPA renders, so also wait for the page itself.
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('LOGIN-02 locked out user shows locked-out error', async ({ loginPage }) => {
    await loginPage.login(requireEnv('LOCKED_OUT_USER'), requireEnv('TEST_PASSWORD'));
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('locked out');
  });

  test('LOGIN-03 empty username shows username required error', async ({ loginPage }) => {
    await loginPage.loginButton.click();
    await expect(loginPage.errorMessage).toContainText('Username is required');
  });

  test('LOGIN-04 empty password shows password required error', async ({ loginPage }) => {
    await loginPage.usernameInput.fill(requireEnv('TEST_USER'));
    await loginPage.loginButton.click();
    await expect(loginPage.errorMessage).toContainText('Password is required');
  });

  test('LOGIN-05 wrong password shows credentials mismatch error', async ({ loginPage }) => {
    await loginPage.login(requireEnv('TEST_USER'), 'not-the-right-password');
    await expect(loginPage.errorMessage).toContainText('do not match');
  });
});
