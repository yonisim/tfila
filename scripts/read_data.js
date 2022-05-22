'esversion: 8';

export function current_date(){
    let time = new Date();
    let current_date = time.toISOString().split('T')[0];
    return current_date;
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
