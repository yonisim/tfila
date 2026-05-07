function getActiveClockRoot() {
  var tf = document.getElementById('tfilot_single_page');
  if (tf && tf.querySelector('.clock .hour')) {
    return tf;
  }
  var header = document.querySelector('header');
  if (header && header.querySelector('.clock .hour')) {
    return header;
  }
  return document;
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

  var root = getActiveClockRoot();
  var hourTxt = root.querySelector('.clock .hour');
  var minTxt = root.querySelector('.clock .min');
  var secTxt = root.querySelector('.clock .second');
  if (!hourTxt || !minTxt || !secTxt) {
    setTimeout(clockFunc, 400);
    return;
  }
  hourTxt.textContent = hour;
  minTxt.textContent = min;
  secTxt.textContent = sec;

  var colons = root.querySelectorAll('.clock .clock-text.colon');
  for (var i = 0; i < colons.length; i++) {
    if (!colons[i].classList.contains('sec')) {
      colons[i].classList.add('sec');
    }
  }
  setTimeout(clockFunc, 1000);
}
