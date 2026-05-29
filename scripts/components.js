'esversion: 8';

/**
 * components.js — Tfila UI component library
 *
 * Pure functions: each receives an options object and returns an HTML string.
 * No DOM access, no side effects.  Import from any JS file that builds markup.
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  COMPONENTS                                                           │
 * │                                                                       │
 * │  tz_time(opts)          Big time digit     "07:30"                    │
 * │  tz_label(opts)         Small caption      "שחרית א"                 │
 * │  tz_time_column(opts)   Time + label       stacked vertically         │
 * │  tz_card(opts)          Glass card shell   rounded, gold-border       │
 * │  tz_time_card(opts)     ★ shorthand: card + time + label in one call  │
 * │  tz_card_row(opts)      Flex row wrapper for a group of cards         │
 * │                                                                       │
 * │  tz_date_panel(opts)    Hebrew date strip  top-right pill              │
 * │  tz_clock_hud(opts)     DS-DIGI clock      top-left circle            │
 * │  tz_hero_hud(opts)      ★ shorthand: date panel + clock in one call   │
 * │                                                                       │
 * │  weekdays_slide_theme / friday_slide_theme / shabat_slide_theme       │
 * │                         Per-slide font-size themes { standalone, list }│
 * │                                                                       │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * ─── SIZE SCALE ─────────────────────────────────────────────────────────
 *  Pass as  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 *
 *   'xs'  — very compact  (tiny text, minimal padding)
 *   'sm'  — small         (compact-mode sizing)
 *   'md'  — default
 *   'lg'  — large         (prominent hero times)
 *   'xl'  — extra large   (clock-level digits)
 *
 * ─── PER-INSTANCE COLOR / SPACING OVERRIDES ─────────────────────────────
 *  Pass as  style: 'CSS prop: value; ...'  or as dedicated option props.
 *  The CSS layer reads these custom properties:
 *
 *   --tz-time-color        override time digit colour  (default: cream)
 *   --tz-time-shadow       override time glow shadow
 *   --tz-label-color       override label colour       (default: cream)
 *   --tz-label-max-w       override label max-width    (default: 5.5rem)
 *   --tz-card-accent       override right-border colour (default: gold)
 *
 * ─── USAGE EXAMPLE ──────────────────────────────────────────────────────
 *
 *   import { tz_card, tz_time_column } from './components.js';
 *
 *   // A centred card with a large glowing time and a nowrap caption
 *   tz_card({
 *     id:       'hadlakat-nerot-card',
 *     layout:   'column-center',
 *     size:     'md',
 *     flex:     'grow',
 *     children: tz_time_column({
 *       time:  { id: 'hadlakat-nerot', size: 'lg' },
 *       label: { text: 'הדלקת נרות', wrap: 'nowrap' },
 *     }),
 *   })
 *
 *   // Override the accent border to teal for a special card
 *   tz_card({
 *     accentColor: 'var(--color-teal-border)',
 *     children: ...,
 *   })
 */


// ─── Internal helpers ──────────────────────────────────────────────────────────

/** Build a `style="..."` attribute string from an array of 'prop:value' segments. */
function _style_attr(parts) {
    var filtered = (parts || []).filter(Boolean);
    return filtered.length ? ' style="' + filtered.join(';') + '"' : '';
}

/** Build a `data-size="..."` attribute when size is not the default. */
function _size_attr(size, defaultSize) {
    return (size && size !== defaultSize) ? ' data-size="' + size + '"' : '';
}


// ─── tz_date_panel ────────────────────────────────────────────────────────────

/**
 * Hebrew date pill — navy rounded panel shown in the top-right corner of every
 * hero slide.  Runtime JS fills the inner element via its id.
 *
 * @param {object} opts
 * @param {string} [opts.id='tz_hebrew_date']  Element id for the date text (runtime target)
 * @param {string} [opts.text='']              Initial text content (usually left empty)
 * @returns {string} HTML string
 */
export function tz_date_panel({ id = 'tz_hebrew_date', text = '' } = {}) {
    return (
        '<div class="tfilot-dates-strip pointer-events-none absolute right-0 top-0 z-10' +
        ' flex max-w-[min(100%,22rem)] flex-wrap items-start justify-end' +
        ' px-container-padding pb-1 pt-3 sm:pt-4" dir="rtl">' +
        '<div class="header-hebrew-panel pointer-events-auto min-w-0 shrink-0">' +
        '<div' + (id ? ' id="' + id + '"' : '') + ' class="header-text">' + text + '</div>' +
        '</div>' +
        '</div>'
    );
}


// ─── tz_clock_hud ─────────────────────────────────────────────────────────────

/**
 * DS-DIGI clock circle — the circular clock shown in the top-left corner of
 * every hero slide.  Runtime JS writes the time digits via class selectors.
 *
 * @returns {string} HTML string
 */
export function tz_clock_hud() {
    return (
        '<div class="header-hebrew-panel tfilot-hero-clock tfilot-clock-corner pointer-events-none">' +
        '<div class="clock pointer-events-auto" dir="ltr">' +
        '<span class="clock-text hour">00</span>' +
        '<b class="clock-text colon">:</b>' +
        '<span class="clock-text min">00</span>' +
        '<b class="clock-text colon">:</b>' +
        '<span class="clock-text second">00</span>' +
        '</div>' +
        '</div>'
    );
}


// ─── tz_hero_hud ──────────────────────────────────────────────────────────────

/**
 * Hero slide HUD: Hebrew date strip + DS-DIGI clock.
 * Shorthand for tz_date_panel() + tz_clock_hud().
 * Identical across all hero slides (tfilot, friday, shabat, shavuot).
 *
 * Inject as the first children of the page-wrapper div via
 * insert_html_at_start_of_element(page_id, tz_hero_hud()).
 *
 * @param {object} opts
 * @param {string} [opts.dateId='tz_hebrew_date']  Element id for the date text
 * @returns {string} HTML string (two sibling block elements)
 */
export function tz_hero_hud({ dateId = 'tz_hebrew_date' } = {}) {
    return tz_date_panel({ id: dateId }) + tz_clock_hud();
}


// ─── tz_time ──────────────────────────────────────────────────────────────────

/**
 * Large time-digit span.
 *
 * @param {object} opts
 * @param {string}  [opts.text='']          Display text, e.g. '07:30'
 * @param {string}  [opts.id]               Element id (for runtime JS updates)
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [opts.size='md']  Size variant
 * @param {boolean} [opts.glow=true]        Add the tz-time-glow shadow class
 * @param {string}  [opts.color]            CSS colour value → sets --tz-time-color
 * @param {string}  [opts.style]            Extra inline styles (raw CSS string)
 * @returns {string} HTML string
 */
export function tz_time({ text = '', id, size = 'md', glow = true, color, style } = {}) {
    var glowClass = glow ? ' tz-time-glow' : '';
    var styles = [];
    if (color) { styles.push('--tz-time-color:' + color); }
    if (style) { styles.push(style); }
    return (
        '<span class="tz-time' + glowClass + '"' +
        (id ? ' id="' + id + '"' : '') +
        _size_attr(size, 'md') +
        _style_attr(styles) + '>' +
        text + '</span>'
    );
}


// ─── tz_label ─────────────────────────────────────────────────────────────────

/**
 * Small caption / label span — usually placed directly below a time digit.
 *
 * @param {object} opts
 * @param {string}  [opts.text='']          Display text
 * @param {string}  [opts.id]               Element id
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [opts.size='xs']  Size variant
 * @param {'normal'|'nowrap'|'tight'} [opts.wrap='normal']  Wrapping behaviour
 *          'normal' — wraps at max-width (default 5.5 rem)
 *          'nowrap' — never wraps, max-width ignored
 *          'tight'  — wraps sooner (~5 rem)
 * @param {string}  [opts.maxWidth]         Override max-width, e.g. '6rem'
 * @param {string}  [opts.color]            CSS colour value → sets --tz-label-color
 * @param {string}  [opts.style]            Extra inline styles
 * @returns {string} HTML string
 */
export function tz_label({ text = '', id, size = 'xs', wrap = 'normal', maxWidth, color, style } = {}) {
    var styles = [];
    if (maxWidth) { styles.push('--tz-label-max-w:' + maxWidth); }
    if (color)    { styles.push('--tz-label-color:' + color); }
    if (style)    { styles.push(style); }
    return (
        '<span class="tz-label"' +
        (id ? ' id="' + id + '"' : '') +
        _size_attr(size, 'xs') +
        (wrap !== 'normal' ? ' data-wrap="' + wrap + '"' : '') +
        _style_attr(styles) + '>' +
        text + '</span>'
    );
}


// ─── tz_time_column ───────────────────────────────────────────────────────────

/**
 * Vertical stack of one time digit + one label, optionally centred.
 *
 * Either pass options objects for time/label (they are forwarded to tz_time /
 * tz_label), or pass pre-built HTML strings.
 *
 * @param {object} opts
 * @param {object|string} [opts.time={}]       tz_time options or raw HTML string
 * @param {object|string} [opts.label={}]      tz_label options or raw HTML string
 * @param {'sm'|'md'}     [opts.gap='md']      Gap between time and label
 *          'sm' → gap-0     'md' → gap-0.5
 * @param {'center'|'start'} [opts.align='center']  Horizontal alignment
 * @param {string}        [opts.extraClass]    Extra classes on the wrapper div
 * @returns {string} HTML string
 */
export function tz_time_column({ time = {}, label = {}, gap = 'md', align = 'center', extraClass } = {}) {
    var timePart  = typeof time  === 'string' ? time  : tz_time(time);
    var labelPart = typeof label === 'string' ? label : tz_label(label);
    var gapClass   = gap === 'sm' ? 'gap-0' : 'gap-0.5';
    var alignClass = align === 'start' ? 'items-start' : 'items-center';
    var extra = extraClass ? ' ' + extraClass : '';
    return (
        '<div class="flex min-w-0 flex-col ' + alignClass + ' ' + gapClass + extra + '">' +
        timePart + labelPart +
        '</div>'
    );
}


// ─── tz_card ──────────────────────────────────────────────────────────────────

/**
 * Glass card shell — the dark-gold rounded card used throughout all pages.
 *
 * Layout, size, flex behaviour, and accent colour are all controllable without
 * touching class strings.  The card always uses the `.tz-glass-card` CSS class
 * so all theme overrides (compact mode, etc.) continue to work automatically.
 *
 * @param {object} opts
 * @param {string} [opts.id]
 *        Element id.
 *
 * @param {string} [opts.children='']
 *        Inner HTML string.
 *
 * @param {'column'|'row'|'column-center'} [opts.layout='column']
 *        Flex direction + alignment:
 *          'column'        → flex-col (items aligned start)
 *          'column-center' → flex-col items-center justify-center text-center
 *          'row'           → flex-row items-center
 *
 * @param {'xs'|'sm'|'md'|'lg'} [opts.size='md']
 *        Padding size via data-size attribute (defined in tailwind-input.css):
 *          'xs' ~0.38 rem   'sm' ~0.62 rem   'md' ~0.75 rem   'lg' ~1 rem
 *
 * @param {'grow'|'shrink'|'none'} [opts.flex='none']
 *        How the card participates in a flex container:
 *          'grow'   → flex-1 basis-0 min-w-0  (fills available space equally)
 *          'shrink' → flex-none min-w-0        (only as wide as its content)
 *          'none'   → min-w-0                  (normal flow, no flex override)
 *
 * @param {boolean} [opts.accentBorder=true]
 *        Show the right-side gold accent border (border-r-8 border-primary).
 *
 * @param {string} [opts.accentColor]
 *        CSS colour value for the right border, e.g. 'var(--color-teal-border)'.
 *        Sets the --tz-card-accent custom property on the element.
 *
 * @param {string} [opts.extraClass]
 *        Any additional CSS classes appended verbatim.
 *
 * @param {string} [opts.style]
 *        Extra inline style string (appended after accent color if set).
 *
 * @returns {string} HTML string
 *
 * @example
 * // A centred grow-card with a large time and a no-wrap caption
 * tz_card({
 *   id: 'shabat-card-kidush',
 *   layout: 'column-center',
 *   size: 'md',
 *   flex: 'grow',
 *   children: tz_time_column({
 *     time:  { id: 'kidush', size: 'lg' },
 *     label: { text: 'קידוש ושיעור', wrap: 'nowrap' },
 *   }),
 * })
 *
 * @example
 * // Same card but smaller + teal accent border
 * tz_card({
 *   id: 'my-card',
 *   size: 'sm',
 *   accentColor: 'var(--color-teal-border)',
 *   children: ...,
 * })
 */
export function tz_card({
    id,
    children = '',
    layout = 'column',
    size = 'md',
    flex = 'none',
    accentBorder = true,
    accentColor,
    extraClass,
    style,
} = {}) {
    // Layout classes
    var layoutClass = (
        layout === 'column-center' ? 'flex-col items-center justify-center text-center' :
        layout === 'row'           ? 'flex-row items-center' :
                                     'flex-col'
    );

    // Flex-in-container classes
    var flexClass = (
        flex === 'grow'   ? 'flex-1 basis-0 min-w-0' :
        flex === 'shrink' ? 'flex-none min-w-0'       :
                            'min-w-0'
    );

    // Accent border classes
    var borderClass = accentBorder ? 'border-r-8 border-primary' : '';

    // Inline styles
    var styles = [];
    if (accentColor) { styles.push('--tz-card-accent:' + accentColor); }
    if (style)       { styles.push(style); }

    // Extra classes
    var extra = extraClass ? ' ' + extraClass : '';

    // Always emit data-size so the CSS variant always wins over compact-mode
    // !important overrides.  See tailwind-input.css "COMPONENT PRIMITIVES" block.
    var sizeAttr = ' data-size="' + (size || 'md') + '"';

    return (
        '<div class="tz-glass-card flex ' +
        flexClass + ' ' + layoutClass + ' ' +
        borderClass +
        ' gap-2 rounded-xl shadow-glass sm:gap-2.5' +
        extra + '"' +
        (id ? ' id="' + id + '"' : '') +
        sizeAttr +
        _style_attr(styles) + '>' +
        children +
        '</div>'
    );
}


// ─── tz_time_card ─────────────────────────────────────────────────────────────

/**
 * ★ Shorthand — centered card with a single time digit and a label.
 *
 * Covers the most common card pattern without any boilerplate:
 *
 *   tz_time_card({ id: 'shabat-card-kidush-shiur', timeId: 'kidush', label: 'קידוש ושיעור' })
 *
 * Share sizes across many cards with a spread:
 *
 *   var D = { size: 'md', timeSize: 'lg', labelSize: 'sm' };
 *   tz_time_card({ id: 'my-card', timeId: 'my-time', label: 'כותרת', ...D })
 *
 * @param {object} opts
 * @param {string}  [opts.id]               Card element id
 * @param {string}  [opts.timeId]           Id on the <span> the clock-JS will fill
 * @param {string}  [opts.timeText='']      Static time text (used when timeId is absent)
 * @param {string|object} [opts.label='']
 *        Label below the time.
 *        • string → plain text, wrap defaults to 'nowrap'
 *        • object → forwarded to tz_label() (merge with size/wrap defaults)
 * @param {string}  [opts.labelHtml]
 *        Pre-built HTML string (use this for complex multi-part captions, e.g.
 *        tz_tf_cap_standalone_html(…)).  Takes precedence over opts.label.
 * @param {'xs'|'sm'|'md'|'lg'}     [opts.size='md']       Card padding
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [opts.timeSize='lg']  Time digit size
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [opts.labelSize='sm']  Caption size
 * @param {'grow'|'shrink'|'none'}  [opts.flex='grow']      Flex behaviour in parent
 * @param {string}  [opts.accentColor]  CSS colour for the right accent border
 * @param {string}  [opts.wrapClass]
 *        When present, wraps the time_column in a div with these extra classes
 *        (plus the centering utilities already on the card).
 *        Use for the show/hide JS pattern:  wrapClass: 'my-class hidden-element'
 * @param {string}  [opts.extraClass]   Extra classes on the card div
 * @param {string}  [opts.style]        Extra inline styles on the card
 * @returns {string} HTML string
 */
export function tz_time_card({
    id,
    timeId,
    timeText    = '',
    label       = '',
    labelHtml,
    size        = 'md',
    timeSize    = 'lg',
    labelSize   = 'sm',
    flex        = 'grow',
    accentColor,
    wrapClass,
    extraClass,
    style,
} = {}) {
    // Resolve label → either a tz_label opts object or a pre-built HTML string.
    // labelHtml wins; object labels get size/wrap merged in; plain strings auto-nowrap.
    var labelArg = labelHtml
        ? labelHtml
        : typeof label === 'object'
            ? Object.assign({ size: labelSize, wrap: 'nowrap' }, label)
            : { text: label, size: labelSize, wrap: 'nowrap' };

    var col = tz_time_column({
        time:  { id: timeId, text: timeText, size: timeSize },
        label: labelArg,
    });

    // Optional wrapper div for JS show/hide patterns (e.g. hidden-element)
    var inner = wrapClass
        ? '<div class="' + wrapClass + ' flex w-full min-h-0 flex-1 flex-col items-center justify-center self-stretch">' + col + '</div>'
        : col;

    return tz_card({ id, layout: 'column-center', flex, size, accentColor, extraClass, style, children: inner });
}


// ─── tz_section_header ────────────────────────────────────────────────────────

/**
 * Section header: title text + decorative horizontal rule.
 *
 * Used as the first-row item in a tz_page_grid column, or standalone anywhere
 * a titled section is needed.
 *
 * @param {object} opts
 * @param {string}  [opts.title='']           Heading text, e.g. 'זמני תפילות חול'
 * @param {boolean} [opts.parasha=false]
 *        When true, renders the parasha variant:
 *          <title> – <span id="prayer-times-title-parasha">
 *        Used on Friday and Shabbat slides.
 * @param {'h2'|'h3'} [opts.level='h2']
 *        Heading element level.  h3 also shifts the wrapper to the compact
 *        min-h-[2.35rem] height (used for inline sub-section headers).
 * @param {string}  [opts.titleExtraClass]    Extra classes on the heading element
 * @param {string}  [opts.extraClass]         Extra classes on the wrapper div
 * @returns {string} HTML string
 */
export function tz_section_header({ title = '', parasha = false, level = 'h2', titleExtraClass, extraClass } = {}) {
    var wrapExtra  = extraClass      ? ' ' + extraClass      : '';
    var titleExtra = titleExtraClass ? ' ' + titleExtraClass : '';
    var h          = level === 'h3' ? 'h3' : 'h2';
    var minH       = level === 'h3' ? 'min-h-[2.35rem]' : 'min-h-[2.6rem]';
    var titleHtml  = parasha
        ? '<' + h + ' class="tz-section-title tz-section-title--with-parasha flex min-w-0 flex-1 flex-nowrap items-baseline gap-x-1.5' + titleExtra + '">' +
          '<span class="shrink-0">' + title + '</span>' +
          '<span class="tz-section-title-sep shrink-0" aria-hidden="true">–</span>' +
          '<span class="tz-section-parasha shrink-0" id="prayer-times-title-parasha"></span>' +
          '</' + h + '>'
        : '<' + h + ' class="tz-section-title' + titleExtra + '">' + title + '</' + h + '>';
    return (
        '<div class="tz-section-header flex ' + minH + ' min-w-0 shrink-0 items-center self-stretch py-1' + wrapExtra + '">' +
        titleHtml +
        '<div class="tz-section-rule" aria-hidden="true"></div>' +
        '</div>'
    );
}


// ─── tz_day_time_row ──────────────────────────────────────────────────────────

/**
 * Compact label + time row — the "day times in halacha" glass card.
 *
 * Renders a compact glass card (narrower border + rounded-lg) with a Hebrew
 * label on the right and an updateable time on the left (layout is RTL).
 *
 * Structure (RTL):
 *   <div.tz-glass-card  row, justify-between>
 *     <span.label>  Hebrew label                   </span>
 *     <span.time  id="…">  ← JS fills via set_element_data  </span>
 *   </div>
 *
 * Used to build the "זמני היום בהלכה" sidebar column.
 *
 * @param {object} opts
 * @param {string}  [opts.label='']       Hebrew label text, e.g. 'זריחה'
 * @param {string}  [opts.id]             Id on the time <span> (JS fills via set_element_data)
 * @param {boolean} [opts.hidden=false]   Start hidden — adds hidden-element on the card
 * @param {string}  [opts.extraClass]     Extra classes on the card (e.g. 'talit_tfilin')
 * @returns {string} HTML string
 */
export function tz_day_time_row({ label = '', id, hidden = false, extraClass } = {}) {
    var labelSpan =
        '<span class="min-w-0 flex-1 break-words font-headline-md leading-snug text-on-surface' +
        ' text-sm sm:text-base md:text-lg">' + label + '</span>';

    var timeSpan =
        '<span class="shrink-0 whitespace-nowrap font-display-time tabular-nums' +
        ' text-primary tz-time-glow text-lg sm:text-xl md:text-2xl"' +
        (id ? ' id="' + id + '"' : '') + '></span>';

    // Compact glass card — narrower border (4px) + smaller radius (lg) vs standard cards
    var cardClass =
        'tz-glass-card flex w-full min-w-0 max-w-full shrink-0' +
        ' items-center justify-between gap-2 overflow-hidden' +
        ' rounded-lg border-r-4 border-primary px-3 py-2 shadow-glass' +
        ' sm:gap-2.5 sm:px-3.5 sm:py-2.5' +
        (hidden     ? ' hidden-element' : '') +
        (extraClass ? ' ' + extraClass  : '');

    return '<div class="' + cardClass + '">' + labelSpan + timeSpan + '</div>';
}


// ─── tz_col ───────────────────────────────────────────────────────────────────

/**
 * Full-width flex column container — fills available height in its parent.
 *
 * The standard layout wrapper for column content inside grid cells.
 * Replaces: <div class="flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col …">
 *
 * @param {object} opts
 * @param {string}        [opts.children='']   Inner HTML string
 * @param {string}        [opts.justify]       justify-content suffix — e.g. 'between', 'center'
 *                                             Omit for default (flex-start)
 * @param {string|number} [opts.gap='2']       Tailwind gap scale — '2', '2.5', '3', …
 * @param {string}        [opts.extraClass]    Extra classes on the wrapper
 * @returns {string} HTML string
 */
export function tz_col({ children = '', justify, gap = '2', extraClass } = {}) {
    var justifyClass = justify    ? ' justify-' + justify : '';
    var extra        = extraClass ? ' ' + extraClass      : '';
    return (
        '<div class="flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col gap-' + gap +
        justifyClass + extra + '">' +
        children +
        '</div>'
    );
}


// ─── tz_fill_slot ─────────────────────────────────────────────────────────────

/**
 * Named container div — optionally pre-filled or left empty for JS to fill later.
 *
 * Without children: a bare fill target (JS calls set_element_html on the id).
 * With children:    a named wrapper whose content is already built by the caller.
 *
 * @param {object} opts
 * @param {string} [opts.id]          Element id (required for JS to target it)
 * @param {string} [opts.extraClass]  CSS classes on the div (e.g. 'shrink-0')
 * @param {string} [opts.children=''] Inner HTML string (pre-fills the slot)
 * @returns {string} HTML string
 */
export function tz_fill_slot({ id, extraClass, children = '' } = {}) {
    var idAttr = id         ? ' id="' + id + '"'            : '';
    var cls    = extraClass ? ' class="' + extraClass + '"' : '';
    return '<div' + idAttr + cls + '>' + children + '</div>';
}


// ─── tz_flex_spacer ───────────────────────────────────────────────────────────

/**
 * Invisible flex-grow spacer for flex-col/flex-row layouts.
 *
 * Absorbs all remaining space in a flex container so surrounding items stay
 * in their natural positions.  Always aria-hidden.
 *
 * @returns {string} HTML string
 */
export function tz_flex_spacer() {
    return '<div class="min-h-0 min-w-0 flex-1 basis-0" aria-hidden="true"></div>';
}


// ─── tz_page_grid ─────────────────────────────────────────────────────────────

/**
 * Multi-column page grid — section headers in row 1, content cells in row 2.
 *
 * Accepts an array of column descriptors (left-to-right in display order).
 * Each descriptor produces:
 *   • one tz_section_header in the first CSS-grid row, and
 *   • one content cell <div> in the second CSS-grid row.
 *
 * Adding a third column is as simple as pushing a third object into the array.
 *
 * @param {Array<{title?: string, id?: string, children?: string, cellClass?: string, cellOverflow?: string}>} columns
 *   Column definitions.
 *   @param {string} [col.title]        Section header heading text.
 *   @param {string} [col.id]           id attribute on the content <div>.
 *   @param {string} [col.children]     Pre-built HTML injected inside the cell.
 *   @param {string} [col.cellClass]    Extra CSS classes on the content <div>.
 *   @param {string} [col.cellOverflow] Overflow classes on the cell (default:
 *                                      'overflow-y-auto overflow-x-hidden overscroll-contain').
 *                                      Pass 'overflow-hidden' for cells that contain their own
 *                                      independently-scrolling sub-sections.
 *
 * Alignment guideline: cells carry no horizontal padding so glass cards share
 * the exact left/right edges of the section-header bar above them.  Never add
 * pr-* / pl-* / px-* to cellClass — see tailwind-input.css for the full rule.
 *
 * @param {object} [opts]
 * @param {string} [opts.gridCols]    Tailwind grid-cols class override.
 *   Defaults: 1 col → 'grid-cols-1'
 *             2 col → 'grid-cols-[minmax(0,1.58fr)_minmax(0,1fr)]'
 *             3 col → 'grid-cols-3'
 *             N col → 'grid-cols-N'
 * @param {string} [opts.extraClass]  Extra classes on the grid wrapper.
 * @returns {string} HTML string
 *
 * @example
 * tz_page_grid([
 *   { title: 'זמני תפילות חול', id: 'prayer_times', children: get_tfilot_prayer_col_html()        },
 *   { title: 'זמני היום בהלכה', id: 'day_times',    children: get_tfilot_day_times_col_weekday_html() },
 * ])
 */
export function tz_page_grid(columns, opts) {
    var extraClass   = (opts && opts.extraClass) || '';
    var n            = columns.length;
    var defaultCols  =
        n === 1 ? 'grid-cols-1' :
        n === 2 ? 'grid-cols-[minmax(0,1.58fr)_minmax(0,1fr)]' :
        n === 3 ? 'grid-cols-3' :
                  'grid-cols-' + n;
    var gridCols = (opts && opts.gridCols) || defaultCols;

    /* Row 1: one section header per column */
    var headers = columns.map(function(col) {
        return tz_section_header({ title: col.title || '', parasha: !!col.parasha });
    }).join('');

    /* Row 2: one content cell per column */
    var cells = columns.map(function(col) {
        var overflow = (col.cellOverflow !== undefined)
            ? col.cellOverflow
            : 'overflow-y-auto overflow-x-hidden overscroll-contain';
        return (
            '<div' + (col.id ? ' id="' + col.id + '"' : '') +
            ' class="tz-tf-col-cell flex h-full min-h-0 min-w-0 max-w-full flex-col ' + overflow +
            (col.cellClass ? ' ' + col.cellClass : '') + '">' +
            (col.children || '') +
            '</div>'
        );
    }).join('');

    return (
        '<div class="tz-two-col-grid grid w-full min-w-0 max-w-full shrink-0 ' +
        gridCols + ' grid-rows-[auto_auto] items-stretch gap-x-4 gap-y-2 overflow-hidden' +
        ' sm:gap-x-5 sm:gap-y-2 md:gap-x-6 md:gap-y-2.5' +
        (extraClass ? ' ' + extraClass : '') + '">' +
        headers + cells +
        '</div>'
    );
}


// ─── tz_card_row ──────────────────────────────────────────────────────────────

/**
 * Builder for a flex-wrap row of equal-width cards.
 *
 * Returns an object with two methods:
 *   .add(cards)  — accepts a single card HTML string or an array of them
 *   .html()      — returns the final HTML string
 *
 * @param {string} [label]              aria-label for the row (e.g. 'אחרי שחרית')
 * @param {object} [opts]
 * @param {'sm'|'md'} [opts.gap='md']   Gap between cards
 *          'sm' → gap-1.5 sm:gap-2     'md' → gap-2 sm:gap-3
 * @param {string} [opts.extraClass]    Extra classes on the wrapper div
 * @returns {{ add: function, html: function }}
 *
 * @example
 * var row = tz_card_row('אחרי שחרית — ציר זמן');
 * row.add([
 *   tz_time_card({ id: 'card-a', timeId: 'time-a', label: 'כותרת א' }),
 *   tz_time_card({ id: 'card-b', timeId: 'time-b', label: 'כותרת ב' }),
 * ]);
 * return row.html();
 */
export function tz_card_row(label, opts) {
    var gap        = (opts && opts.gap)        || 'md';
    var extraClass = (opts && opts.extraClass) || '';
    var _cards = [];

    return {
        /** Add one card (string) or an array of cards. Chainable. */
        add: function(cards) {
            if (Array.isArray(cards)) {
                _cards = _cards.concat(cards);
            } else {
                _cards.push(cards);
            }
            return this;
        },
        /** Finalise and return the HTML string. */
        html: function() {
            var gapClass = gap === 'sm' ? 'gap-1.5 sm:gap-2' : 'gap-2 sm:gap-3';
            var extra    = extraClass ? ' ' + extraClass : '';
            return (
                '<div class="flex min-w-0 flex-wrap ' + gapClass + extra + '"' +
                (label ? ' aria-label="' + label + '"' : '') + '>' +
                _cards.join('') +
                '</div>'
            );
        },
    };
}


// ─── tz_slide_theme ───────────────────────────────────────────────────────────

/**
 * Per-slide font-size configuration for time digits and labels.
 *
 * Returns two spread objects — .standalone and .list — for the two card
 * variants used on a slide.  Spread onto tz_time_card / tz_tfilot_col to
 * control all cards from a single variable:
 *
 *   var THEME = tz_slide_theme({
 *       standalone: { timeSize: 'lg', labelSize: 'xl' },
 *       list:       { timeSize: 'xl', labelSize: 'xl' },
 *   });
 *
 *   // hero card (קידוש, תפילת ילדים, …):
 *   tz_time_card({ ...THEME.standalone, id: 'kidush', label: 'קידוש' })
 *
 *   // compact list row (שחרית, מנחה, …):
 *   tz_tfilot_col({ ...THEME.list, timeId: 'shacharit', captionText: 'שחרית' })
 *
 * Size scale:  'xs' | 'sm' | 'md' | 'lg' | 'xl'
 *
 * Card variants:
 *   standalone — big hero cards that stand alone (קידוש ושיעור, הדלקת נרות, …)
 *   list       — compact rows inside a prayer-group card (שחרית א/ב, מנחה, …)
 *
 * @param {object} [opts]
 * @param {{ timeSize?: string, labelSize?: string, size?: string }} [opts.standalone]
 *   Overrides for standalone/hero cards.
 *   Defaults: size='lg', timeSize='lg', labelSize='xl'
 * @param {{ timeSize?: string, labelSize?: string }} [opts.list]
 *   Overrides for compact list-row cards.
 *   Defaults: timeSize='xl', labelSize='xl'
 * @returns {{ standalone: object, list: object }}
 */
export function shabat_slide_theme({ standalone = {}, list = {} } = {}) {
    return {
        standalone: Object.assign({ size: 'lg', timeSize: 'lg', labelSize: 'xl' }, standalone),
        list:       Object.assign({              timeSize: 'lg', labelSize: 'md' }, list),
    };
}

export function weekdays_slide_theme({ standalone = {}, list = {} } = {}) {
    return {
        standalone: Object.assign({ size: 'lg', timeSize: 'lg', labelSize: 'xl' }, standalone),
        list:       Object.assign({              timeSize: 'lg', labelSize: 'xl' }, list),
    };
}

export function friday_slide_theme({ standalone = {}, list = {} } = {}) {
    return {
        standalone: Object.assign({ size: 'lg', timeSize: 'xl', labelSize: 'xl' }, standalone),
        list:       Object.assign({              timeSize: 'lg', labelSize: 'xl' }, list),
    };
}
