import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testIgnore: '**/v3/**',
  timeout: 30_000,
  workers: 1,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    launchOptions: process.env.E2E_CHROME_PATH
      ? { executablePath: process.env.E2E_CHROME_PATH }
      : undefined,
    baseURL: `http://127.0.0.1:${process.env.E2E_WEB_PORT || '3001'}`,
    trace: 'retain-on-failure',
  },
});
