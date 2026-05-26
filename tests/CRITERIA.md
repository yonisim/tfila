# Test Criteria — tfila Display App

Visual and structural acceptance criteria that every slide must meet.  
These are the standards the automated tests (and manual review of screenshots) should verify.

---

## 0. Test Structure Rules

- **One app launch per slide type.**  
  Each test suite (Regular day, Friday, Shabbat) must launch the Electron app exactly once using `test.beforeAll` and close it in `test.afterAll`. Do not re-launch between assertions.

- **One test per slide type.**  
  All criteria for a given slide must be asserted inside a single `test()` block. Do not split criteria across multiple tests for the same slide.

- **Fixed, deterministic dates.**  
  Every launch must pass a `testDate` so the slide shown is always the same regardless of when the test runs. Dates must not fall on any holiday or special day that would alter the expected slide.

---

## 1. Layout & Clipping

- **No slide may be cropped.**  
  The outer slide container (`#tfilot_single_page`, `#friday_single_page_plag`, `#shabat_single_page`, etc.) must be fully visible within the viewport — nothing cut off at any edge.

- **No card may overflow its column.**  
  Every `tz-glass-card` must sit fully inside its parent column. Cards must not extend beyond the right or left edge of the column, and must not be clipped at the bottom by the column's overflow boundary.

- **Both columns must be present and non-empty.**  
  The left prayer-times column and the right day-times column must both be visible. Neither column may have zero height.

- **The scroll container must not need to scroll under normal data.**  
  For a standard day (not an unusually long list of items), all content should fit within the viewport without the user needing to scroll.  
  *Acceptable exception:* if real-world data genuinely exceeds the screen, the container may scroll, but must not clip items mid-row.

---

## 2. Prayer-time Row Cards (`tz-glass-card` — label + time on one row)

These are the horizontal cards used in the day-times column and the Shabbat-week footer  
(e.g., "זריחה", "שקיעה", "מנחה", "ערבית").

- **Label and time must share a single visible row** — the card must not collapse to zero height or force the two elements onto separate lines due to a layout bug.

- **Time value (`font-display-time`) must never wrap.**  
  Times are `whitespace-nowrap`; if wrapping is observed it indicates a CSS regression.

- **Label text (right side of row card)** should render on **one line**.  
  If the label is genuinely too long for the available width it may wrap to a maximum of **two lines**.  
  Three or more lines, or text that is clipped/hidden, is a failure.

- **The right-border accent** (`border-r-4` or `border-r-8`) must be visible and not clipped.

---

## 3. Prayer-time Grid Cards (shacharit / mincha / arvit cards)

These are the taller `tz-glass-card` blocks that contain a grid of time-value + label pairs  
(e.g., `#tfilot-prayer-card-shacharit`).

- **Every row within the card must be fully visible** — no row clipped at the card's bottom edge.

- **Label cell (below the time value) should render on one line.**  
  If the label text is long it may wrap to a maximum of **two lines**.  
  Truncation (ellipsis or hidden overflow) is a failure.

- **Time value cell must never wrap** — a time like "07:30" must always appear on one line.

- **The thick right-border accent** (`border-r-8`) must be fully visible.

- Cards for shacharit, mincha, and arvit must all be visible simultaneously; none should be hidden or pushed off-screen by the others.

---

## 4. Section Headers

- **Section title (`tz-section-title`) must be on one line.**  
  Titles like "זמני תפילות שישי" or "זמני היום בהלכה" must not wrap.

- **Parasha name (`#prayer-times-title-parasha`)** appears inline with or beneath the section title.  
  It must be readable and must not be clipped.

- **The decorative rule (`tz-section-rule`)** must be visible to the right of (or extending from) the title.  
  A missing rule indicates a layout collapse.

---

## 5. Clock & Date Strip

- **The clock widget** (`.tfilot-clock-corner .clock`) must be visible in the top corner of the slide.  
  The global `#header` clock is hidden in single-page mode; always target the slide-embedded clock via `.tfilot-clock-corner .clock`.

- **The Hebrew date** (`#tz_hebrew_date`) must be visible in the date strip and must not overflow outside the strip boundary.

- **Clock and date strip must not overlap** the section header or the first card row.

---

## 6. Slide-specific Criteria

### Regular day (`#tfilot_single_page`)
- The three prayer cards (שחרית, מנחה, ערבית) must all be visible.
- The day-times column must contain at least the sunrise and sunset rows.

### Friday (`#friday_single_page_plag`)
- The **הדלקת נרות** time must be visible.
- The **מנין פלג** section heading and its rows must be visible (this section is plag-variant only).
- The **קבלת שבת** row must be visible.
- The day-times column must be present alongside the prayers column.

### Shabbat (`#shabat_single_page`)
- The **erev-shabbat cards** (`#friday-prayer-card-hadlakat`, `#friday-prayer-card-mincha-kabalat`)
  must be **fully contained within** their parent `<section>` glass card — all four edges (including
  the bottom) must lie within the section's bounding box.  
  **Important:** Playwright's `toBeVisible()` is **not sufficient** here — a clipped card still
  passes that check. Use `boundingBox()` comparisons against the ancestor section to verify the
  bottom edge is not cut off by `overflow: hidden`.
- The **shabbat-day times** (`#second_column`) glass card must be visible below the erev-shabbat card.
- The **week footer** (`#shabat-week-footer`) with מנחה and ערבית times must be visible at the bottom of the right column.
- No overlap between the erev-shabbat row cards and the shabbat-day grid below them.

---

## 7. Viewport Reference

All tests run at **1280 × 800 px** (CSS pixels).  
This is enforced in `tests/helpers/launch.js` via `page.setViewportSize({ width: 1280, height: 800 })` immediately after the window is created. This call is necessary because on high-DPI machines (e.g. 150 % DPI on a 1920 × 1080 display) the physical window is only 672 CSS px tall and `100vh` would render differently than on the production display.  
Criteria above are defined for this viewport. If the viewport changes, re-evaluate line-wrapping and scrolling rules.
