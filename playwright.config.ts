import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.pl.tsx',
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4000',
    reuseExistingServer: true
  },
  use: {
    baseURL: 'http://localhost:4000'
  }
});
