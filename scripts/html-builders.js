'esversion: 8';

/**
 * html-builders.js
 *
 * Generates the HTML strings for the Tailwind-based single-page slides
 * (תפילות חול, שישי, שבת, שבועות).
 *
 * No DOM access here — all functions are pure: they receive data and return an
 * HTML string. The caller is responsible for injecting the result with
 * set_element_html() / insert_html_at_*().
 *
 * CSS class constants are grouped at the top so you can tweak sizing or spacing
 * in one place without hunting through the builders.
 */

import { is_purim, is_10_tevet_friday } from './holiday-rules.js';

// ─── Layout / typography class constants ──────────────────────────────────────
// Edit these to change how all prayer-time cards look across all pages.

/** Large time digit inside a prayer card. */
var TZ_TF_TIME =
    'shrink-0 font-display-time text-4xl text-primary tz-time-glow sm:text-3xl md:text-4xl';

/** Caption below a time — small, wraps at ~5.5 rem. */
var TZ_TF_CAP_SM =
    'max-w-[5.5rem] text-center text-xs leading-tight text-on-surface-variant sm:text-sm';

/** Caption — slightly wider. */
var TZ_TF_CAP_MD =
    'max-w-[6rem] text-center text-xs leading-tight text-on-surface-variant sm:text-sm';

/** Caption — tighter. */
var TZ_TF_CAP_TIGHT =
    'max-w-[5rem] text-center text-xs leading-tight text-on-surface-variant sm:text-sm';

/** Caption that must never line-wrap (Friday horizontal cards). */
export var TZ_TF_CAP_NOWRAP =
    'max-w-none whitespace-nowrap text-center text-xs leading-tight text-on-surface-variant sm:text-sm';

/** Default time column: equal-width slots across the strip. */
var TZ_TF_COL_DEFAULT = 'flex min-w-0 flex-1 basis-0 flex-col items-center gap-0.5';

/** Full-width strip of time columns — stretches from edge to edge (prayer rows). */
var TZ_TF_STRIP =
    'flex min-w-0 w-full flex-1 flex-wrap items-end justify-end gap-x-4 gap-y-2 sm:flex-nowrap sm:justify-between sm:gap-x-0';

/** Centered strip — for standalone cards (הדלקה, קבלת שבת, …). */
var TZ_TF_STRIP_CENTER =
    'inline-flex min-w-0 flex-wrap items-end justify-center gap-x-4 gap-y-2 sm:gap-x-6';

/** Glass card shell used for Shabbat "after Shacharit" timeline and afternoon cards. */
export var SHABAT_DAY_CARD_SHELL =
    'tz-glass-card flex min-w-0 flex-1 basis-0 flex-col items-center justify-center gap-2 rounded-xl border-r-8 border-primary p-3 text-center shadow-glass sm:gap-2.5 sm:p-4';

/** Shavuot: wider card for כניסת עול מלכות שמים לילדים (two-line caption). */
export var SHAVUOT_KABALAT_YELADIM_CARD_SHELL =
    'tz-glass-card shavuot-card-kabbalat-yeladim flex min-w-0 flex-none flex-col items-center justify-center gap-2 rounded-xl border-r-8 border-primary p-3 text-center shadow-glass sm:gap-2.5 sm:p-4';

/** Shavuot and Shabbat compact prayer rows (שחרית / מנחה inside second_column). */
export var SHAVUOT_COMPACT_TF_CARD_SHELL =
    'shabat-compact-tf tz-glass-card flex min-w-0 flex-col gap-2 rounded-xl border-r-8 border-primary p-3 shadow-glass sm:gap-2.5 sm:p-4';

/** Master switch: false hides all optional SVG icons beside times. */
var TZ_TFICONS_ENABLED = false;

// ─── SVG icon helpers ─────────────────────────────────────────────────────────
// Each returns an SVG string (currentColor). Keep aria-hidden="true" on all.

var TZ_ICON_SVG_CLASS =
    'block h-[1.05em] w-[1.05em] shrink-0 text-primary/95 sm:h-[1.15em] sm:w-[1.15em]';

export function tz_icon_sun_svg() {
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" class="' +
        TZ_ICON_SVG_CLASS + '" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="4"/>' +
        '<path d="M12 2.25v2.5M12 19.25v2.5M4.22 4.22l1.77 1.77M18.01 18.01l1.77 1.77M2.25 12h2.5M19.25 12h2.5M4.22 19.78l1.77-1.77M18.01 5.99l1.77-1.77"/>' +
        '</svg>'
    );
}

export function tz_icon_moon_svg() {
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="' +
        TZ_ICON_SVG_CLASS + '" aria-hidden="true">' +
        '<path fill="currentColor" fill-opacity="0.88" d="M21 12.5A8.5 8.5 0 1110.9 3.05 6.4 6.4 0 0021 12.5z"/>' +
        '</svg>'
    );
}

export function tz_icon_shabbat_candles_svg() {
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="' +
        TZ_ICON_SVG_CLASS + ' h-[1.15em] w-[1.15em] sm:h-[1.25em] sm:w-[1.25em]" aria-hidden="true">' +
        '<rect x="6.8" y="11.35" width="4.35" height="9.15" rx="0.9" fill="currentColor" fill-opacity="0.1" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round"/>' +
        '<rect x="14.5" y="11.5" width="4.35" height="9" rx="0.9" fill="currentColor" fill-opacity="0.1" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round"/>' +
        '<path fill="currentColor" fill-opacity="0.92" stroke="currentColor" stroke-width="0.28" stroke-linejoin="round" d="M9 2.05L5.55 11.05Q9 13.6 12.45 11.05L9 2.05z"/>' +
        '<path fill="currentColor" fill-opacity="0.92" stroke="currentColor" stroke-width="0.28" stroke-linejoin="round" d="M16.75 2.35L13.25 11.35Q16.75 13.75 20.25 11.35L16.75 2.35z"/>' +
        '</svg>'
    );
}

export function tz_icon_kiddush_cup_svg() {
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" class="' +
        TZ_ICON_SVG_CLASS + '" aria-hidden="true">' +
        '<path d="M8.5 5.75L9.38 14.25Q12 16.35 14.62 14.25L15.5 5.75H8.5z"/>' +
        '<path d="M12 16.55v3.85"/>' +
        '<path d="M9.15 21.65h5.7"/>' +
        '</svg>'
    );
}

export function tz_icon_child_svg() {
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" class="' +
        TZ_ICON_SVG_CLASS + '" aria-hidden="true">' +
        '<circle cx="12" cy="8" r="2.75"/>' +
        '<path d="M6.5 20.5c0-3.5 2.5-6 5.5-6s5.5 2.5 5.5 6"/>' +
        '</svg>'
    );
}

export function tz_icon_book_open_svg() {
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" class="' +
        TZ_ICON_SVG_CLASS + '" aria-hidden="true">' +
        '<path d="M4 5.5A2.5 2.5 0 016.5 3H12v18H6.5A2.5 2.5 0 014 18.5v-13zM20 5.5A2.5 2.5 0 0017.5 3H12v18h5.5a2.5 2.5 0 002.5-2.5v-13z"/>' +
        '</svg>'
    );
}

export function tz_icon_scroll_svg() {
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" class="' +
        TZ_ICON_SVG_CLASS + '" aria-hidden="true">' +
        '<path d="M8 4h9a2 2 0 012 2v14a2 2 0 01-2 2H8V4zM8 4H7a2 2 0 00-2 2v14a2 2 0 002 2h1"/>' +
        '</svg>'
    );
}

export function tz_icon_people_svg() {
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" class="' +
        TZ_ICON_SVG_CLASS + '" aria-hidden="true">' +
        '<circle cx="9" cy="7" r="2.25"/>' +
        '<circle cx="16" cy="8" r="2"/>' +
        '<path d="M4 20c0-3 2.5-5 5-5s5 2 5 5M13 20c0-2.5 1.8-4.3 4-4.8"/>' +
        '</svg>'
    );
}

// ─── Icon placement helpers ───────────────────────────────────────────────────

function tz_icon_beside_time_span(iconSvg) {
    if (!TZ_TFICONS_ENABLED || !iconSvg) { return ''; }
    return (
        '<span class="tz-beside-time-icon inline-flex shrink-0 translate-y-[0.2em] items-end gap-1 text-primary opacity-95 me-2 sm:me-3 [&>svg]:h-7 [&>svg]:w-7 sm:[&>svg]:h-8 sm:[&>svg]:w-8">' +
        iconSvg + '</span>'
    );
}

function tz_icon_card_corner_span(iconSvg) {
    if (!TZ_TFICONS_ENABLED || !iconSvg) { return ''; }
    return (
        '<span class="tz-card-corner-icon pointer-events-none absolute left-2.5 top-2.5 z-[1] inline-flex text-primary opacity-95 sm:left-3.5 sm:top-3.5 [&>svg]:h-7 [&>svg]:w-7 sm:[&>svg]:h-8 sm:[&>svg]:w-8">' +
        iconSvg + '</span>'
    );
}

// ─── Primitive builders ───────────────────────────────────────────────────────

function tz_tfilot_time_span_html(timeText, timeId) {
    var idAttr = timeId ? ' id="' + timeId + '"' : '';
    return '<span class="' + TZ_TF_TIME + '"' + idAttr + '>' + timeText + '</span>';
}

function tz_tfilot_caption_span_html(captionText, captionId, captionClass) {
    var cls = captionClass || TZ_TF_CAP_SM;
    var idAttr = captionId ? ' id="' + captionId + '"' : '';
    return '<span class="' + cls + '"' + idAttr + '>' + captionText + '</span>';
}

/**
 * One time + caption column.
 * options: { timeText, timeId?, timeHtml?, captionText, captionId?, captionHtml?,
 *            captionMaxClass?, wrapperClass? }
 */
export function tz_tfilot_grouped_time_column_html(options) {
    var wrapper = options.wrapperClass || TZ_TF_COL_DEFAULT;
    var timePart = options.timeHtml != null
        ? options.timeHtml
        : tz_tfilot_time_span_html(options.timeText, options.timeId);
    var capPart = options.captionHtml != null
        ? options.captionHtml
        : tz_tfilot_caption_span_html(options.captionText, options.captionId, options.captionMaxClass);
    return '<div class="' + wrapper + '">' + timePart + capPart + '</div>';
}

/** Horizontal strip of columns (full width, used in prayer rows). */
export function tz_tfilot_grouped_time_strip_html(columnsHtml) {
    return '<div class="' + TZ_TF_STRIP + '">' + columnsHtml + '</div>';
}

/** Centered strip (used in standalone cards like הדלקה, קבלת שבת). */
export function tz_tfilot_grouped_time_strip_center_html(columnsHtml) {
    return '<div class="' + TZ_TF_STRIP_CENTER + '">' + columnsHtml + '</div>';
}

/** Centered strip optionally wrapped with a corner icon. */
export function tz_tfilot_grouped_time_strip_center_html_beside_icon(columnsHtml, besideTimeIconSvg) {
    var strip = tz_tfilot_grouped_time_strip_center_html(columnsHtml);
    var centered = '<div class="flex w-full justify-center">' + strip + '</div>';
    var iconHtml = TZ_TFICONS_ENABLED ? besideTimeIconSvg : '';
    if (!iconHtml) { return centered; }
    return (
        '<div class="tz-tf-card-with-corner-icon relative flex min-h-0 w-full flex-1 flex-col items-center justify-center self-stretch">' +
        tz_icon_card_corner_span(iconHtml) + centered +
        '</div>'
    );
}

/**
 * Full prayer row: שחרית / מנחה / ערבית label chip + time strip.
 * titleIconSvg is shown only when TZ_TFICONS_ENABLED.
 */
export function tz_tfilot_grouped_prayer_row_html(prayerTitle, columnsHtml, titleIconSvg) {
    var strip = tz_tfilot_grouped_time_strip_html(columnsHtml);
    var effIcon = TZ_TFICONS_ENABLED ? titleIconSvg : '';
    var timeArea = (effIcon)
        ? '<div class="flex min-w-0 w-full flex-1 flex-wrap items-end justify-end gap-x-3 gap-y-2 sm:flex-nowrap sm:items-end sm:gap-x-5">' +
          tz_icon_beside_time_span(effIcon) + strip + '</div>'
        : strip;
    return (
        '<div class="flex min-w-0 flex-col gap-2 border-b border-primary/30 pb-3 sm:flex-row sm:items-end sm:gap-5">' +
        '<span class="tz-inline-prayer-label shrink-0">' + prayerTitle + '</span>' +
        timeArea + '</div>'
    );
}

/** Empty container for runtime-injected dynamic mincha rows. */
export function tz_tfilot_mincha_dynamic_prepend_container_html() {
    return '<div id="mincha-dynamic-prepend" class="flex min-w-0 flex-wrap items-end gap-x-4 gap-y-2 sm:gap-x-6"></div>';
}

export function create_tfilot_mincha_dynamic_row_html(time, label) {
    return tz_tfilot_grouped_time_column_html({
        timeText: time,
        captionText: label,
        captionMaxClass: TZ_TF_CAP_MD,
    });
}

// ─── Standalone card captions (Shabbat / Friday glass cards) ──────────────────

var TZ_TF_CAP_STANDALONE_BASE =
    'tz-standalone-cap block max-w-full text-center text-on-surface-variant leading-tight';

function tz_tf_cap_standalone_force_one_line(captionText) {
    var t = String(captionText || '').trim();
    return t === 'מנחה וקבלת שבת' || t === 'ערבית של חג' || t === 'מנחה ודבר תורה';
}

function tz_tf_cap_standalone_class(captionText) {
    var words = String(captionText || '').trim().split(/\s+/).filter(Boolean);
    if (tz_tf_cap_standalone_force_one_line(captionText) || words.length === 2) {
        return TZ_TF_CAP_STANDALONE_BASE + ' tz-standalone-cap--one-line';
    }
    if (words.length > 2) {
        return TZ_TF_CAP_STANDALONE_BASE + ' tz-standalone-cap--paired';
    }
    return TZ_TF_CAP_STANDALONE_BASE;
}

/** Standalone caption: 2 words → one line; more → two words per line. */
export function tz_tf_cap_standalone_html(captionText, captionId) {
    var words = String(captionText || '').trim().split(/\s+/).filter(Boolean);
    var cls = tz_tf_cap_standalone_class(captionText);
    var idAttr = captionId ? ' id="' + captionId + '"' : '';
    if (tz_tf_cap_standalone_force_one_line(captionText) || words.length <= 2) {
        return '<span class="' + cls + '"' + idAttr + '>' + words.join(' ') + '</span>';
    }
    var lines = [];
    for (var i = 0; i < words.length; i += 2) { lines.push(words.slice(i, i + 2).join(' ')); }
    return '<span class="' + cls + '"' + idAttr + '>' + lines.join('<br>') + '</span>';
}

/** Exactly two explicit lines (for long fixed captions). */
export function tz_tf_cap_standalone_two_lines_html(captionText, captionId, line1Text, line2Text) {
    var cls = TZ_TF_CAP_STANDALONE_BASE + ' tz-standalone-cap--two-lines';
    var idAttr = captionId ? ' id="' + captionId + '"' : '';
    var l1, l2;
    if (line1Text != null && line2Text != null) {
        l1 = line1Text; l2 = line2Text;
    } else {
        var words = String(captionText || '').trim().split(/\s+/).filter(Boolean);
        if (words.length <= 2) {
            return '<span class="' + cls + '"' + idAttr + '>' + words.join(' ') + '</span>';
        }
        var mid = Math.ceil(words.length / 2);
        l1 = words.slice(0, mid).join(' ');
        l2 = words.slice(mid).join(' ');
    }
    return (
        '<span class="' + cls + '"' + idAttr + '>' +
        '<span class="block whitespace-nowrap">' + l1 + '</span>' +
        '<span class="block whitespace-nowrap">' + l2 + '</span>' +
        '</span>'
    );
}

/** Single centered card body (used in Friday + Shabbat standalone glass cards). */
export function tz_shabat_centered_card_body_html(timeId, captionText, wrapperClass, besideTimeIconSvg, captionId, captionHtmlOverride) {
    var wrap = wrapperClass || 'flex min-w-0 flex-col items-center gap-0.5';
    var capHtml = captionHtmlOverride != null
        ? captionHtmlOverride
        : tz_tf_cap_standalone_html(captionText, captionId);
    return tz_tfilot_grouped_time_strip_center_html_beside_icon(
        tz_tfilot_grouped_time_column_html({ wrapperClass: wrap, timeText: '', timeId: timeId, captionHtml: capHtml }),
        besideTimeIconSvg
    );
}

// ─── Weekday tfilot (חול) card builders ───────────────────────────────────────

export function get_tfilot_shacharit_grouped_card_inner_html(current_date) {
    var slots = [
        tz_tfilot_grouped_time_column_html({ timeText: '06:00', timeId: 'shacharit_a', captionText: 'שחרית א' }),
    ];
    /* Slichot slot: show only during the slichot season. */
    if (is_between_dates_local(current_date, '2025-09-14T10:00', '2025-10-01T18:00')) {
        slots.push(tz_tfilot_grouped_time_column_html({
            wrapperClass: 'hidden-element slichot flex min-w-0 flex-1 basis-0 flex-col items-center gap-0.5',
            timeText: '06:30', timeId: 'slichot', captionText: 'סליחות (משוער)', captionMaxClass: TZ_TF_CAP_MD,
        }));
    }
    slots.push(
        tz_tfilot_grouped_time_column_html({ timeText: '06:50', timeId: 'shacharit_b', captionText: 'שחרית ב' }),
        tz_tfilot_grouped_time_column_html({
            wrapperClass: 'hidden-element friday-shacharit flex min-w-0 flex-1 basis-0 flex-col items-center gap-0.5',
            timeText: '08:30', timeId: 'shacharit_main', captionText: 'שחרית ג', captionId: 'shacharit-830-name',
        })
    );
    return tz_tfilot_grouped_prayer_row_html('שחרית', slots.join(''), tz_icon_sun_svg());
}

/* Internal helper so this file doesn't import from present-next-page.js */
function is_between_dates_local(date, start, end) {
    return date >= new Date(start) && date <= new Date(end);
}

export function get_tfilot_mincha_grouped_card_inner_html() {
    var slots = [
        tz_tfilot_mincha_dynamic_prepend_container_html(),
        tz_tfilot_grouped_time_column_html({
            wrapperClass: 'hidden-element mincha-gedola flex min-w-0 flex-1 basis-0 flex-col items-center gap-0.5',
            timeText: '13:15', captionText: 'מנחה גדולה', captionMaxClass: TZ_TF_CAP_MD,
        }),
        tz_tfilot_grouped_time_column_html({
            timeText: '', timeId: 'mincha-regulr-days', captionText: 'מנחה קטנה', captionMaxClass: TZ_TF_CAP_TIGHT,
        }),
    ];
    return tz_tfilot_grouped_prayer_row_html('מנחה', slots.join(''));
}

/** Determines whether a second ערבית column (20:00) should be shown. */
export function tfilot_show_arvit_20_column(current_date, arvit_time) {
    var first = Array.isArray(arvit_time) ? arvit_time[0] : arvit_time;
    if (!first) { return true; }
    var parts = String(first).split(':');
    var arvit_date = new Date(current_date);
    arvit_date.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
    return !is_after_time_local(arvit_date, '19:41');
}

function is_after_time_local(date, time) {
    var d = new Date(date);
    var p = time.split(':');
    d.setHours(p[0], p[1], '00');
    return date > d;
}

export function get_tfilot_arvit_grouped_card_inner_html(current_date, arvit_time) {
    var show_arvit_20 = tfilot_show_arvit_20_column(current_date, arvit_time);
    var slots = [
        tz_tfilot_grouped_time_column_html({ timeText: '', timeId: 'arvit-regulr-days', captionText: 'ערבית א' }),
    ];
    if (show_arvit_20) {
        slots.push(tz_tfilot_grouped_time_column_html({
            wrapperClass: 'arvit-8 flex min-w-0 flex-1 basis-0 flex-col items-center gap-0.5',
            timeText: '20:00', captionText: 'ערבית ב',
        }));
    }
    slots.push(tz_tfilot_grouped_time_column_html({
        timeText: '21:00',
        captionText: show_arvit_20 ? 'ערבית ג' : 'ערבית ב',
        captionId: 'arvit-9',
    }));
    return tz_tfilot_grouped_prayer_row_html('ערבית', slots.join(''), tz_icon_moon_svg());
}

export function get_tfilot_shabat_mincha_grouped_card_inner_html() {
    var slots = [
        tz_tfilot_grouped_time_column_html({ timeText: '', timeId: 'mincha-shabat-a', captionText: 'מנחה א', captionMaxClass: TZ_TF_CAP_TIGHT }),
        tz_tfilot_grouped_time_column_html({ timeText: '', timeId: 'mincha-shabat-b', captionText: 'מנחה ב', captionMaxClass: TZ_TF_CAP_TIGHT }),
        tz_tfilot_grouped_time_column_html({ timeText: '', timeId: 'mincha-shabat-c', captionText: 'מנחה קטנה', captionMaxClass: TZ_TF_CAP_TIGHT }),
    ];
    return tz_tfilot_grouped_prayer_row_html('מנחה:', slots.join(''));
}

// ─── Friday single-page card builders ────────────────────────────────────────

/** Equal-width cards row (used to build the erev-shabbat strip). */
export function tz_equal_width_cards_row_html(cardIds) {
    var cards = cardIds.map(function(id) {
        return '<div class="tz-glass-card flex min-w-0 flex-1 basis-0 flex-col gap-3 rounded-xl border-r-8 border-primary p-5 shadow-glass" id="' + id + '"></div>';
    });
    return '<div class="flex min-w-0 flex-wrap gap-3">' + cards.join('') + '</div>';
}

export function get_friday_hadlakat_card_inner_html() {
    return tz_tfilot_grouped_time_strip_center_html_beside_icon(
        tz_tfilot_grouped_time_column_html({
            timeText: '', timeId: 'hadlakat-nerot',
            captionHtml: tz_tf_cap_standalone_html('הדלקת נרות'),
        }),
        tz_icon_shabbat_candles_svg()
    );
}

export function get_friday_kabalat_card_inner_html() {
    return tz_tfilot_grouped_time_strip_center_html_beside_icon(
        tz_tfilot_grouped_time_column_html({
            timeText: '', timeId: 'kabalat_shabat',
            captionText: 'קבלת שבת', captionId: 'kabalat-shabat-name',
            captionMaxClass: TZ_TF_CAP_NOWRAP,
        }),
        ''
    );
}

export function get_friday_mincha_gedola_card_inner_html() {
    return tz_tfilot_grouped_time_strip_center_html_beside_icon(
        tz_tfilot_grouped_time_column_html({
            timeText: '13:15', captionText: 'מנחה גדולה', captionMaxClass: TZ_TF_CAP_NOWRAP,
        }),
        ''
    );
}

export function get_friday_mincha_kabalat_card_inner_html() {
    return tz_tfilot_grouped_time_strip_center_html_beside_icon(
        tz_tfilot_grouped_time_column_html({
            wrapperClass: 'mincha_shabat_eve flex min-w-0 flex-col items-center gap-0.5',
            timeText: '', timeId: 'mincha_shabat_eve',
            captionHtml: tz_tf_cap_standalone_html('מנחה וקבלת שבת'),
        }),
        ''
    );
}

export function get_friday_plag_minyan_card_inner_html() {
    return (
        '<div class="flex min-w-0 flex-wrap gap-3">' +
        '<div class="tz-glass-card flex min-w-0 flex-1 basis-0 flex-col items-center justify-center gap-3 rounded-xl border-r-8 border-primary p-5 shadow-glass">' +
        tz_tfilot_grouped_time_strip_center_html(tz_tfilot_grouped_time_column_html({
            timeText: '', timeId: 'kabalat-shabat-early-mincha',
            captionText: 'מנחה וקבלת שבת מוקדמת', captionMaxClass: TZ_TF_CAP_NOWRAP,
        })) +
        '</div>' +
        '<div class="tz-glass-card flex min-w-0 flex-1 basis-0 flex-col items-center justify-center gap-3 rounded-xl border-r-8 border-primary p-5 shadow-glass">' +
        tz_tfilot_grouped_time_strip_center_html(tz_tfilot_grouped_time_column_html({
            timeText: '', timeId: 'kabalat-shabat-early',
            captionText: 'פלג המנחה', captionMaxClass: TZ_TF_CAP_NOWRAP,
        })) +
        '</div>' +
        '</div>'
    );
}

export function get_friday_shacharit_card_inner_html(current_date) {
    var inner = '';
    if (is_10_tevet_friday(current_date)) {
        inner +=
            '<div class="mb-3 border-b border-primary/30 pb-3">' +
            tz_tfilot_grouped_time_strip_html(tz_tfilot_grouped_time_column_html({
                timeText: '05:06', captionText: 'כניסת הצום', captionMaxClass: TZ_TF_CAP_MD,
            })) +
            '</div>';
    }
    inner += get_tfilot_shacharit_grouped_card_inner_html(current_date);
    return inner;
}

export function fill_tfilot_prayer_times_grouped_cards(current_date, arvit_time, set_element_html_fn) {
    set_element_html_fn('tfilot-prayer-card-shacharit', get_tfilot_shacharit_grouped_card_inner_html(current_date));
    set_element_html_fn('tfilot-prayer-card-mincha',    get_tfilot_mincha_grouped_card_inner_html());
    set_element_html_fn('tfilot-prayer-card-arvit',     get_tfilot_arvit_grouped_card_inner_html(current_date, arvit_time));
}

export function fill_friday_prayer_grouped_cards(current_date, set_element_html_fn) {
    set_element_html_fn('friday-prayer-card-shacharit',     get_friday_shacharit_card_inner_html(current_date));
    set_element_html_fn('friday-prayer-card-mincha-gedola', get_friday_mincha_gedola_card_inner_html());
    set_element_html_fn('friday-prayer-card-hadlakat',      get_friday_hadlakat_card_inner_html());
    set_element_html_fn('friday-prayer-card-mincha-kabalat',get_friday_mincha_kabalat_card_inner_html());
}

// ─── Shabbat single-page card builders ───────────────────────────────────────

export function get_shabat_after_shacharit_timeline_cards_row_html() {
    var col = 'flex min-w-0 flex-col items-center gap-0.5';
    return (
        '<div class="flex min-w-0 flex-wrap gap-2 sm:gap-3" aria-label="אחרי שחרית — ציר זמן">' +
        '<div id="shabat-card-kidush-shiur" class="' + SHABAT_DAY_CARD_SHELL + '">' +
        tz_shabat_centered_card_body_html('kidush', 'קידוש ושיעור', undefined, tz_icon_kiddush_cup_svg()) +
        '</div>' +
        '<div id="shabat-card-tfilat-yeladim" class="' + SHABAT_DAY_CARD_SHELL + '">' +
        tz_shabat_centered_card_body_html('shabat-tfilat-yeladim-time', 'תפילת ילדים', undefined, tz_icon_child_svg()) +
        '</div>' +
        '<div id="shabat-card-parents" class="' + SHABAT_DAY_CARD_SHELL + '">' +
        '<div class="parents-and-children hidden-element flex w-full min-h-0 flex-1 flex-col self-stretch">' +
        tz_tfilot_grouped_time_strip_center_html_beside_icon(
            tz_tfilot_grouped_time_column_html({
                wrapperClass: 'flex min-w-0 flex-col items-center gap-0.5',
                timeText: '', timeId: 'shabat-parents-time',
                captionHtml: tz_tf_cap_standalone_html('הורים וילדים'),
            }),
            tz_icon_people_svg()
        ) +
        '</div></div>' +
        '<div id="shabat-card-maayan" class="' + SHABAT_DAY_CARD_SHELL + '">' +
        tz_shabat_centered_card_body_html('lesson-halacha', 'מעיינים בחבורה', undefined, tz_icon_book_open_svg()) +
        '</div>' +
        '</div>'
    );
}

export function get_shabat_afternoon_horizontal_cards_html() {
    var col = 'flex min-w-0 flex-col items-center gap-0.5';
    return (
        '<div class="flex min-w-0 flex-wrap gap-2 sm:gap-3" aria-label="אחר הצהריים">' +
        '<div id="shabat-card-afternoon-tehilim" class="' + SHABAT_DAY_CARD_SHELL + '">' +
        tz_shabat_centered_card_body_html('tehilim', 'תהלים לילדים בגן השמחה', 'tehilim ' + col, tz_icon_scroll_svg()) +
        '</div>' +
        '<div id="shabat-card-afternoon-shiur" class="' + SHABAT_DAY_CARD_SHELL + '">' +
        tz_shabat_centered_card_body_html('shiur-pirkei-avot', 'שיעור בפרקי אבות', 'shiur-pirkei-avot ' + col, tz_icon_book_open_svg()) +
        '</div>' +
        '<div id="shabat-card-afternoon-arvit" class="' + SHABAT_DAY_CARD_SHELL + ' arvit-shabat">' +
        tz_shabat_centered_card_body_html('arvit-shabat', 'צאת השבת וערבית', 'arvit-shabat ' + col, tz_icon_moon_svg()) +
        '</div>' +
        '<div id="shabat-card-afternoon-arvit-2" class="' + SHABAT_DAY_CARD_SHELL + ' arvit-shabat-2">' +
        tz_shabat_centered_card_body_html('arvit-shabat-2', 'ערבית ב', 'arvit-shabat-2 ' + col) +
        '</div>' +
        '</div>'
    );
}

// ─── Shavuot single-page card builders ───────────────────────────────────────

export function get_shavuot_eve_cards_html() {
    var cards = [
        { timeId: 'shavuot-mincha-gedola-eve', caption: 'מנחה גדולה',     icon: '' },
        { timeId: 'shavuot-chag-in',           caption: 'כניסת החג',       icon: '' },
        { timeId: 'shavuot-mincha-eve', caption: 'מנחה ודבר תורה',
          captionId: 'shavuot-mincha-eve-caption', icon: '' },
        { timeId: 'shavuot-maariv-chag', caption: 'ערבית של חג',
          icon: tz_icon_moon_svg(),
          shell: 'tz-glass-card shavuot-eve-maariv-card flex min-w-0 flex-none flex-col items-center justify-center gap-2 rounded-xl border-r-8 border-primary p-3 text-center shadow-glass sm:gap-2.5 sm:p-4',
          cardId: 'shavuot-eve-maariv-card' },
    ];
    return cards.map(function(c) {
        var shell = c.shell || SHABAT_DAY_CARD_SHELL;
        var idAttr = c.cardId ? ' id="' + c.cardId + '"' : '';
        return '<div' + idAttr + ' class="' + shell + '">' +
            tz_shabat_centered_card_body_html(c.timeId, c.caption, undefined, c.icon, c.captionId) +
            '</div>';
    }).join('');
}

export function get_shavuot_shacharit_grouped_card_inner_html() {
    return tz_tfilot_grouped_prayer_row_html(
        'שחרית',
        [
            tz_tfilot_grouped_time_column_html({
                wrapperClass: 'flex min-w-0 flex-1 basis-0 max-w-[6.5rem] flex-col items-center gap-0.5 sm:max-w-[7.25rem]',
                timeText: '04:55', captionText: 'ברכות השחר ומגילת רות', captionMaxClass: TZ_TF_CAP_MD,
            }),
            tz_tfilot_grouped_time_column_html({ timeText: '05:10', captionText: 'שחרית' }),
            tz_tfilot_grouped_time_column_html({ timeText: '08:30', captionText: 'שחרית ב' }),
        ].join(''),
        tz_icon_sun_svg()
    );
}

export function get_shavuot_mincha_grouped_card_inner_html() {
    return tz_tfilot_grouped_prayer_row_html(
        'מנחה',
        [
            tz_tfilot_grouped_time_column_html({ timeText: '13:15', captionText: 'מנחה גדולה', captionMaxClass: TZ_TF_CAP_TIGHT }),
            tz_tfilot_grouped_time_column_html({ timeText: '14:00', captionText: 'מנחה גדולה', captionMaxClass: TZ_TF_CAP_TIGHT }),
            tz_tfilot_grouped_time_column_html({ timeText: '', timeId: 'shavuot-mincha-ktana', captionText: 'מנחה קטנה', captionMaxClass: TZ_TF_CAP_TIGHT }),
        ].join(''),
        ''
    );
}

export function get_shavuot_day_prayer_cards_html() {
    return (
        '<div class="' + SHAVUOT_COMPACT_TF_CARD_SHELL + '">' +
        get_shavuot_shacharit_grouped_card_inner_html() + '</div>' +
        '<div class="' + SHAVUOT_COMPACT_TF_CARD_SHELL + '">' +
        get_shavuot_mincha_grouped_card_inner_html() + '</div>'
    );
}

export function get_shavuot_afternoon_horizontal_cards_html() {
    var kabbalatCaption = tz_tf_cap_standalone_two_lines_html('', 'shavuot-kabbalat-yeladim-caption', 'קבלת עול מלכות שמים לילדים', 'והצגה בגן השמחה');
    var rutShiurCaption = tz_tf_cap_standalone_two_lines_html('', 'shavuot-shiur-rut-caption', 'שיעור בנושא', 'מגילת רות');
    return (
        '<div class="flex min-w-0 flex-wrap items-stretch gap-2 sm:gap-3" aria-label="אחר הצהריים">' +
        '<div id="shavuot-card-kabbalat-yeladim" class="' + SHAVUOT_KABALAT_YELADIM_CARD_SHELL + '">' +
        tz_shabat_centered_card_body_html('shavuot-kabbalat-yeladim', '', undefined, tz_icon_child_svg(), undefined, kabbalatCaption) +
        '</div>' +
        '<div id="shavuot-card-shiur-rut" class="' + SHABAT_DAY_CARD_SHELL + '">' +
        tz_shabat_centered_card_body_html('shavuot-shiur-rut', '', undefined, '', undefined, rutShiurCaption) +
        '</div>' +
        '</div>'
    );
}

/** Footer marquee: scrolling shiurim list for Shavuot night. */
export function get_shavuot_shiurim_footer_marquee_html() {
    var shiurim = [
        ['22:45', 'הרב נחום דרוקמן'],
        ['23:40', 'נחום שור'],
        ['00:35', 'חנניה דיטשר'],
        ['01:30', 'ברוך קורצוויל'],
        ['02:25', 'יניב דר'],
        ['03:20', 'הרב גבאי'],
        ['04:10', 'איציק וולף'],
    ];
    var parts = shiurim.map(function(s) {
        return (
            '<span class="shavuot-shiurim-item">' +
            '<span class="shavuot-shiurim-time font-display-time tabular-nums">' + s[0] + '</span>' +
            '<span class="shavuot-shiurim-name font-display-time">' + s[1] + '</span>' +
            '</span>'
        );
    });
    var line = '<span class="shavuot-shiurim-line" dir="rtl">' + parts.join('') + '</span>';
    return (
        '<div class="shavuot-shiurim-marquee-track" dir="rtl">' + line +
        line.replace('shavuot-shiurim-line', 'shavuot-shiurim-line shavuot-shiurim-line--clone') +
        '</div>'
    );
}
