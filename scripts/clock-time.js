export function clockFunc() {
    // GETTING THE TIME 
    let time = new Date();
    let hour = time.getHours();
    let sec = time.getSeconds();
    let min = time.getMinutes();
    // STYLING THE HOURS AND MINUTES
    hour = (hour > 12) ? hour : hour;
    hour = (hour < 10) ? '0' + hour : hour;
    min = (min < 10) ? '0' + min : min;
    sec = (sec < 10) ? '0' + sec : sec;
    // UPDATEING THE CIRCLE LOADER VALUE WITH SECONDS
    document.documentElement.style.setProperty('--loadingSize', sec);
    // SELECTING THE HOUR, MINUTE AND COLON
    const hourTxt = document.querySelector('.hour');
    const minTxt = document.querySelector('.min');
    const secTxt = document.querySelector('.second');
    var colon = document.querySelector('.colon');
    // UPDATING THEM WITH HOUR AND MINUTE VALUE
    hourTxt.innerHTML = hour;
    minTxt.innerHTML = min;
    secTxt.innerHTML = sec;
    // ADDING SIMPLE SECOND EFFECT TO THE COLON
    if (!colon.classList.contains('sec')) {
      colon.classList.add('sec')
    }
    // CALLING THIS FUNCTION TO UP TO DATE THE TIME
    setTimeout(clockFunc, 1000);
  }