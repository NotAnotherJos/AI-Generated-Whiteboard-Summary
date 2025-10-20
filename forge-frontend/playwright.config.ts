import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

process.env.PWDEBUG = '';

export default defineConfig({
  testDir: './e2e',
  timeout: 120000,
  retries: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.BASE_URL,
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /setup\/auth\.setup\.ts$/,
      use: {
        
        ...devices['Desktop Chrome'],
        storageState: undefined,
      },
    },
    {
      name: 'main-flow',
      workers: 1,
      testMatch: /specs\/.*\.spec\.ts$/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth.json',
      },
    },
  ],
});
