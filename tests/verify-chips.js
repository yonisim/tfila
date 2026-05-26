/**
 * One-shot screenshot script — verifies prayer chip visibility and מנחה קטנה label.
 * Run: node tests/verify-chips.js
 */
const { launchApp } = require('./helpers/launch');

(async () => {
  const { window, close } = await launchApp({
    testDate: '2026-05-24T10:00:00',
    waitMs: 4000,
  });

  // Screenshot the full slide
  await window.screenshot({ path: 'screenshots/verify-chips-full.png' });

  // Crop to just the prayer cards column
  const col = window.locator('#tfilot-prayer-card-shacharit').locator('..');
  await col.screenshot({ path: 'screenshots/verify-chips-cards.png' });

  // Check מנחה קטנה line count
  const minchaKtana = window.locator('#mincha-regulr-days').locator('+ span');
  const box = await minchaKtana.boundingBox();
  const lh = await minchaKtana.evaluate(n => {
    const s = getComputedStyle(n);
    return parseFloat(s.lineHeight) || parseFloat(s.fontSize) * 1.2;
  });
  const lines = box ? Math.round(box.height / lh) : 'N/A';
  console.log('מנחה קטנה line count:', lines, '(expected: 1)');

  // Check prayer chip font-size
  const chip = window.locator('.tz-inline-prayer-label').first();
  const chipFs = await chip.evaluate(n => getComputedStyle(n).fontSize);
  const chipBg = await chip.evaluate(n => getComputedStyle(n).backgroundColor);
  console.log('chip font-size:', chipFs);
  console.log('chip background:', chipBg);

  await close();
  console.log('Screenshots saved to screenshots/');
})();
