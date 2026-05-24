// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,          // per-test timeout
  expect: { timeout: 5_000 },

  // Run tests serially — Electron launches a real app window each time.
  workers: 1,
  fullyParallel: false,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  // Screenshots and traces land in test-results/
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
