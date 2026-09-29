import { defineConfig, devices } from '@playwright/test';
import { currentEnv, STORAGE_STATE, TEST_ID_ATTRIBUTE } from './config/env';

const env = currentEnv();

/** Options every project shares. Extracted so projects cannot drift apart. */
const sharedUse = {
  ...devices['Desktop Chrome'],
  baseURL: env.baseURL,
  testIdAttribute: TEST_ID_ATTRIBUTE,
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
} as const;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : env.retries,

  // '50%' rather than 1 in CI: serialising CI is the main reason mature suites
  // take 40 minutes. Sharding lands in a later pass and builds on this.
  workers: '50%',

  // blob is what makes shard-merging possible once CI shards (pass 3); html is
  // kept alongside it so the report artifact the workflow uploads still exists.
  reporter: process.env.CI
    ? [['blob'], ['html', { open: 'never' }], ['github']]
    : [['html', { open: 'never' }], ['list']],

  use: sharedUse,

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: sharedUse,
    },
    {
      // Specs that must run without authentication — login, session expiry.
      // Deliberately has NO dependency on `setup`, so a broken auth setup does
      // not take out the tests you need in order to diagnose it.
      name: 'e2e-anon',
      testDir: './tests/e2e',
      testMatch: /.*\.anon\.spec\.ts/,
      use: {
        ...sharedUse,
        storageState: { cookies: [], origins: [] },
      },
    },
    {
      // Everything else: starts already authenticated.
      name: 'e2e',
      testDir: './tests/e2e',
      testIgnore: /.*\.anon\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...sharedUse,
        storageState: STORAGE_STATE,
      },
    },
  ],
});
