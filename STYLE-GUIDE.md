# Mishkan Tkiya — Style Guide

## Two-layer CSS system

This project uses **two separate CSS systems** that must not be mixed:

| Layer | Where used | Classes look like |
|-------|-----------|-------------------|
| **Legacy semantic CSS** (`tfilot.css`, `main.css`) | Old HTML-fragment slides (`html/*.html`) | `.shabat-grid`, `.grid-box-right`, `.tfilot-shabat-grid-horizontal` |
| **Tailwind utilities** (`tailwind-tfilot-single-page.css`) | New single-page slides (`*_single_page.html`) | `flex`, `min-w-0`, `text-4xl`, `rounded-xl` |

**Rule:** New slides → Tailwind only. Existing legacy slides → keep legacy classes, do not add Tailwind.

---

## New slides — Tailwind conventions

### Build step
Always rebuild the CSS after touching `styles/src/tailwind-input.css` or adding new Tailwind classes to HTML/JS files:
```
npm run build:css
```

### Layout

- **Two-column grid** uses `.tz-two-col-grid` (defined in `styles/src/tailwind-input.css` `@layer components`).
- **Keep the two columns vertically equal sized.** Both columns must stretch to the same height. Use `items-stretch` on the row container and `flex-1 min-h-0` on each column so that neither column dictates the height of the other.
- **Cards** inside columns use `flex min-h-0 min-w-0 flex-1 flex-col` so they fill available vertical space without overflowing.
- **Horizontal card rows** (after-Shacharit timeline, afternoon cards) use `flex min-w-0 flex-wrap gap-2 sm:gap-3` with each card as `flex-1 basis-0`.

### Typography scale
| Token | Use |
|-------|-----|
| `font-display-time` | All clock/prayer-time digits |
| `text-primary` | Time digits, section accents |
| `text-on-surface-variant` | Captions below times |
| `text-4xl` / `sm:text-3xl md:text-4xl` | Large time display |
| `text-xs` / `sm:text-sm` | Card captions |

### Colors (Maayan dark-gold theme)
All custom color tokens are defined in `tailwind.config.js`. Do not hardcode hex values in class names.

| Token | Role |
|-------|------|
| `primary` | Gold accent (`#c8a95b`) |
| `on-surface` | Main text on dark background |
| `on-surface-variant` | Secondary/caption text |
| `surface` | Card background |

### Glass cards
Use the `.tz-glass-card` component class (defined in `tailwind-input.css`) for all prayer-time cards. The right-border accent is `border-r-8 border-primary`.

### Responsive
- Mobile-first. Breakpoint `sm:` is the main desktop adjustment.
- Use `sm:flex-nowrap` on time strips so columns wrap only on very narrow screens.
- Avoid fixed heights — use `min-h-0` + `flex-1` to let content determine size.

---

## Legacy slides — CSS conventions

- CSS lives in `styles/tfilot.css` and `styles/main.css`.
- Each legacy class is marked with `/* LEGACY */` to make it easy to distinguish from Tailwind output.
- Do **not** remove legacy classes unless you are also rewriting the HTML that uses them.
- Common legacy classes and their roles are documented directly in `tfilot.css`.

---

## HTML builders (`scripts/html-builders.js`)

All Tailwind-based HTML string construction lives here. The CSS class constants (`TZ_TF_CAP_*`, `SHABAT_DAY_CARD_SHELL`, etc.) are grouped at the top of the file — **edit there** to restyle all cards at once, rather than hunting through individual functions.

- Functions are **pure**: they take data and return an HTML string. No DOM access.
- To change how all prayer-time cards look, edit the `TZ_TF_*` constants at the top of `html-builders.js`.
- To change card shells (Shabbat, Shavuot), edit the `*_CARD_SHELL` constants.

---

## Holiday dates (`scripts/holiday-dates.js`)

All hardcoded date ranges live here and **only** here. To update for a new year:
1. Open `holiday-dates.js`.
2. Add a new `// ─── תשפ"ז (2026-2027) ───` section.
3. Copy the previous year's keys and update the dates.
4. The old year's keys stay in the file (they just become inactive once their dates pass).

**Never** put date strings directly in `present-next-page.js` or `holiday-rules.js`. All `is_*` predicates in `holiday-rules.js` reference `DATES.*` constants only.

---

## Module dependency order

```
holiday-dates.js          (pure data — no imports)
    ↓
holiday-rules.js          (pure predicates — imports DATES)
    ↓
html-builders.js          (pure HTML strings — imports selected is_* predicates)
    ↓
present-next-page.js      (orchestration + DOM — imports everything above)
```

No upward dependencies. `html-builders.js` must never import from `present-next-page.js`.
