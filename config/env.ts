import { config as loadEnv } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

/**
 * The attribute Playwright's getByTestId() resolves against.
 *
 * This is per-APPLICATION, not per-environment — every environment of the same
 * app uses the same attribute, so it lives here as a single constant rather
 * than being repeated in each row of envConfig below.
 *
 *   'data-test'   — saucedemo (this project's target)
 *   'data-testid' — Playwright's default, and what most applications use
 *
 * Change this once when copying the framework to a new client.
 */
export const TEST_ID_ATTRIBUTE = 'data-test';

/** Where the authenticated browser state produced by tests/setup/auth.setup.ts is written. */
export const STORAGE_STATE = '.auth/standard-user.json';

type EnvConfig = {
  baseURL: string;
  retries: number;
};

/**
 * Environments this framework is configured to run against.
 *
 * Only `local` ships configured. saucedemo is a single public environment, and
 * a working `prod` key that resolves to a demo site teaches a habit that turns
 * dangerous the moment this framework is copied to a client where prod really
 * is prod. Uncomment and fill these in per client instead.
 */
export const envConfig = {
  local: { baseURL: 'https://www.saucedemo.com', retries: 0 },
  // staging: { baseURL: '', retries: 2 },
  // prod:    { baseURL: '', retries: 2 },
} satisfies Record<string, EnvConfig>;

export type Env = keyof typeof envConfig;

export const TEST_ENV = process.env.TEST_ENV ?? 'local';

/**
 * Loads `.env.<TEST_ENV>`, falling back to `.env`.
 * Silent when neither exists — CI supplies variables directly.
 */
function loadDotenv(): void {
  for (const file of [`.env.${TEST_ENV}`, '.env']) {
    const full = path.resolve(process.cwd(), file);
    if (fs.existsSync(full)) {
      loadEnv({ path: full, quiet: true });
      return;
    }
  }
}

loadDotenv();

/** Resolves the active environment, failing loudly rather than silently running. */
export function currentEnv(): EnvConfig {
  const found: EnvConfig | undefined = (envConfig as Record<string, EnvConfig>)[TEST_ENV];

  if (!found) {
    const available = Object.keys(envConfig).join(', ');
    throw new Error(
      `TEST_ENV="${TEST_ENV}" is not configured. Available: ${available}. ` +
        'Add it to the envConfig map in config/env.ts.',
    );
  }

  return found;
}

/** Reads a required environment variable, failing with a message that names the fix. */
export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Environment variable ${name} is not set. ` +
        'Copy .env.example to .env.local and fill it in (see README).',
    );
  }

  return value;
}
