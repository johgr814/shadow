import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: './tests',
  globalSetup: path.join(__dirname, 'globalSetup.ts'),
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
