'esversion: 8';
import { insert_html, append_html, activate_element, waitForElm } from "./main-div-setter.js";
import {current_date, get_date_from_Date, read_json} from "./read_data.js";
import {set_element_data, set_element_html, set_element_background, 
    get_element_background, set_element_background_image} from "./main-div-setter.js";
import {parse_hebrew_date, parse_sfirat_haomer} from "./parse_hebrew_date.js";
import {load_file} from "./scroll.js";
import { clockFunc } from "./clock-time.js";

var day_times;
var current_date_obj;
var wait_for_animation = false;
var main_div = 'main-div';

var my_promise = read_json("./data/day_times.json");
my_promise.then(times => {
    day_times = times;
    present_first_page(day_times);
});
var wait_seconds = 3;

function get_today_times(current_date){
    return day_times[current_date];
}

function present_hebrew_date_in_header(current_date){
    var today_times = get_today_times_according_to_sunset(current_date);
    set_element_data("hebrew_date", parse_hebrew_date(today_times['hebrew_date']));
}

function present_first_page(){
    var date = current_date();
    var current_date_var = get_date_from_Date(date);
    build_page_structure().then((promise) => {
        clockFunc();
    });
    loop_pages();
}

function present_header_dates(date){
    waitForElm('#header').then((elm) => {
        waitForElm('#hebrew_date').then((hebrew_date_elm) => {
            present_hebrew_date_in_header(date);
        });
        waitForElm('#gregorian_date').then((greg_date_elm) => {
            set_element_data("gregorian_date", get_date_from_Date(date));
        });
    });
}

function present_next_main_div(item){
    insert_html('./html/'+ item + '.html', "main-div");
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function sleep_seconds(seconds){
    return sleep(seconds * 1000);
}

function prepare_slide_show_pages(day_times_object){
    return ["tfilot_times", "sfirat_haomer"];
}

function get_slide_show_items_ids(){
    var date = current_date();
    var current_date_var = get_date_from_Date(date);
    var today_times = get_today_times(current_date_var);
    var slide_show_items = [];
    slide_show_items.push('tfilot');
    if (today_times['omer']){
        //slide_show_items.push('omer');
    }
    var week_day = date.getDay();
    if (week_day == 6 | week_day == 7){
        slide_show_items.push('shabat');
    }
    //slide_show_items.push('messages');
    //slide_show_items.push('tormim');
    return slide_show_items;
}


let shacharit_regular_days = ['06:00', '06:50', '08:30'];
let mincha_regular_days = ["19:20"];
let arvit_regular_days = ['20:00', '21:00'];
let shacharit_shabat = ['06:00', '07:20', '08:30'];
let mincha_shabat = ["13:20","14:00","18:00"];
let arvit_shabat = ['20:00'];


function present_prayer_times(current_date){
    var shacharit_times = shacharit_regular_days.join('<br>');
    var mincha_times = mincha_regular_days.join('<br>');
    var arvit_times = arvit_regular_days.join('<br>');
    set_element_html('shachrit-regulr-days', shacharit_times);
    set_element_html('mincha-regulr-days', mincha_times);
    set_element_html('arvit-regulr-days', arvit_times);
    return sleep_seconds(wait_seconds);
}

function present_shabat_prayer_times(current_date){
    var shacharit_times = shacharit_shabat.join('<br>');
    var mincha_times = mincha_shabat.join('<br>');
    var arvit_times = arvit_shabat.join('<br>');
    set_element_html('kabalat-shabat', "19:00");
    set_element_html('shachrit-shabat', shacharit_times);
    set_element_html('mincha-shabat', mincha_times);
    set_element_html('arvit-shabat', arvit_times);
    return sleep_seconds(wait_seconds);
}

function present_sfirat_haomer(current_date){
    var elem_id = 'omer-count';
    var today_times = get_today_times_according_to_sunset(current_date);
    var omer_numeric = today_times['omer'];
    var omer_hebrew = parse_sfirat_haomer(omer_numeric);
    set_element_data(elem_id, omer_hebrew);
    var background_image_url = get_element_background(main_div);
    set_element_background(main_div, 'omer');
    return sleep_seconds(wait_seconds).then(() => {
        set_element_background_image(main_div, background_image_url);
    });
}

function get_data_presedence(key, precedence_items){
    for(var item of precedence_items){
        if (item && item[key]){
            return item[key];
        }
    }
    return '';
}

function present_shabat_times(date){
    read_json('./data/special_day_timeline.json').then(data => {
        var items = [];
        var general_times = data['shabat'];
        var today_special_times = data[get_date_from_Date(date)];
        var precedence_items = [today_special_times, general_times];
        var order = get_data_presedence('order', precedence_items);
        console.log(order);
        for (var item of order){
            var item_data = get_data_presedence(item, precedence_items);
            if (item_data){
                items.push(item_data);
            }
        }
        console.log(items);
        return items;
    }).then(data => {
        var res_html = '';
        for (var prayer_time of data){
            res_html += "<p class='my-text'>" + prayer_time + "</p>";
        }
        set_element_html("shabat", res_html);
    });
    return sleep_seconds(wait_seconds);
}

function scroll_updated(){
    console.log('scroll updated');
}

function present_donators(date){
    load_file('tormim.txt').then(data => {
        var content = data.split("\n").join("<br>");
        document.getElementById('output')
            .innerHTML=content;
      });
    var el = document.getElementsByClassName('scroll-text')[0];
    wait_for_animation = true;
    el.addEventListener('animationend', () => {
        console.log('Animation ended');
        wait_for_animation = false;
      });
    return waitForAnimation();
}

function present_messages(date){
    function display_message(messages_list, elem){
        var message = messages_list[0];
        console.log("message for display: " + message);
        var res_html = "<p class='my-text'>" + message +  "</p>";
        elem.innerHTML=res_html;
        messages_list.shift();
        return sleep_seconds(wait_seconds).then(() => {
            if (messages_list.length) {
                return display_message(messages_list, elem);
            }
        });
    }

    return load_file('./data/messages.txt').then(data => {
        var messages_list = data.split("\n");
        console.log("messages: " + data);
        var elem = document.getElementById('messages-text');
        var total_messages_time = wait_seconds * messages_list.length;
        display_message(messages_list, elem);
        return sleep_seconds(total_messages_time);
      });
}

function set_main_area_background(date){
    var background = 'regular';
    if (date.getDay() == 6){
        background = 'shabat_2';
    }
    set_element_background('main-div', background);
    
}

let item_funcs = {
    'tfilot': present_prayer_times,
    'omer': present_sfirat_haomer,
    'shabat': present_shabat_prayer_times,
    'tormim': present_donators,
    'messages': present_messages
};

async function loop_pages(){
    var iter = 0;
    while (iter <= 1000){
        iter = iter +1;
        current_date_obj = current_date();
        set_main_area_background(current_date_obj);
        present_header_dates(current_date_obj);
        for (var item of get_slide_show_items_ids()){
            await insert_html('./html/'+ item + '.html', "main-div");
            var item_func = item_funcs[item];
            activate_element(item, "main-div");
            await item_func(current_date_obj);
        }
    }
}

function build_page_structure(){
    return insert_html('./html/header.html', "header");
}

function is_after_sunset(date){
    var current_date_var = get_date_from_Date(date);
    var today_times = get_today_times(current_date_var);
    var sunset_time = new Date(date);
    var sunset_hour_and_minutes = today_times['sunset'].split(':');
    sunset_time.setHours(sunset_hour_and_minutes[0], sunset_hour_and_minutes[1], '00');
    return date > sunset_time;
}

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function get_today_times_according_to_sunset(date){
    var current_date_var = get_date_from_Date(date);
    var today_times = get_today_times(current_date_var);
    if (is_after_sunset(date)){
        var tommorow_date = addDays(date, 1);
        var tommorow_date_var = get_date_from_Date(tommorow_date);
        today_times = get_today_times(tommorow_date_var);
    }
    return today_times;
}

function animationsTest (callback) {
    // Test if ANY/ALL page animations are currently active

    var testAnimationInterval = setInterval(function () {
        if (!wait_for_animation) { // any page animations finished
            clearInterval(testAnimationInterval);
            callback();
        }
    }, 25);
};

function waitForAnimation () {
    // Test if ANY/ALL page animations are currently active
    return new Promise((resolve) => {
        var testAnimationInterval = setInterval(function () {
            if (!wait_for_animation) { // any page animations finished
                clearInterval(testAnimationInterval);
                console.log('finished animation');
                resolve();
            }
        }, 25);
    });
};