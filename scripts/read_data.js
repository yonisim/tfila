'esversion: 8';

export function current_date(){
    // Allow tests to freeze time by setting npm_config_test_date in the environment.
    // Works because the Electron renderer runs with nodeIntegration: true.
    // time-travel.js clears this var when ?sim= is active, so Ctrl+D always wins.
    if (typeof process !== 'undefined' && process.env && process.env.npm_config_test_date) {
        return new Date(process.env.npm_config_test_date);
    }
    return new Date();
}

function formatDate(date, reverse) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  var formatted = [year, month, day];
  if (reverse){
    formatted = [day, month, year];
  }
  return formatted.join('-');
}

export function get_date_from_Date(date){
    return formatDate(date);
}

export function get_date_from_Date_for_header(date){
    return formatDate(date, true);
}

function current_date_local(){
    let time = new Date();
    let current_date = time.toISOString().split('T')[0];
    return current_date;
}

export function read_json(filename){
    let result = fetch(filename)
      .then(response => response.json())
      .then(data => {
        return data;
      });
    return result;
}
