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

    MINYAN_PLAG_ACTIVE:      { start: '2026-04-10T00:00',    end: '2026-09-10T23:00'    },

    MEMORIAL_DAY_SHOW:       { start: '2026-04-21T01:00',    end: '2026-04-21T22:00'    },
    ATZMAUT_SHOW:            { start: '2026-04-21T01:00',    end: '2026-04-22T20:00'    },

    SHAVUOT_EVE:             { start: '2026-05-21T01:00',    end: '2026-05-21T19:00'    },
    SHAVUOT:                 { start: '2026-05-21T01:00',    end: '2026-05-22T19:00'    },
    SHABAT_EVE_CHAG:         { start: '2026-05-22T19:00',    end: '2026-05-23T21:00'    },

    // ─── תשפ"ה  (2024-2025) ───────────────────────────────────────────────

    TEN_TEVET_FRIDAY:        { start: '2025-01-09T11:00',    end: '2025-01-10T19:00'    },

    PESACH_VACATION:         { start: '2025-04-05T23:00',    end: '2025-04-20T12:00'    },
    SHABAT_HAGADOL:          { start: '2025-04-11T17:00',    end: '2025-04-12T17:00'    },

    TISHA_BEAV:              { start: '2025-08-02T20:00',    end: '2025-08-03T20:30'    },
    SHABAT_CHAZON:           { start: '2025-08-01T19:00',    end: '2025-08-02T20:00'    },
    SLICHOT_DAYS:            { start: '2025-08-26T00:00',    end: '2025-09-30T23:00'    },

    SHOW_ROSH_HASHANA_EVE:   { start: '2025-09-21T00:01',    end: '2025-09-21T23:00'    },
    ROSH_HASHANA_EVE:        { start: '2025-09-22T00:01',    end: '2025-09-23T02:00'    },
    ROSH_HASHANA_A:          { start: '2025-09-23T02:01',    end: '2025-09-24T02:00'    },
    ROSH_HASHANA_B:          { start: '2025-09-24T02:01',    end: '2025-09-24T19:00'    },
    GEDALIA:                 { start: '2025-09-25T02:00',    end: '2025-09-25T23:00'    },

    SHOW_KIPUR_EVE:          { start: '2025-09-30T02:00',    end: '2025-10-01T10:00'    },
    KIPUR_EVE:               { start: '2025-10-01T02:00',    end: '2025-10-01T22:00'    },
    KIPUR:                   { start: '2025-10-01T18:00',    end: '2025-10-02T19:00'    },

    SUKOT_VACATION:          { start: '2025-10-04',          end: '2025-10-15'          },
    SUKOT_EVE:               { start: '2025-10-05T19:00',    end: '2025-10-06T14:00'    },
    SUKOT:                   { start: '2025-10-06T14:01',    end: '2025-10-07T19:20'    },

    SIMCHAT_TORA_EVE_SHOW:   { start: '2025-10-12T10:00',    end: '2025-10-12T23:59'    },
    SIMCHAT_TORA_EVE:        { start: '2025-10-13T00:01',    end: '2025-10-13T23:59'    },
    SIMCHAT_TORA:            { start: '2025-10-14T00:01',    end: '2025-10-14T19:00'    },
    HAKAFOT_SINGLE_PAGE:     { start: '2025-10-14T00:01',    end: '2025-10-14T13:15'    },

    HANUKA:                  { start: '2025-12-14T16:55',    end: '2025-12-22T16:40'    },
};
