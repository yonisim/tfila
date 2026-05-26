# Testing Guide — tfila Display App

Playwright + Electron end-to-end tests that verify the visual layout of every slide type.

---

## Running the tests

```powershell
npm test                        # run all tests (headless, one worker)
npm run test:headed             # show the Electron window while running
npm run test:debug              # step through with Playwright Inspector
npm run test:report             # open the last HTML report in a browser
```

Run a single suite by name:
```powershell
npx playwright test --grep "Shabbat"
npx playwright test --grep "Friday"
npx playwright test --grep "Regular"
```

Run a single file explicitly (useful when you have multiple test files):
```powershell
npx playwright test tests/app.test.js
```

---

## Evaluating a failure

When a test fails Playwright writes artifacts to `test-results/<test-name>/`:

| Artifact | What it shows |
|---|---|
| `test-failed-1.png` | Screenshot of the app at the moment of failure |
| `error-context.md` | The assertion that failed with values |
| `trace.zip` | Full step-by-step trace (see below) |

**View the trace** (interactive timeline of every action + screenshot):
```powershell
npx playwright show-trace test-results\<folder>\trace.zip
```

---

## Key pitfall: `toBeVisible()` does NOT catch overflow clipping

Playwright's `toBeVisible()` only checks `display`, `visibility`, and `opacity`.  
It returns **true** even for elements that are visually cut off by an ancestor's `overflow: hidden`.

Use the `assertContainedIn(innerEl, outerEl, label)` helper (defined in `app.test.js`) whenever
you need to prove that an element's bounding box lies **fully inside** its container:

```js
await assertContainedIn(
  window.locator('#friday-prayer-card-hadlakat'),
  window.locator('#friday-prayer-row-erev-shabbat').locator('xpath=ancestor::section[1]'),
  '#friday-prayer-card-hadlakat'
);
```

The helper uses `boundingBox()` comparisons with ±1 px tolerance for sub-pixel rounding.

---

## DPI scaling — why `setViewportSize` is required

On high-DPI development machines (e.g. 1920 × 1080 at 150 % Windows scaling) the
CSS viewport is only **720 px tall** (`1080 / 1.5`), and after the taskbar it drops to
**672 px** — even though `BrowserWindow({ height: 800 })` was specified.

The launch helper (`tests/helpers/launch.js`) normalises this immediately after window
creation:

```js
await window.setViewportSize({ width: 1280, height: 800 });
```

This forces `100vh = 800 px` and `100vw = 1280 px` regardless of the host machine's
physical resolution or DPI scale. The production display (a dedicated screen at 100 % DPI)
naturally gives the same viewport, so tests and production render identically.

**Do not remove this call.** Without it, layout tests will give different results on
machines with different DPI settings.

---

## Test structure rules (from CRITERIA.md §0)

- **One `electron.launch()` per suite** — each `describe` block uses `beforeAll` / `afterAll`.
  Re-launching per test is slow and unnecessary.
- **One `test()` per slide** — all criteria for a given slide type live in a single test block.
- **Fixed `testDate`** — every launch passes an ISO date so the correct slide always loads,
  independent of when the test runs. Dates must avoid holidays/special days that would
  show a different slide.

---

## CSS rebuild

Changes to `styles/src/tailwind-input.css` do **not** take effect until you recompile:

```powershell
npm run build:css
```

This regenerates `styles/tailwind-tfilot-single-page.css` (the file the app actually loads).

---

## File map

| File | Purpose |
|---|---|
| `tests/app.test.js` | All test suites and assertion helpers |
| `tests/CRITERIA.md` | Human-readable acceptance criteria each test enforces |
| `tests/helpers/launch.js` | Shared `launchApp()` helper (env setup, viewport normalisation) |
| `styles/src/tailwind-input.css` | CSS source — edit this, then rebuild |
| `styles/tailwind-tfilot-single-page.css` | Compiled CSS — do not edit directly |
