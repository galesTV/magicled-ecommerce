import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/v3',
  testMatch: 'api-integration.spec.ts',
  outputDir: './test-results/v3-api',
  workers: 1,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:3214',
    trace: 'retain-on-failure',
  },
});
