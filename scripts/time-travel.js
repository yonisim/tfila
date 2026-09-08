'use strict';
/**
 * Time travel — בדיקת שקופיות בזמן מדומה, בלי לשנות קוד.
 *
 * Ctrl+D  פותח בורר תאריך ושעה. אישור טוען מחדש את אותו הדף (אותו חלון,
 *         אותו תהליך) עם ?sim=<תאריך>T<שעה> ב־URL.
 * Esc     סוגר את הבורר; אם הבורר סגור — יוצא ממצב הזמן המדומה וחוזר
 *         ללוח ולשעון האמיתיים.
 *
 * ### למה URL ולא localStorage
 * הדף נטען מ־file://, ו־location.replace() על אותו קובץ עם query אחר הוא
 * טעינה מחדש של אותו הדף — בלי חלון חדש ובלי הרצה מחדש של התהליך. גם
 * ה־auto-reload של main.js (chokidar) שומר על ה־query כי הוא קורא ל־
 * webContents.reload() על אותו URL.
 *
 * ### למה עוטפים את Date הגלובלי
 * הזמן המדומה חייב להשפיע גם על current_date() (בחירת השקופית) וגם על
 * clockFunc() (השעון שמתקתק), ועל כל חישובי הזריחה/שקיעה שביניהם. עטיפה
 * אחת של Date מכסה את כולם במקום לחווט פרמטר דרך כל קריאה. הקובץ נטען
 * כ־script רגיל לפני present-next-page.js (שהוא module, ולכן נדחה), כך
 * שהעטיפה מותקנת לפני שכל קוד האפליקציה רץ.
 *
 * הזמן ממשיך לזוז מהרגע שנבחר (offset ולא הקפאה), כדי שהשעון יתקתק
 * והשקופיות יתחלפו כמו בהרצה אמיתית.
 */
(function () {
  var PARAM = 'sim';
  var RealDate = window.Date;
  var offset_ms = 0;
  var overlay = null;
  var date_input = null;
  var time_input = null;

  function sim_now() {
    return RealDate.now() + offset_ms;
  }

  function install_date_override(target_ms) {
    offset_ms = target_ms - RealDate.now();
    window.Date = new Proxy(RealDate, {
      construct: function (target, args) {
        return args.length === 0 ? new target(sim_now()) : new target(...args);
      },
      apply: function () {
        return new RealDate(sim_now()).toString();
      },
      get: function (target, prop, receiver) {
        return prop === 'now' ? sim_now : Reflect.get(target, prop, receiver);
      }
    });
  }

  function get_sim_param() {
    return new URL(window.location.href).searchParams.get(PARAM);
  }

  function reload_with_sim(value) {
    var url = new URL(window.location.href);
    if (value) {
      url.searchParams.set(PARAM, value);
    } else {
      url.searchParams.delete(PARAM);
    }
    window.location.replace(url.toString());
  }

  function pad2(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function date_part(date) {
    return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
  }

  function time_part(date) {
    return pad2(date.getHours()) + ':' + pad2(date.getMinutes());
  }

  // ---------------------------------------------------------------- badge

  function create_badge(effective_date) {
    var badge = document.createElement('div');
    badge.className = 'tt-badge';
    badge.dir = 'rtl';
    badge.textContent = 'זמן מדומה · ' +
      date_part(effective_date).split('-').reverse().join('/') + ' ' +
      time_part(effective_date) + ' · Esc ליציאה';
    document.body.appendChild(badge);
  }

  // --------------------------------------------------------------- picker

  function add_row(parent, label_text, input) {
    var row = document.createElement('label');
    row.className = 'tt-row';
    var span = document.createElement('span');
    span.className = 'tt-label';
    span.textContent = label_text;
    row.appendChild(span);
    row.appendChild(input);
    parent.appendChild(row);
    return row;
  }

  function add_button(parent, text, class_name, on_click) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'tt-btn ' + class_name;
    button.textContent = text;
    button.addEventListener('click', on_click);
    parent.appendChild(button);
    return button;
  }

  function build_overlay() {
    overlay = document.createElement('div');
    overlay.className = 'tt-overlay';
    overlay.dir = 'rtl';
    overlay.hidden = true;

    var panel = document.createElement('div');
    panel.className = 'tt-panel';
    overlay.appendChild(panel);

    var title = document.createElement('div');
    title.className = 'tt-title';
    title.textContent = 'בחירת תאריך ושעה לבדיקה';
    panel.appendChild(title);

    date_input = document.createElement('input');
    date_input.type = 'date';
    date_input.className = 'tt-input';
    add_row(panel, 'תאריך', date_input);

    time_input = document.createElement('input');
    time_input.type = 'time';
    time_input.className = 'tt-input';
    add_row(panel, 'שעה', time_input);

    var actions = document.createElement('div');
    actions.className = 'tt-actions';
    panel.appendChild(actions);
    add_button(actions, 'אישור', 'tt-btn-primary', approve);
    add_button(actions, 'ביטול', 'tt-btn-ghost', close_picker);
    add_button(actions, 'חזרה לזמן אמת', 'tt-btn-ghost', function () {
      reload_with_sim(null);
    });

    var hint = document.createElement('div');
    hint.className = 'tt-hint';
    hint.textContent = 'Enter לאישור · Esc לסגירה';
    panel.appendChild(hint);

    // קליק על הרקע סוגר, קליק על הפאנל לא
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) {
        close_picker();
      }
    });

    document.body.appendChild(overlay);
  }

  function is_open() {
    return overlay !== null && !overlay.hidden;
  }

  function open_picker() {
    if (!overlay) {
      build_overlay();
    }
    var now = new Date();   // כבר עטוף — מציג את הזמן האפקטיבי
    date_input.value = date_part(now);
    time_input.value = time_part(now);
    overlay.hidden = false;
    date_input.focus();
  }

  function close_picker() {
    if (overlay) {
      overlay.hidden = true;
    }
  }

  function approve() {
    if (!date_input.value) {
      date_input.focus();
      return;
    }
    reload_with_sim(date_input.value + 'T' + (time_input.value || '00:00'));
  }

  // ------------------------------------------------------------ keyboard

  function on_key_down(event) {
    if (event.ctrlKey && (event.key === 'd' || event.key === 'D')) {
      event.preventDefault();
      event.stopPropagation();
      if (is_open()) {
        close_picker();
      } else {
        open_picker();
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      if (is_open()) {
        close_picker();
      } else if (get_sim_param()) {
        reload_with_sim(null);
      }
      return;
    }

    if (!is_open()) {
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      approve();
      return;
    }
    // הבורר פתוח — לא מעבירים מקשים למצגת (ArrowRight/ArrowUp מדלגים שקופית).
    // stopPropagation לא מבטל את פעולת ברירת המחדל, כך שהקלדה בשדות עובדת.
    event.stopPropagation();
  }

  // ----------------------------------------------------------------- init

  var sim_value = get_sim_param();
  if (sim_value) {
    var target = new RealDate(sim_value);
    if (isNaN(target.getTime())) {
      console.warn('[time-travel] ערך sim לא תקין:', sim_value);
    } else {
      install_date_override(target.getTime());
      create_badge(target);
      // current_date() מעדיף את npm_config_test_date (הוק של הטסטים); מנקים
      // אותו כדי שהבחירה ב־Ctrl+D תגבר גם אם האפליקציה הורצה עם --test_date.
      if (typeof process !== 'undefined' && process.env) {
        delete process.env.npm_config_test_date;
      }
    }
  }

  document.addEventListener('keydown', on_key_down, true);
}());
