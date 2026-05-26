const { launchApp } = require('./helpers/launch');

(async () => {
  const { window, close } = await launchApp({
    testDate: '2026-05-24T10:00:00',
    waitMs: 4000,
  });

  const chip = window.locator('.tz-inline-prayer-label').first();
  const bgImage = await chip.evaluate(n => getComputedStyle(n).backgroundImage);
  const fw = await chip.evaluate(n => getComputedStyle(n).fontWeight);
  console.log('chip backgroundImage:', bgImage.slice(0, 80));
  console.log('chip fontWeight:', fw);

  // Check מנחה קטנה via its parent column
  const minchaCaption = window.locator('[id="mincha-regulr-days"]').locator('~ span');
  const captionWs = await minchaCaption.evaluate(n => getComputedStyle(n).whiteSpace);
  console.log('מנחה קטנה whiteSpace:', captionWs);

  await close();
})();
