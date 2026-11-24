import { defineConfig, devices } from '@playwright/test';

const baseURL =
  process.env.V3_BASE_URL || 'http://127.0.0.1:' + (process.env.V3_TEST_PORT ?? '3213');

export default defineConfig({
  testDir: './tests/v3',
  testIgnore: '**/api-integration.spec.ts',
  outputDir: './test-results/v3',
  timeout: 90000,
  workers: 1,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    trace: 'retain-on-failure',
  },
});
