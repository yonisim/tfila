# Tfilot single-page refactor — guidelines

Use this document when changing the **זמני תפילות חול** slide (`#tfilot_single_page`) or its build pipeline so refactors stay consistent.

This workstream also established conventions for the **Friday single-page** slides:

- `#friday_single_page`
- `#friday_single_page_plag`

## Stack and build

- **Tailwind is build-time only**: compiled CSS (`styles/tailwind-tfilot-single-page.css`) plus **local** fonts and images. **No CDN** assets for this flow.
- **`tailwind.config.js` important scoping**:
  - Use a **single selector**.
  - For multiple slide roots, wrap them in `:is(...)` (NOT a comma-separated list).
    - Good: `important: ':is(#tfilot_single_page, #friday_single_page, #friday_single_page_plag)'`
    - Bad: `important: '#tfilot_single_page, #friday_single_page, ...'` (breaks utilities like `.hidden` by generating selectors that apply `display:none` directly to the root ids).
- **`content` paths** must include every file that contributes class names: HTML fragments, **`scripts/present-next-page.js`** (and any other JS that emits class strings), and `styles/src/**/*.css`.
- After **HTML or class-string changes**, run:

  ```bash
  npm run build:css
  ```

- **Offline / CSP**: keep resources under **`'self'`**; fonts and images are bundled/copied (e.g. postinstall / asset scripts as already wired).

## Scope

- Prefer scoping layout/styling to the slide root:
  - `#tfilot_single_page`
  - `#friday_single_page`
  - `#friday_single_page_plag`
  - Or a shared selector wrapper: `:is(#tfilot_single_page, #friday_single_page, #friday_single_page_plag)`
- Avoid changing **global** slide markup or shared styles unless the task explicitly requires it.
- The **global `<header>`** is hidden for this slide via **`body.tfilot-full-bleed`**; the slide uses its **own HUD** (Hebrew date + clock). **`loop_pages`** clears `tfilot-full-bleed` at the start of each iteration so the header returns before the next load.

## Data and behavior (do not break contracts)

- Preserve **element `id`s** and the existing JS contracts:
  - **`set_element_data` / `set_element_html`**
  - **`show_*` / `hide_element`** (note: Tailwind `display` utilities with `!important` can override `.hidden-element { display: none }` — prefer **omitting DOM** or **tfilot-scoped `!important` overrides** when visibility must follow logic.)
- Treat tasks as **structure + styling** unless the brief explicitly asks for **logic** changes.
- **Prayer rows**: build markup with **small composable helpers** and **slot arrays** so adding/removing a time column is a one-line (or minimal) change.
- **Skeleton HTML** (`prayer_times_grouped_single_page.html`, etc.): **empty shells / ids only**; **fill inner markup from JS** after fetch where that pattern applies.
- **Slichot column**: only in DOM when **`is_between_dates(..., '2025-09-14T10:00', '2025-10-01T18:00')`** (adjust dates per season as needed). **No `shacharit-730` / 07:30** column on this slide.
- **ערבית 20:00**: show the middle column only when the **first maariv time is not strictly after 19:41** (same rule as legacy `set_arvit_times` / `is_after_time`); relabel the late slot when the middle column is omitted.

## Layout and UX

- **Two-column grid** (תפילות | זמני היום): use a **2×2 CSS grid** (header row + body row) so both section titles and both scroll areas **align** across columns.
- **Day-times column**: may be **wider** and use **larger type** than the prayer column ratio from older layouts; tune via grid fractions and `day_times_inner_single_page.html` utilities.
- **Viewport**: `#main-div:has(#tfilot_single_page)` (and the Friday equivalents) should track **header visibility** (`calc(100vh - 10vh)` when the global header is shown; **`100vh`** with **`body.tfilot-full-bleed`** when the header is hidden).
- **Main content** may sit **slightly below** the top (`padding-top` on `main.tfilot-main-offset`) and **overlap** the floating clock where useful; clock stays **`position: absolute`** (physical **top-left**) with a **higher z-index** than `main`.
- **Footer**: in-flow at bottom of the slide; **theme styles** live under **`#tfilot_single_page`** in `styles/src/tailwind-input.css`. Footer text may need **`font-size: … !important`** to beat legacy **`my-text-*`** classes from JS.

## Clock and HUD

- **`clock-time.js`**: resolve the active clock via the active slide root (tfilot + Friday single-page roots) first, else **`header`**, else `document`. Guard missing nodes during transitions.
- **DOM order** inside `.clock`: **`hour` → `:` → `min` → `:` → `second`** with **`direction: ltr`** on `.clock` so **HH:MM:SS** reads left-to-right.
- **Hebrew date** in tfilot HUD: **`#tfilot_hebrew_date`**.
- **Hebrew date** in Friday HUD: **`#friday_hebrew_date`**.
- Keep **`present_hebrew_date_in_header`** in sync when these nodes exist.

## Friday single-page prayer cards (conclusions)

Friday uses the same “glass card” vocabulary as weekdays, but with a dedicated shell and a horizontal “logical row” pattern.

- **Shell HTML**: `html/prayer_times_friday_single_page.html`
  - `#friday-prayer-card-shacharit` (weekday grouped shacharit row UI)
  - `#friday-prayer-row-erev-shabbat`: horizontal row of equal-width cards
    - `#friday-prayer-card-mincha-gedola` (static 13:15)
    - `#friday-prayer-card-hadlakat` (`#hadlakat-nerot`)
    - `#friday-prayer-card-mincha-kabalat` (`#mincha_shabat_eve` with caption “מנחה וקבלת שבת”)
- **Equal-width horizontal cards**:
  - In HTML: use `flex` row + each card `flex-1 basis-0 min-w-0`.
  - Keep card contents centered (`items-center justify-center text-center`).
  - Prefer no-wrap captions (`whitespace-nowrap max-w-none`) so Hebrew captions stay on one line when possible.
- **Centered strips**:
  - Default grouped strip (`TZ_TF_STRIP`) is start/space-between oriented for multi-slot prayer rows.
  - For single-slot “horizontal cards”, use a centered strip helper (the inline-flex centered variant) so content actually centers (don’t rely only on `text-center`).
- **Async ordering**:
  - When the Friday shell is loaded via `fetch(...)`, `present_friday_single_page` should `await` it before calling `show_minyan_plag(...)` or other logic that assumes the DOM nodes exist.

## Styling conventions

- **Section titles** (e.g. זמני תפילות / זמני היום): scoped under **`#tfilot_single_page`** in `tailwind-input.css` (`.tz-section-header`, `.tz-section-title`, `.tz-section-rule`).
- **In-card prayer labels** (שחרית / מנחה / ערבית): **`.tz-inline-prayer-label`** — scoped chip styles in `tailwind-input.css`.
- **Tfilot-only clock chrome** (border, glow, size): override **`.tfilot-clock-corner`** in `tailwind-input.css`; keep **`header.css`** modest for **non-tfilot** header use.

## Files to know

| Area | Typical files |
|------|----------------|
| Slide shell | `html/tfilot_single_page.html` |
| Grouped prayer cards shell | `html/prayer_times_grouped_single_page.html` |
| Friday prayer cards shell | `html/prayer_times_friday_single_page.html` |
| Day-time rows | `html/day_times_inner_single_page.html` |
| Logic + composable HTML | `scripts/present-next-page.js` |
| Tailwind source | `styles/src/tailwind-input.css` → built `styles/tailwind-tfilot-single-page.css` |
| Config | `tailwind.config.js` |
| Global header (other slides) | `html/header.html`, `styles/header.css` |
| Entry | `index.html` (links built CSS) |

## Checklist before merging a UI change

1. Scoped under the relevant slide root (tfilot / Friday), or the shared `:is(...)` wrapper.
2. **`npm run build:css`** run if HTML/classes/JS class strings / `tailwind-input.css` changed.
3. **Ids and JS hooks** unchanged unless the task includes a coordinated script change.
4. **CSP / offline**: no new external URLs without an approved pattern.
5. **RTL + clock**: LTR clock strip; physical **top-left** for tfilot clock if that layout is kept.

---

*Last aligned with the tfilot single-page + header HUD workstream; extend this file when new conventions are agreed.*
