'esversion: 6';

export function load_file(filename){

    return fetch(filename)
      .then(response => response.text())
      .then(text => {
        return text.split("\n");
      });
}