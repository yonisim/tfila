var TZ_HERO_CLOCK_PAGE_IDS = [
  'tfilot_single_page',
  'friday_single_page',
  'friday_single_page_plag',
  'shabat_single_page',
  'shavuot_single_page',
];

/** Slide roots that host the top-left hero clock + HUD (same layout as tfilot). */
function getTzHeroClockSlideRoot() {
  var i;
  for (i = 0; i < TZ_HERO_CLOCK_PAGE_IDS.length; i++) {
    var el = document.getElementById(TZ_HERO_CLOCK_PAGE_IDS[i]);
    if (el && el.querySelector('.clock .hour')) {
      return el;
    }
  }
  return null;
}


/** Inner content box (px): prefer clientWidth minus padding; fall back to border box from layout. */
function tfilotHeroClockInnerPx(disk) {
  var cs = getComputedStyle(disk);
  var pl = parseFloat(cs.paddingLeft) || 0;
  var pr = parseFloat(cs.paddingRight) || 0;
  var pt = parseFloat(cs.paddingTop) || 0;
  var pb = parseFloat(cs.paddingBottom) || 0;
  var cw = disk.clientWidth;
  var ch = disk.clientHeight;
  if (cw < 1 || ch < 1) {
    var br = disk.getBoundingClientRect();
    var bw = br.width;
    var bh = br.height;
    var bl = parseFloat(cs.borderLeftWidth) || 0;
    var brw = parseFloat(cs.borderRightWidth) || 0;
    var bt = parseFloat(cs.borderTopWidth) || 0;
    var bb = parseFloat(cs.borderBottomWidth) || 0;
    cw = Math.max(0, bw - bl - brw);
    ch = Math.max(0, bh - bt - bb);
  }
  return {
    w: Math.max(0, cw - pl - pr),
    h: Math.max(0, ch - pt - pb),
  };
}

var tfilotInnerRetries = 0;
var tfilotScrollRetries = 0;
var TFILOT_FIT_MAX_RETRIES = 80;

var tfilotDiskResizeObserver = null;

function clearTfilotHeroClockFit(clock, disk) {
  if (disk) {
    disk.style.removeProperty('--clock-fit-fs');
  }
  if (!clock) {
    return;
  }
  clock.style.removeProperty('font-size');
  clock.style.removeProperty('transform');
  clock.style.removeProperty('transform-origin');
  var nodes = clock.querySelectorAll('.clock-text');
  var j;
  for (j = 0; j < nodes.length; j++) {
    nodes[j].style.removeProperty('font-size');
  }
}

function setTfilotFitDebug(payload) {
  if (typeof window === 'undefined') {
    return;
  }
  window.__tfilotClockFitDebug = payload;
}

/**
 * Legacy hook: tfilot hero clock is a Hebrew-date-style panel (not a circle); size comes from CSS.
 * Clears any old inline --clock-size from the circular-disk era.
 */
export function syncTfilotHeroClockDiskSize() {
  var tfPage = getTzHeroClockSlideRoot();
  if (!tfPage) {
    return;
  }
  var disk = tfPage.querySelector('.tfilot-hero-clock');
  if (disk) {
    disk.style.removeProperty('--clock-size');
  }
}

/**
 * Tfilot / Friday / Shabbat hero clock: frosted panel matching `.header-hebrew-panel` (no circular fit).
 */
export function fitTfilotHeroClock() {
  var tfPage = getTzHeroClockSlideRoot();
  /* Slide not in DOM (other slide / loop) — skip; do not overwrite __tfilotClockFitDebug */
  if (!tfPage) {
    return;
  }
  syncTfilotHeroClockDiskSize();
  var disk = tfPage.querySelector('.tfilot-hero-clock');
  var clock = disk && disk.querySelector('.clock');
  if (!disk || !clock) {
    setTfilotFitDebug({
      ok: false,
      reason: 'hero_missing',
      note: 'tz hero slide is mounted but .tfilot-hero-clock or inner .clock is missing',
    });
    return;
  }

  clearTfilotHeroClockFit(clock, disk);
  void clock.offsetWidth;
  tfilotInnerRetries = 0;
  tfilotScrollRetries = 0;
  setTfilotFitDebug({
    ok: true,
    mode: 'tfilot_hero_date_panel',
    diskWidthPx: disk.clientWidth,
  });
}

/** Call once when the tfilot slide is shown; refits whenever the hero disk size changes. */
export function attachTfilotHeroClockResizeObserver() {
  if (typeof ResizeObserver === 'undefined') {
    return;
  }
  var tfPage = getTzHeroClockSlideRoot();
  var disk = tfPage && tfPage.querySelector('.tfilot-hero-clock');
  if (!disk) {
    return;
  }
  if (tfilotDiskResizeObserver) {
    tfilotDiskResizeObserver.disconnect();
    tfilotDiskResizeObserver = null;
  }
  tfilotInnerRetries = 0;
  tfilotScrollRetries = 0;
  tfilotDiskResizeObserver = new ResizeObserver(function () {
    tfilotInnerRetries = 0;
    tfilotScrollRetries = 0;
    requestAnimationFrame(function () {
      fitTfilotHeroClock();
    });
  });
  tfilotDiskResizeObserver.observe(disk);
  var mainEl = tfPage.querySelector('main.tfilot-main-offset');
  if (mainEl) {
    tfilotDiskResizeObserver.observe(mainEl);
  }
  var mainScrollHost = mainEl && mainEl.firstElementChild;
  if (mainScrollHost) {
    tfilotDiskResizeObserver.observe(mainScrollHost);
  }
}

var tfilotFitRaf = 0;
function scheduleTfilotClockFit() {
  if (tfilotFitRaf) {
    return;
  }
  tfilotFitRaf = requestAnimationFrame(function () {
    tfilotFitRaf = 0;
    fitTfilotHeroClock();
  });
}

export function clockFunc() {
  let time = new Date();
  let hour = time.getHours();
  let sec = time.getSeconds();
  let min = time.getMinutes();
  hour = hour < 10 ? '0' + hour : '' + hour;
  min = min < 10 ? '0' + min : '' + min;
  sec = sec < 10 ? '0' + sec : '' + sec;
  document.documentElement.style.setProperty('--loadingSize', sec);

  /* Update every .clock in the DOM — no slide coupling */
  var clocks = document.querySelectorAll('.clock');
  if (!clocks.length) {
    setTimeout(clockFunc, 400);
    return;
  }
  for (var i = 0; i < clocks.length; i++) {
    var c = clocks[i];
    var hourTxt = c.querySelector('.hour');
    var minTxt  = c.querySelector('.min');
    var secTxt  = c.querySelector('.second');
    if (!hourTxt || !minTxt || !secTxt) continue;
    hourTxt.textContent = hour;
    minTxt.textContent  = min;
    secTxt.textContent  = sec;
    var colons = c.querySelectorAll('.clock-text.colon');
    for (var j = 0; j < colons.length; j++) {
      colons[j].classList.add('sec');
    }
  }

  /* Hero-clock size fitting is still slide-specific, but triggered independently */
  if (getTzHeroClockSlideRoot()) {
    scheduleTfilotClockFit();
  }

  setTimeout(clockFunc, 1000);
}

/** Paste in DevTools console on the tfilot slide; copy the printed JSON for support. */
export function dumpTfilotClockLayout() {
  if (!document.getElementById('tfilot_single_page')) {
    return {
      error: 'tfilot_slide_not_mounted',
      hint: 'Open DevTools while the זמני תפילות חול full slide is visible, then run again.',
    };
  }
  var disk = document.querySelector('#tfilot_single_page .tfilot-hero-clock');
  var clock = disk && disk.querySelector('.clock');
  var hour = clock && clock.querySelector('.clock-text.hour');
  if (!disk || !clock) {
    return { error: 'no_tfilot_hero_clock_in_dom' };
  }
  var inner = tfilotHeroClockInnerPx(disk);
  var csHour = hour ? getComputedStyle(hour) : null;
  var csClock = getComputedStyle(clock);
  return {
    diskFound: true,
    fitDebug: typeof window !== 'undefined' ? window.__tfilotClockFitDebug : null,
    diskRect: disk.getBoundingClientRect(),
    diskClient: { w: disk.clientWidth, h: disk.clientHeight },
    innerPx: inner,
    clockRect: clock.getBoundingClientRect(),
    scroll: { w: clock.scrollWidth, h: clock.scrollHeight },
    styleTransform: clock.style.transform,
    computedTransform: csClock.transform,
    hourComputedFontSize: csHour ? csHour.fontSize : null,
    clockSheets: [].map.call(document.styleSheets, function (s) {
      try {
        return s.href || '(inline)';
      } catch (e) {
        return '(opaque)';
      }
    }),
  };
}

if (typeof window !== 'undefined') {
  window.dumpTfilotClockLayout = dumpTfilotClockLayout;

  var tfilotResizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(tfilotResizeTimer);
    tfilotResizeTimer = setTimeout(function () {
      var page = getTzHeroClockSlideRoot();
      if (!page) {
        return;
      }
      tfilotInnerRetries = 0;
      tfilotScrollRetries = 0;
      var d = page.querySelector('.tfilot-hero-clock');
      var c = d && d.querySelector('.clock');
      clearTfilotHeroClockFit(c, d);
      fitTfilotHeroClock();
    }, 120);
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      var page = getTzHeroClockSlideRoot();
      if (!page) {
        return;
      }
      tfilotInnerRetries = 0;
      tfilotScrollRetries = 0;
      var d = page.querySelector('.tfilot-hero-clock');
      var c = d && d.querySelector('.clock');
      clearTfilotHeroClockFit(c, d);
      fitTfilotHeroClock();
    });
  }
}
