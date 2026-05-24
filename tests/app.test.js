/**
 * Playwright tests for the tfila Electron app.
 *
 * Uses spawn + chromium.connectOverCDP() instead of electron.launch() to
 * avoid a Playwright 1.40+ incompatibility with Electron 23 (the --remote-
 * debugging-port=0 flag is injected before the app path, which Node rejects).
 *
 * Run with:
 *   npm test              → headless CDP (fast, CI-friendly)
 *   npm run test:visual   → only visual snapshot tests
 *   npm run test:report   → open last HTML report
 */

const { test, expect } = require('@playwright/test');
const { launchApp }    = require('./helpers/launch');
const path             = require('path');
const fs               = require('fs');

// ─── App launch ─────────────────────────────────────────────────────────────

test.describe('App launch', () => {
  let window, close;

  test.beforeEach(async () => {
    ({ window, close } = await launchApp());
  });

  test.afterEach(async () => {
    await close();
  });

  // 1. Body is in the DOM ────────────────────────────────────────────────────
  test('window is visible and has a <body>', async () => {
    await expect(window.locator('body')).toBeVisible();
  });

  // 2. Screenshot on load ───────────────────────────────────────────────────
  test('screenshot on load', async () => {
    fs.mkdirSync(path.resolve(__dirname, '../screenshots'), { recursive: true });
    await window.screenshot({
      path: path.resolve(__dirname, '../screenshots/test-load.png'),
      fullPage: true,
    });
  });

  // 3. Key DOM landmarks ────────────────────────────────────────────────────
  test('header element exists', async () => {
    await expect(window.locator('#header')).toBeAttached();
  });

  test('main-div element exists', async () => {
    await expect(window.locator('#main-div')).toBeAttached();
  });

  // 4. Page title ───────────────────────────────────────────────────────────
  test('page title is set', async () => {
    const title = await window.title();
    expect(title.length).toBeGreaterThan(0);
  });

  // 5. JS evaluation in the renderer ────────────────────────────────────────
  test('can evaluate JS in the renderer', async () => {
    const ready = await window.evaluate(() => document.readyState);
    expect(ready).toBe('complete');
  });
});

// ─── Visual regression ──────────────────────────────────────────────────────
//
// First run: creates golden snapshots under tests/app.test.js-snapshots/.
// Subsequent runs: compares against them.  Update with --update-snapshots.
//
// Run only these with:   npm run test:visual

test.describe('Visual regression', () => {
  let window, close;

  test.beforeEach(async () => {
    // Extra wait so the first slide is fully painted before snapshotting.
    ({ window, close } = await launchApp({ waitMs: 5000 }));
  });

  test.afterEach(async () => {
    await close();
  });

  test('first slide matches snapshot @visual', async () => {
    await expect(window).toHaveScreenshot('first-slide.png', {
      maxDiffPixelRatio: 0.02,   // allow up to 2 % pixel difference
    });
  });
});
