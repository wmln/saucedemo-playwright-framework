import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { STORAGE_STATE, requireEnv } from '../../config/env';

/**
 * Logs in once through the UI and saves the authenticated browser state.
 *
 * Setup files import from '@playwright/test' directly — they are not specs, and
 * the root fixture would be circular here. Specs must still import from
 * fixtures/base.fixture.ts.
 *
 * Add one setup() block per role to support multiple users; each writes its own
 * state file and gets its own project in playwright.config.ts.
 */
setup('authenticate as standard user', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.navigate();
  await loginPage.login(requireEnv('TEST_USER'), requireEnv('TEST_PASSWORD'));

  await expect(page).toHaveURL(/inventory/);

  await page.context().storageState({ path: STORAGE_STATE });
});
