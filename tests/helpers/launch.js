/**
 * Shared launch helper — import this in any test file.
 *
 * ### Why the env dance?
 * VSCode / Claude Code sets ELECTRON_RUN_AS_NODE=1 so the Electron binary can be
 * used as a plain Node.js runtime for tooling.  Every child process inherits it,
 * which causes the Electron binary to behave as plain Node — it rejects Chromium
 * flags as "bad option" and require('electron') returns the binary path string
 * (so `app` is undefined in main.js).
 *
 * Fix: strip ELECTRON_RUN_AS_NODE from the env we pass to electron.launch().
 * With that gone, Playwright's normal electron.launch() works fine with Electron 23.
 *
 * ### Why electron.launch() rather than chromium.connectOverCDP()?
 * connectOverCDP() calls Browser.setDownloadBehavior immediately after connecting;
 * Electron 23 blocks that command ("Browser context management is not supported").
 * Playwright's native electron.launch() uses a different protocol path that avoids
 * the restricted browser-level commands.
 *
 * Usage:
 *   const { launchApp } = require('./helpers/launch');
 *   const { app, window, close } = await launchApp();
 *   // ... test ...
 *   await close();
 */

const { _electron: electron } = require('@playwright/test');
const path = require('path');

const ROOT     = path.resolve(__dirname, '../..');
const DATA_DIR = path.resolve(ROOT, '../tfila-data');   // sibling repo with prayer data

/**
 * @param {{ extraArgs?: string[], waitMs?: number }} [opts]
 * @returns {Promise<{ app: import('@playwright/test').ElectronApplication,
 *                     window: import('@playwright/test').Page,
 *                     close: () => Promise<void> }>}
 */
async function launchApp(opts = {}) {
  const { extraArgs = [], waitMs = 4000 } = opts;

  // Build a clean environment: strip ELECTRON_RUN_AS_NODE so the binary runs
  // as a real Electron app, and inject the data dir so the renderer can load data.
  const childEnv = { ...process.env };
  delete childEnv.ELECTRON_RUN_AS_NODE;
  childEnv.npm_config_data_dir = DATA_DIR;

  const app = await electron.launch({
    args: [ROOT, '--test-mode', ...extraArgs],
    env: childEnv,
  });

  const window = await app.firstWindow();
  await window.waitForLoadState('domcontentloaded');

  // Give the renderer scripts time to load the first slide.
  await new Promise(r => setTimeout(r, waitMs));

  const close = () => app.close();

  return { app, window, close };
}

module.exports = { launchApp, ROOT, DATA_DIR };
