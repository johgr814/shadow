import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'tsx src/main.ts',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    timeout: 3_000,
  },
});
