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
