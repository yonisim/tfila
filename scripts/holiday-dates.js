'esversion: 8';

/**
 * holiday-dates.js
 *
 * Single source of truth for all holiday date ranges.
 * Update this file at the start of each year — no other file needs to change for dates.
 *
 * Convention: { start, end } strings are ISO-8601 and fed directly to new Date().
 * Times without a clock component (e.g. '2025-10-04') are treated as midnight local time.
 */

export const DATES = {

    // ─── תשפ"ו  (2025-2026) ───────────────────────────────────────────────

    WAR_SPECIAL_TIMES:       { start: '2026-03-01',          end: '2026-04-10'          },

    SHABAT_ZACHOR:           { start: '2026-02-27T16:00',    end: '2026-02-28T17:00'    },
    TAANIT_ESTHER_SHOW:      { start: '2026-03-01T17:00',    end: '2026-03-02T18:00'    },
    TAANIT_ESTHER:           { start: '2026-03-01T20:00',    end: '2026-03-02T18:00'    },
    PURIM:                   { start: '2026-03-02T13:00',    end: '2026-03-03T20:00'    },
    SHOW_MEGILA:             { start: '2026-03-02T13:00',    end: '2026-03-03T12:00'    },

    PESACH_EVE_SHOW:         { start: '2026-03-30T01:00',    end: '2026-03-31T22:00'    },
    PESACH_EVE:              { start: '2026-04-01T01:00',    end: '2026-04-01T17:00'    },
    PESACH_FIRST_CHAG:       { start: '2026-04-01T17:00',    end: '2026-04-02T20:00'    },
    PESACH_7_EVE:            { start: '2026-04-06T21:00',    end: '2026-04-07T17:00'    },
    PESACH_7:                { start: '2026-04-07T17:00',    end: '2026-04-08T20:00'    },

    MINYAN_PLAG_ACTIVE:      { start: '2026-04-10T00:00',    end: '2026-09-02T23:00'    },

    MEMORIAL_DAY_SHOW:       { start: '2026-04-21T01:00',    end: '2026-04-21T22:00'    },
    ATZMAUT_SHOW:            { start: '2026-04-21T01:00',    end: '2026-04-22T20:00'    },

    SHAVUOT_EVE:             { start: '2026-05-21T01:00',    end: '2026-05-21T19:00'    },
    SHAVUOT:                 { start: '2026-05-21T01:00',    end: '2026-05-22T19:00'    },
    SHABAT_EVE_CHAG:         { start: '2026-05-22T19:00',    end: '2026-05-23T21:00'    },

    // ─── תשפ"ה  (2024-2025) ───────────────────────────────────────────────

    TEN_TEVET_FRIDAY:        { start: '2025-01-09T11:00',    end: '2025-01-10T19:00'    },

    PESACH_VACATION:         { start: '2025-04-05T23:00',    end: '2025-04-20T12:00'    },
    SHABAT_HAGADOL:          { start: '2025-04-11T17:00',    end: '2025-04-12T17:00'    },

    /* פרקי אבות season — the weeks the Shabbat afternoon שיעור בפרקי אבות runs.
       Both ends carry a clock component on purpose: a bare '2026-05-10' parses as
       UTC midnight, i.e. 03:00 local in summer, which would drop the first hours
       of the first day. The 23:59 end makes the last day count in full. */
    PIRKEI_AVOT_SEASON:      { start: '2026-05-10T00:00',    end: '2026-09-13T23:59'    },

    TISHA_BEAV_EVE_PRE:      { start: '2026-07-21T17:00',    end: '2026-07-22T17:00'    },
    TISHA_BEAV_EVE:          { start: '2026-07-22T17:00',    end: '2026-07-22T22:00'    },
    TISHA_BEAV:              { start: '2026-07-22T22:00',    end: '2026-07-23T20:30'    },
    SHABAT_CHAZON:           { start: '2025-08-01T19:00',    end: '2025-08-02T20:00'    },
    SIFTEI_RENANOT:          { start: '2026-08-13T19:00',    end: '2026-09-21T19:00'    },
    SLICHOT_DAYS:            { start: '2026-09-06T16:00',    end: '2026-09-19T23:00'    },
    TSHUVA_DAYS:             { start: '2026-09-14T00:00',    end: '2026-09-21T19:00'    },

    SHOW_ROSH_HASHANA_EVE:   { start: '2026-09-10T12:01',    end: '2026-09-11T23:00'    },
    ROSH_HASHANA_EVE:        { start: '2026-09-11T00:01',    end: '2026-09-12T02:00'    },
    ROSH_HASHANA_A:          { start: '2026-09-12T02:01',    end: '2026-09-13T02:00'    },
    ROSH_HASHANA_B:          { start: '2026-09-13T02:01',    end: '2026-09-13T19:00'    },
    GEDALIA:                 { start: '2026-09-14T02:00',    end: '2026-09-14T23:00'    },

    SHOW_KIPUR_EVE:          { start: '2026-09-19T19:15',    end: '2026-09-20T12:00'    },
    KIPUR_EVE:               { start: '2026-09-19T19:20',    end: '2026-09-20T18:00'    },
    KIPUR:                   { start: '2026-09-20T18:00',    end: '2026-09-21T19:30'    },

    SUKOT_VACATION:          { start: '2026-09-21T19:30',          end: '2026-10-04'          },
    SUKOT_EVE:               { start: '2026-09-24T19:00',    end: '2026-09-25T14:00'    },
    SUKOT:                   { start: '2026-09-25T14:01',    end: '2026-09-26T19:20'    },

    SIMCHAT_TORA_EVE_SHOW:   { start: '2026-10-02T10:00',    end: '2026-10-02T23:59'    },
    SIMCHAT_TORA_EVE:        { start: '2026-10-02T00:01',    end: '2026-10-02T23:59'    },
    SIMCHAT_TORA:            { start: '2026-10-03T00:01',    end: '2026-10-04T19:00'    },
    HAKAFOT_SINGLE_PAGE:     { start: '2026-10-14T00:01',    end: '2026-10-04T13:15'    },

    HANUKA:                  { start: '2025-12-14T16:55',    end: '2025-12-22T16:40'    },
};
