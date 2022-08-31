'esversion: 8';

export function current_date(){
    let cur_date = new Date('2022-09-01T19:28:02');
    let time = new Date();
    return time;
}

export function get_date_from_Date(date){
    return date.toISOString().split('T')[0];
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
