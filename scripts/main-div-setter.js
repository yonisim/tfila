'esversion: 6';

var wait_for_animation_flags = {};

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
    element.innerHTML = html_data;
}

export function activate_element(element_id){
    var element = document.getElementById(element_id);
    element.style.display = 'contents';
    element.classList.add('fade-in');
    for (var child_elem of element.children){
        child_elem.classList.add('fade-in');
    }
    return wait_for_scroll(element);
}

export function deactivate_element(element_id){
    var element = document.getElementById(element_id);
    element.classList.remove('fade-in');
    element.classList.add('fade-out');
    for (var child_elem of element.children){
        child_elem.classList.remove('fade-in');
        child_elem.classList.add('fade-out');
    }
    return wait_for_scroll(element);
}

export function toggle_element_show(element, hide){
    if(hide === true){
        element.classList.add('hidden_element');
    } else {
        element.classList.remove('hidden_element');
    }
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

export function set_element_background_image(element, image_url){
    element.style.backgroundImage = "url(" + image_url + ")";
}

export function get_element_background(elem_id){
    var element = document.getElementById(elem_id);
    return element.style.backgroundImage;
}

function waitForAnimation (element) {
    // Test if ANY/ALL page animations are currently active
    return new Promise((resolve) => {
        var testAnimationInterval = setInterval(function () {
            if (!wait_for_animation_flags[element.id]) { // any page animations finished
                clearInterval(testAnimationInterval);
                console.log('finished animation');
                resolve();
            }
        }, 25);
    });
};

export function wait_for_scroll(el){
    wait_for_animation_flags[el.id] = true;
    el.addEventListener('animationend', () => {
        console.log('Animation ended');
        wait_for_animation_flags[el.id] = false;
      });
    return waitForAnimation(el);
}


