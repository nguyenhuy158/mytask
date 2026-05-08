import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  webServer: [
    {
      command:
        'cd ../backend && DATABASE_URL="file:./test.db" uv run prisma db push --accept-data-loss && DATABASE_URL="file:./test.db" uv run uvicorn app.main:app --port 8000',
      url: 'http://localhost:8000/tasks',
      reuseExistingServer: !process.env.CI,
      timeout: 300000,
    },
    {
      command: 'pnpm dev --port 3000',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 300000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
