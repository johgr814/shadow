import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm --filter @shadow/backend start',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    timeout: 10_000,
    cwd: '../../',
  },
});
