'esversion: 6';

export function insert_html(source_file, dest_element_id){
    return fetch(source_file)
      .then(response => response.text())
      .then(data => {
        document.getElementById(dest_element_id).innerHTML = data;
      });
}

export function append_html(source_file, dest_element_id){
    return fetch(source_file)
      .then(response => response.text())
      .then(data => {
        document.getElementById(dest_element_id).innerHTML += data;
      });
}

export function set_element_data(dest_element_id, data){
    document.getElementById(dest_element_id).textContent = data;
}

export function set_element_html(dest_element_id, html_data){
    var element = document.getElementById(dest_element_id);
    console.log(document);
    console.log(element);
    console.log(html_data);
    element.innerHTML = html_data;
}

export function activate_element(element_id, parent_element_id){
    var parent_elem = document.getElementById(parent_element_id);
    for (var child_elem of parent_elem.children){
        child_elem.style.display = 'none';
    }
    var element = document.getElementById(element_id);
    element.style.display = 'block';
    element.parentElement.style.display = 'block';
}

export function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

export function set_element_background(elem_id, image_name){
    var element = document.getElementById(elem_id);
    //element.style.backgroundImage = "url(images/" + image_name + ".jpg)";
}

export function set_element_background_image(elem_id, image_url){
    var element = document.getElementById(elem_id);
    element.style.backgroundImage = image_url;
}

export function get_element_background(elem_id){
    var element = document.getElementById(elem_id);
    return element.style.backgroundImage;
}



