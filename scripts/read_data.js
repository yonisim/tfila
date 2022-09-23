'esversion: 8';

export function current_date(){
    let cur_date = new Date('2022-09-25T17:28:02');
    let time = new Date();
    return time;
}

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}

export function get_date_from_Date(date){
    return formatDate(date);
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
