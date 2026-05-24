'esversion: 8';

/**
 * holiday-rules.js
 *
 * Predicate functions: is_*(date) → boolean.
 * All date ranges are imported from holiday-dates.js — no literals here.
 *
 * These functions only depend on the date argument and DATES constants.
 * Functions that need runtime data (day_times, shabat_times) stay in present-next-page.js.
 */

import { DATES } from './holiday-dates.js';

// ─── Core date/time utilities ─────────────────────────────────────────────────

export function is_between_dates(date, start_date, end_date) {
    var result = true;
    if (start_date) { result = date >= new Date(start_date); }
    if (end_date)   { result = result && date <= new Date(end_date); }
    return result;
}

export function is_in_weekdays(date, weekdays) {
    return weekdays.includes(date.getDay());
}

/** Returns true if date's wall-clock time is after HH:MM (+ optional offset minutes). */
export function is_after_time(date, time, plus_minutes) {
    var date_time = new Date(date);
    var parts = time.split(':');
    if (plus_minutes) { parts[1] = parseInt(parts[1]) + plus_minutes; }
    date_time.setHours(parts[0], parts[1], '00');
    return date > date_time;
}

/** Returns true if date's wall-clock time is before HH:MM. */
export function is_before_time(date, time) {
    var date_time = new Date(date);
    var parts = time.split(':');
    date_time.setHours(parts[0], parts[1], '00');
    return date < date_time;
}

// ─── Year-round state ─────────────────────────────────────────────────────────

export function is_war(date) {
    return is_between_dates(date, DATES.WAR_SPECIAL_TIMES.start, DATES.WAR_SPECIAL_TIMES.end);
}

export function is_big_vacation(date) {
    var month = date.getMonth();
    return month === 6 || month === 7;  /* July (6) and August (7) */
}

export function is_sukot_vacation(date) {
    return is_between_dates(date, DATES.SUKOT_VACATION.start, DATES.SUKOT_VACATION.end);
}

export function is_pesach_vacation(date) {
    return is_between_dates(date, DATES.PESACH_VACATION.start, DATES.PESACH_VACATION.end);
}

export function is_minyan_plag_active(date) {
    return is_between_dates(date, DATES.MINYAN_PLAG_ACTIVE.start, DATES.MINYAN_PLAG_ACTIVE.end);
}

export function is_weekend(date) {
    return is_in_weekdays(date, [5]) || (is_in_weekdays(date, [6]) && is_before_time(date, '16:00'));
}

// ─── Shacharit / Mincha schedule adjustments ──────────────────────────────────

/** Returns true when 8:30 shacharit should be shown (currently always true). */
export function is_shacharit_8_30(date) {
    return is_war(date) || is_big_vacation(date) || is_sukot_vacation(date)
        || is_hanuka(date) || is_pesach_vacation(date);
}

export function is_mincha_13_30(date) {
    return is_big_vacation(date) || is_pesach_vacation(date) || is_war(date);
}

// ─── Fast days ────────────────────────────────────────────────────────────────

export function is_show_taanit(date) {
    return is_between_dates(date, DATES.TAANIT_ESTHER_SHOW.start, DATES.TAANIT_ESTHER_SHOW.end);
}

export function is_taanit(date) {
    return is_between_dates(date, DATES.TAANIT_ESTHER.start, DATES.TAANIT_ESTHER.end);
}

export function is_tisha_beav_eve(date) {
    /* Note: TISHA_BEAV.start is the previous evening (after sunset = eve of the fast). */
    return is_between_dates(date, DATES.TISHA_BEAV.start, DATES.TISHA_BEAV.start);
}

export function is_tisha_beav(date) {
    return is_between_dates(date, DATES.TISHA_BEAV.start, DATES.TISHA_BEAV.end);
}

export function is_shabat_chazon(date) {
    return is_between_dates(date, DATES.SHABAT_CHAZON.start, DATES.SHABAT_CHAZON.end);
}

// ─── Slichot ──────────────────────────────────────────────────────────────────

export function is_slihot_days(date) {
    return is_between_dates(date, DATES.SLICHOT_DAYS.start, DATES.SLICHOT_DAYS.end);
}

// ─── Chanuka ──────────────────────────────────────────────────────────────────

export function is_hanuka(date) {
    return is_between_dates(date, DATES.HANUKA.start, DATES.HANUKA.end);
}

// ─── Purim ────────────────────────────────────────────────────────────────────

export function is_purim(date) {
    return is_between_dates(date, DATES.PURIM.start, DATES.PURIM.end);
}

export function is_show_megila(date) {
    return is_between_dates(date, DATES.SHOW_MEGILA.start, DATES.SHOW_MEGILA.end);
}

export function is_shabat_zachor(date) {
    return is_between_dates(date, DATES.SHABAT_ZACHOR.start, DATES.SHABAT_ZACHOR.end);
}

// ─── Pesach ───────────────────────────────────────────────────────────────────

export function is_present_pesach_eve(date) {
    return is_between_dates(date, DATES.PESACH_EVE_SHOW.start, DATES.PESACH_EVE_SHOW.end);
}

export function is_pesach_eve(date) {
    return is_between_dates(date, DATES.PESACH_EVE.start, DATES.PESACH_EVE.end);
}

export function is_pesach_first_chag(date) {
    return is_between_dates(date, DATES.PESACH_FIRST_CHAG.start, DATES.PESACH_FIRST_CHAG.end);
}

export function is_pesach_7_eve(date) {
    return is_between_dates(date, DATES.PESACH_7_EVE.start, DATES.PESACH_7_EVE.end);
}

export function is_pesach_7(date) {
    return is_between_dates(date, DATES.PESACH_7.start, DATES.PESACH_7.end);
}

export function is_shabat_hagadol_tashpa(date) {
    return is_between_dates(date, DATES.SHABAT_HAGADOL.start, DATES.SHABAT_HAGADOL.end);
}

// ─── Yom HaZikaron / Atzmaut ──────────────────────────────────────────────────

export function is_present_memorial_day(date) {
    return is_between_dates(date, DATES.MEMORIAL_DAY_SHOW.start, DATES.MEMORIAL_DAY_SHOW.end);
}

export function is_present_atzmaut(date) {
    return is_between_dates(date, DATES.ATZMAUT_SHOW.start, DATES.ATZMAUT_SHOW.end);
}

// ─── Shavuot ──────────────────────────────────────────────────────────────────

export function is_shavout(date) {
    return is_between_dates(date, DATES.SHAVUOT.start, DATES.SHAVUOT.end);
}

export function is_shabat_eve_chag(date) {
    return is_between_dates(date, DATES.SHABAT_EVE_CHAG.start, DATES.SHABAT_EVE_CHAG.end);
}

// ─── Rosh Hashana ─────────────────────────────────────────────────────────────

export function is_show_rosh_hashana_eve(date) {
    return is_between_dates(date, DATES.SHOW_ROSH_HASHANA_EVE.start, DATES.SHOW_ROSH_HASHANA_EVE.end);
}

export function is_rosh_hashana_eve(date) {
    return is_between_dates(date, DATES.ROSH_HASHANA_EVE.start, DATES.ROSH_HASHANA_EVE.end);
}

export function is_rosh_hashana(date) {
    return is_between_dates(date, DATES.ROSH_HASHANA_A.start, DATES.ROSH_HASHANA_A.end);
}

export function is_rosh_hashana_b(date) {
    return is_between_dates(date, DATES.ROSH_HASHANA_B.start, DATES.ROSH_HASHANA_B.end);
}

export function is_gedalia(date) {
    return is_between_dates(date, DATES.GEDALIA.start, DATES.GEDALIA.end);
}

// ─── Yom Kippur ───────────────────────────────────────────────────────────────

export function is_show_kipur_eve(date) {
    return is_between_dates(date, DATES.SHOW_KIPUR_EVE.start, DATES.SHOW_KIPUR_EVE.end);
}

export function is_kipur_eve(date) {
    return is_between_dates(date, DATES.KIPUR_EVE.start, DATES.KIPUR_EVE.end);
}

export function is_kipur(date) {
    return is_between_dates(date, DATES.KIPUR.start, DATES.KIPUR.end);
}

// ─── Sukkot / Simchat Torah ───────────────────────────────────────────────────

export function is_sukot_eve(date) {
    return is_between_dates(date, DATES.SUKOT_EVE.start, DATES.SUKOT_EVE.end);
}

export function is_sukot(date) {
    return is_between_dates(date, DATES.SUKOT.start, DATES.SUKOT.end);
}

export function is_present_simchat_tora_eve(date) {
    return is_between_dates(date, DATES.SIMCHAT_TORA_EVE_SHOW.start, DATES.SIMCHAT_TORA_EVE_SHOW.end);
}

export function is_simchat_tora_eve(date) {
    return is_between_dates(date, DATES.SIMCHAT_TORA_EVE.start, DATES.SIMCHAT_TORA_EVE.end);
}

export function is_simchat_tora(date) {
    return is_between_dates(date, DATES.SIMCHAT_TORA.start, DATES.SIMCHAT_TORA.end);
}

export function is_present_hakafot_single_page(date) {
    return is_between_dates(date, DATES.HAKAFOT_SINGLE_PAGE.start, DATES.HAKAFOT_SINGLE_PAGE.end);
}

// ─── 10 Tevet ─────────────────────────────────────────────────────────────────

export function is_10_tevet_friday(date) {
    return is_between_dates(date, DATES.TEN_TEVET_FRIDAY.start, DATES.TEN_TEVET_FRIDAY.end);
}

// ─── Slichot season ───────────────────────────────────────────────────────────

export function is_slichot_season(date) {
    return is_slihot_days(date);
}
