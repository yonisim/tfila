'esversion: 8';

export function insert_html(source_file, dest_element_id){
    return fetch(source_file)
      .then(response => response.text())
      .then(data => {
        document.getElementById(dest_element_id).innerHTML = data;
      });
}

export async function append_html(source_file, dest_element_id, callback){
    return fetch('./html/' + source_file)
      .then(response => response.text())
      .then(data => {
        document.getElementById(dest_element_id).innerHTML += data;
        if(callback){
            callback();
        }
      });
}


export function set_element_data(dest_element_id, data){
    document.getElementById(dest_element_id).textContent = data;
}

export function set_element_html(dest_element_id, html_data){
    var element = document.getElementById(dest_element_id);
    element.innerHTML = html_data;
}

export function insert_html_at_start_of_element(dest_element_id, html_data){
    var element = document.getElementById(dest_element_id);
    element.innerHTML = html_data + element.innerHTML;
}

export function insert_html_at_end_of_element(dest_element_id, html_data){
    var element = document.getElementById(dest_element_id);
    element.innerHTML += html_data;
}

export function toggle_element_show(element, hide){
    if(hide === true){
        element.classList.remove('show-element');
        element.classList.add('hidden-element');
    } else {
        element.classList.remove('hidden-element');
        element.classList.add('show-element');
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

/* Resolves once the transitions/animations running on `element` itself settle.
   Deliberately NOT event-based: --test-mode (main.js) and prefers-reduced-motion
   zero every duration, and a zero-duration transition never fires transitionend.
   getAnimations() returns [] in that case, so we resolve immediately instead of
   hanging the slide loop. subtree:false keeps a child's animation from standing
   in for the element's own. The timeout is a safety net — an unattended kiosk
   must never be able to deadlock here. */
export function wait_for_animations(element, timeout_ms = 3000){
    if (!element || typeof element.getAnimations !== 'function'){
        return Promise.resolve();
    }
    var anims = element.getAnimations({ subtree: false });
    if (!anims.length){
        return Promise.resolve();
    }
    // A cancelled animation rejects with AbortError; that still counts as settled.
    var done = Promise.all(anims.map(function (a) { return a.finished.catch(function () {}); }));
    return Promise.race([
        done,
        new Promise(function (resolve) { setTimeout(resolve, timeout_ms); })
    ]);
}

/* The donors slide scrolls for 30s via @keyframes my-animation (styles/scroll.css).
   Same primitive, generous timeout so a slow frame can't cut the scroll short. */
export function wait_for_scroll_animation(element){
    return wait_for_animations(element, 35000);
}

/* Two frames: one for the content fill to be applied, one for layout to settle,
   so the slide is final before it starts fading in. */
export function next_frame(){
    return new Promise(function (resolve) {
        requestAnimationFrame(function () {
            requestAnimationFrame(resolve);
        });
    });
}

/* Slide templates are static, and main.js reloads the whole window when any file
   under the app changes, so this cache self-invalidates. */
var slide_html_cache = {};

export function fetch_slide_html(item_id){
    if (!slide_html_cache[item_id]){
        slide_html_cache[item_id] = fetch('./html/' + item_id + '.html')
            .then(response => response.text())
            .catch(err => {
                // Don't cache a failure — let the next attempt retry.
                delete slide_html_cache[item_id];
                throw err;
            });
    }
    return slide_html_cache[item_id];
}

/* The single owner of "swap to slide X".
   transition: 'fade' (default) fades the outgoing slide out first; 'none' swaps
   instantly, for re-mounting the slide that is already showing.
   The new HTML is fetched BEFORE the fade-out starts, so there is no dead gap
   between the old slide disappearing and the new one arriving.
   on_mount(root) runs while root is still at opacity 0. The caller fills the
   slide and then calls fade_in_slide(). */
export async function mount_slide(item_id, { on_mount = null, host_id = 'main-div', transition = 'fade' } = {}){
    var host = document.getElementById(host_id);
    var html = await fetch_slide_html(item_id);
    var old_root = host.firstElementChild;
    if (old_root && transition === 'fade'){
        old_root.classList.remove('is-visible');
        await wait_for_animations(old_root);
    }
    host.innerHTML = html;
    var root = host.firstElementChild;
    root.classList.add('slide-layer');
    if (transition === 'none'){
        root.classList.add('is-visible');
    }
    if (on_mount){
        on_mount(root);
    }
    return root;
}

export function fade_in_slide(root){
    if (!root){
        return Promise.resolve();
    }
    root.classList.add('is-visible');
    return wait_for_animations(root);
}


export function show_by_id(elem_id){
    var element = document.getElementById(elem_id);
    element.classList.add('show-element');
}


export function add_class_to_element_style(elem_id, class_name){
    var element = document.getElementById(elem_id);
    element.classList.add(class_name);
}

