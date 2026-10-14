import { defineConfig, devices } from '@playwright/test'

const PORT = 3100

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 45_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['iPhone 13'], browserName: 'chromium' } },
    { name: 'reduced-motion', use: { ...devices['Desktop Chrome'], contextOptions: { reducedMotion: 'reduce' } } }
  ],
  webServer: {
    // static prerendered build — same artifact that gets deployed
    command: `npx serve .output/public -l ${PORT} --no-clipboard`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000
  }
})
