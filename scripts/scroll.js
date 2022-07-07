'esversion: 6';

export function load_file(filename, handle_func){

    return fetch(filename)
      .then(response => response.text());
}