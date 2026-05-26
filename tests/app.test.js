/**
 * Criterion-based Playwright tests — derived from tests/CRITERIA.md.
 *
 * Rules (§0):
 *   - One app launch per slide type (beforeAll / afterAll).
 *   - One test per slide: all criteria in a single test() block.
 *   - Fixed dates so the correct slide always loads.
 *
 * Viewport: 1280 × 800 px (--test-mode in main.js).
 */

const { test, expect } = require('@playwright/test');
const { launchApp }    = require('./helpers/launch');

const VW = 1280;
const VH = 800;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Count rendered text lines via scrollHeight / lineHeight. */
async function lineCount(el) {
  return el.evaluate(node => {
    const s = getComputedStyle(node);
    let lh  = parseFloat(s.lineHeight);
    if (isNaN(lh) || lh <= 0) lh = parseFloat(s.fontSize) * 1.2;
    return Math.round(node.scrollHeight / lh);
  });
}

/**
 * Run fn(el, box) for every element that has a non-zero bounding box.
 * Skips hidden / display-none / zero-size elements.
 */
async function forEachVisible(locator, fn) {
  for (const el of await locator.all()) {
    const box = await el.boundingBox();
    if (!box || box.width < 1 || box.height < 1) continue;
    await fn(el, box);
  }
}

/**
 * Assert that innerEl's bounding box is fully contained within outerEl's bounding box.
 * Uses ±1 px tolerance for sub-pixel rounding.
 * This catches elements that are visible per Playwright but visually clipped by
 * an ancestor's overflow:hidden boundary.
 */
async function assertContainedIn(innerEl, outerEl, label) {
  const inner = await innerEl.boundingBox();
  const outer = await outerEl.boundingBox();
  expect(inner, `${label} must have a bounding box`).not.toBeNull();
  expect(outer, `container of ${label} must have a bounding box`).not.toBeNull();
  expect(inner.x,                `${label} left edge inside container`).toBeGreaterThanOrEqual(outer.x - 1);
  expect(inner.y,                `${label} top edge inside container`).toBeGreaterThanOrEqual(outer.y - 1);
  expect(inner.x + inner.width,  `${label} right edge inside container`).toBeLessThanOrEqual(outer.x + outer.width + 1);
  expect(inner.y + inner.height, `${label} bottom edge inside container`).toBeLessThanOrEqual(outer.y + outer.height + 1);
}

// ─── Regular day ─────────────────────────────────────────────────────────────

test.describe('Regular day slide', () => {
  let window, close;

  test.beforeAll(async () => {
    ({ window, close } = await launchApp({
      testDate: '2026-05-24T10:00:00',   // Sunday, no holiday → tfilot_single_page
      waitMs: 4000,
    }));
  });
  test.afterAll(async () => { await close(); });

  test('all criteria pass', async () => {
    // §1 — slide container within viewport
    const slideBox = await window.locator('#tfilot_single_page').boundingBox();
    expect(slideBox).not.toBeNull();
    expect(slideBox.x).toBeGreaterThanOrEqual(0);
    expect(slideBox.y).toBeGreaterThanOrEqual(0);
    expect(slideBox.x + slideBox.width).toBeLessThanOrEqual(VW + 1);
    expect(slideBox.y + slideBox.height).toBeLessThanOrEqual(VH + 1);

    // §1 — both columns non-empty
    const lh = await window.locator('#prayer_times').evaluate(el => el.clientHeight);
    const rh = await window.locator('#day_times').evaluate(el => el.clientHeight);
    expect(lh).toBeGreaterThan(0);
    expect(rh).toBeGreaterThan(0);

    // §1 — no glass card overflows horizontally
    await forEachVisible(window.locator('.tz-glass-card'), async (_el, box) => {
      expect(box.x).toBeGreaterThanOrEqual(-1);
      expect(box.x + box.width).toBeLessThanOrEqual(VW + 1);
    });

    // §2 — time values never wrap
    await forEachVisible(window.locator('span.font-display-time'), async (el) => {
      expect(await el.evaluate(n => n.scrollWidth > n.clientWidth + 1)).toBe(false);
    });

    // §2 & §3 — prayer card captions ≤ 2 lines
    await forEachVisible(window.locator('span.text-on-surface-variant'), async (el) => {
      expect(await lineCount(el)).toBeLessThanOrEqual(2);
    });

    // §2 — row card labels ≤ 2 lines
    await forEachVisible(window.locator('span.break-words'), async (el) => {
      expect(await lineCount(el)).toBeLessThanOrEqual(2);
    });

    // §3 — all three prayer cards visible
    await expect(window.locator('#tfilot-prayer-card-shacharit')).toBeVisible();
    await expect(window.locator('#tfilot-prayer-card-mincha')).toBeVisible();
    await expect(window.locator('#tfilot-prayer-card-arvit')).toBeVisible();

    // §4 — section titles on one line
    await forEachVisible(window.locator('h2.tz-section-title'), async (el) => {
      expect(await lineCount(el)).toBeLessThanOrEqual(1);
    });

    // §5 — slide-embedded clock visible (global #header is hidden in tfilot-full-bleed mode)
    await expect(window.locator('.tfilot-clock-corner .clock')).toBeVisible();
  });
});

// ─── Friday slide ────────────────────────────────────────────────────────────

test.describe('Friday slide', () => {
  let window, close;

  test.beforeAll(async () => {
    ({ window, close } = await launchApp({
      testDate: '2026-05-15T10:00:00',   // Friday, MINYAN_PLAG_ACTIVE → friday_single_page_plag
      waitMs: 5000,
    }));
  });
  test.afterAll(async () => { await close(); });

  test('all criteria pass', async () => {
    // §1
    const slideBox = await window.locator('#friday_single_page_plag').boundingBox();
    expect(slideBox).not.toBeNull();
    expect(slideBox.x).toBeGreaterThanOrEqual(0);
    expect(slideBox.y).toBeGreaterThanOrEqual(0);
    expect(slideBox.x + slideBox.width).toBeLessThanOrEqual(VW + 1);
    expect(slideBox.y + slideBox.height).toBeLessThanOrEqual(VH + 1);

    // §1 — both columns non-empty
    const lh = await window.locator('#friday_prayers').evaluate(el => el.clientHeight);
    const rh = await window.locator('#day_times').evaluate(el => el.clientHeight);
    expect(lh).toBeGreaterThan(0);
    expect(rh).toBeGreaterThan(0);

    // §1 — no horizontal card overflow
    await forEachVisible(window.locator('.tz-glass-card'), async (_el, box) => {
      expect(box.x).toBeGreaterThanOrEqual(-1);
      expect(box.x + box.width).toBeLessThanOrEqual(VW + 1);
    });

    // §2 — times never wrap
    await forEachVisible(window.locator('span.font-display-time'), async (el) => {
      expect(await el.evaluate(n => n.scrollWidth > n.clientWidth + 1)).toBe(false);
    });

    // §2 & §3 — captions ≤ 2 lines
    await forEachVisible(window.locator('span.text-on-surface-variant'), async (el) => {
      expect(await lineCount(el)).toBeLessThanOrEqual(2);
    });

    // §2 — row labels ≤ 2 lines
    await forEachVisible(window.locator('span.break-words'), async (el) => {
      expect(await lineCount(el)).toBeLessThanOrEqual(2);
    });

    // §4 — section titles on one line (h2 and the smaller h3 plag heading)
    await forEachVisible(window.locator('h2.tz-section-title, h3.tz-section-title'), async (el) => {
      expect(await lineCount(el)).toBeLessThanOrEqual(1);
    });

    // §5 — clock and hebrew date visible
    await expect(window.locator('.tfilot-clock-corner .clock')).toBeVisible();
    await expect(window.locator('#tz_hebrew_date')).toBeVisible();

    // §6 Friday-specific — plag section present
    await expect(window.locator('#plag')).toBeVisible();
  });
});

// ─── Shabbat slide ───────────────────────────────────────────────────────────

test.describe('Shabbat slide', () => {
  let window, close;

  test.beforeAll(async () => {
    ({ window, close } = await launchApp({
      testDate: '2026-05-16T10:00:00',   // Saturday, no holiday → shabat_single_page
      waitMs: 5000,
    }));
  });
  test.afterAll(async () => { await close(); });

  test('all criteria pass', async () => {
    // §1
    const slideBox = await window.locator('#shabat_single_page').boundingBox();
    expect(slideBox).not.toBeNull();
    expect(slideBox.x).toBeGreaterThanOrEqual(0);
    expect(slideBox.y).toBeGreaterThanOrEqual(0);
    expect(slideBox.x + slideBox.width).toBeLessThanOrEqual(VW + 1);
    expect(slideBox.y + slideBox.height).toBeLessThanOrEqual(VH + 1);

    // §1 — no horizontal card overflow
    await forEachVisible(window.locator('.tz-glass-card'), async (_el, box) => {
      expect(box.x).toBeGreaterThanOrEqual(-1);
      expect(box.x + box.width).toBeLessThanOrEqual(VW + 1);
    });

    // §2 — times never wrap
    await forEachVisible(window.locator('span.font-display-time'), async (el) => {
      expect(await el.evaluate(n => n.scrollWidth > n.clientWidth + 1)).toBe(false);
    });

    // §2 & §3 — captions ≤ 2 lines
    await forEachVisible(window.locator('span.text-on-surface-variant'), async (el) => {
      expect(await lineCount(el)).toBeLessThanOrEqual(2);
    });

    // §2 — row labels ≤ 2 lines
    await forEachVisible(window.locator('span.break-words'), async (el) => {
      expect(await lineCount(el)).toBeLessThanOrEqual(2);
    });

    // §4 — section titles on one line
    await forEachVisible(window.locator('h2.tz-section-title'), async (el) => {
      expect(await lineCount(el)).toBeLessThanOrEqual(1);
    });

    // §5 — clock and hebrew date
    await expect(window.locator('.tfilot-clock-corner .clock')).toBeVisible();
    await expect(window.locator('#tz_hebrew_date')).toBeVisible();

    // §6 Shabbat-specific — erev-shabbat cards must be fully inside their parent glass card,
    // not merely "visible" (Playwright counts clipped elements as visible).
    // The parent is the nearest ancestor <section> of the erev-shabbat row.
    const erevSection = window.locator('#friday-prayer-row-erev-shabbat').locator('xpath=ancestor::section[1]');

    await assertContainedIn(
      window.locator('#friday-prayer-card-hadlakat'),
      erevSection,
      '#friday-prayer-card-hadlakat'
    );
    await assertContainedIn(
      window.locator('#friday-prayer-card-mincha-kabalat'),
      erevSection,
      '#friday-prayer-card-mincha-kabalat'
    );

    // §6 Shabbat-specific — week footer times visible
    await expect(window.locator('#shabat-week-footer')).toBeVisible();
    await expect(window.locator('#mincha-regulr-days-footer')).toBeVisible();
    await expect(window.locator('#arvit-regulr-days-footer')).toBeVisible();
  });
});
