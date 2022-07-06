'esversion: 6';

export function load_file(filename, handle_func){

    fetch(filename)
      .then(response => response.text())
      .then(data => handle_func(data));
}