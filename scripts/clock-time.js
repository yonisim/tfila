/* The hero clock lives in #hero-hud-host (see index.html) — persistent chrome that
   outlives every slide. Its size comes entirely from CSS clamp() in
   styles/src/tailwind-input.css, so there is no JS fitting step: the old
   fit/ResizeObserver machinery was a no-op left over from the circular-disk design. */

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

  setTimeout(clockFunc, 1000);
}

/** Paste in DevTools console; copy the printed JSON for support. */
export function dumpTfilotClockLayout() {
  var disk = document.querySelector('#hero-hud-host .tfilot-hero-clock');
  var clock = disk && disk.querySelector('.clock');
  var hour = clock && clock.querySelector('.clock-text.hour');
  if (!disk || !clock) {
    return {
      error: 'no_hero_clock_in_dom',
      hint: 'The clock is mounted once at boot into #hero-hud-host by present_first_page().',
    };
  }
  var inner = tfilotHeroClockInnerPx(disk);
  var csHour = hour ? getComputedStyle(hour) : null;
  var csClock = getComputedStyle(clock);
  return {
    diskFound: true,
    slide: document.body.dataset.slide || null,
    diskRect: disk.getBoundingClientRect(),
    diskClient: { w: disk.clientWidth, h: disk.clientHeight },
    innerPx: inner,
    clockRect: clock.getBoundingClientRect(),
    scroll: { w: clock.scrollWidth, h: clock.scrollHeight },
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
}
