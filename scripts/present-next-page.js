'esversion: 8';
import { insert_html, append_html, activate_element, deactivate_element,
    waitForElm, wait_for_scroll, toggle_element_show } from "./main-div-setter.js";
import {current_date, get_date_from_Date, read_json} from "./read_data.js";
import {set_element_data, set_element_html, set_element_background, 
    get_element_background, set_element_background_image} from "./main-div-setter.js";
import {get_hebrew_date, parse_sfirat_haomer} from "./parse_hebrew_date.js";
import {load_file} from "./scroll.js";
import { clockFunc } from "./clock-time.js";

var day_times, week_times, advertisements;
var current_date_obj;
var main_div = 'main-div';

async function read_initial_data(){
    return read_json("./data/parsed_dates.json").then(times => {
        day_times = times;
        return read_json("./data/mincha_maariv.json").then(prayer_times => {
            week_times = prayer_times;
            return read_json("./data/advertisements.json").then(ads => {
                advertisements = ads;
            });
        });
    });
}

read_initial_data().then(() => {
    present_first_page(day_times);
});
var wait_seconds = 15;
var message_wait_seconds = 5;
var ad_wait_seconds = 10;
var donators_start_point = 0;
var donators_slice_count = 20;

function get_today_times(current_date){
    return day_times[current_date];
}

function present_hebrew_date_in_header(current_date){
    var today_times = get_today_times_according_to_sunset(current_date);
    set_element_data("hebrew_date", today_times['hebrew_date']);
}

function present_first_page(){
    var date = current_date();
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
    if (date.getDay() >= 4){
        slide_show_items.push('shabat');
    }
    slide_show_items.push('messages');
    slide_show_items.push('tormim');
    slide_show_items.push('advertisement');
    return slide_show_items;
}


let shacharit_regular_days = ['06:00', '06:50', '08:30(שישי)'];
let kabalat_shabat = ['17:20*', '18:39', "<span class='small-text'>*מוקדמת</span>"];
let shacharit_shabat = ['06:00', '07:20', '08:30'];
let mincha_shabat = ["13:15","14:00","18:00"];
let arvit_shabat = ['19:29', '19:44'];

function get_week_start_date(current_date){
    var start_of_week = new Date(current_date);
    start_of_week.setDate(current_date.getDate() - current_date.getDay());
    return start_of_week;
}

function get_week_times(current_date){
    var week_start_date = get_week_start_date(current_date);
    return week_times[get_date_from_Date(week_start_date)];
}

function get_single_prayer_times_from_date_obj(date_obj, prayer_name){
    var prayer_times = date_obj[prayer_name];
    if (Array.isArray(prayer_times)){
        prayer_times = prayer_times.join('<br>');
    }
    return prayer_times;
}

function present_prayer_times(current_date){    
    var shacharit_times = shacharit_regular_days.join('<br>');
    var this_week_times = get_week_times(current_date);
    var mincha_times = get_single_prayer_times_from_date_obj(this_week_times, 'mincha');
    var arvit_times = get_single_prayer_times_from_date_obj(this_week_times, 'maariv');
    set_element_html('shachrit-regulr-days', shacharit_times);
    set_element_html('mincha-regulr-days', mincha_times);
    set_element_html('arvit-regulr-days', arvit_times);
    return sleep_seconds(wait_seconds);
}

function present_shabat_prayer_times(current_date){
    var kabalat_shabat_times = kabalat_shabat.join('<br');
    var shacharit_times = shacharit_shabat.join('<br>');
    var mincha_times = mincha_shabat.join('<br>');
    var arvit_times = arvit_shabat.join('<br>');
    set_element_html('kabalat-shabat', "17:15*<br>18:42<br><span class='small-text'>*מוקדמת</span>");
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

function present_donators(date){
    load_file('./data/tormim.txt').then(lines => {
        var donators_end_point = donators_start_point + donators_slice_count;
        if(lines.length - donators_start_point > donators_slice_count && 
            lines.length - (donators_start_point + donators_slice_count) < donators_slice_count/2){
            donators_end_point = lines.length;
        }
        var lines_for_present = lines.slice(donators_start_point, donators_end_point);
        if(donators_end_point >= lines.length){
            donators_start_point = 0;
        } else {
            donators_start_point += donators_slice_count;
        }
        var content = lines_for_present.join("<br>");
        document.getElementById('output')
            .innerHTML=content;
      });
    return wait_for_scroll(document.getElementById('output'));
}

async function present_messages(date){
    async function display_message(messages_list, elem){
        var message = messages_list[0];
        elem.innerText = message;
        elem.classList.add('fade-in');
        await wait_for_scroll(elem);
        elem.classList.remove('fade-in');
        messages_list.shift();
        return sleep_seconds(message_wait_seconds).then(() => {
            if (messages_list.length) {
                return display_message(messages_list, elem);
            }
        });
    }

    return load_file('./data/messages.txt').then(messages_list => {
        var elem = document.getElementById('messages-text');
        return display_message(messages_list, elem);
      });
}

function set_main_area_background(date){
    var background = "images/mishkan-tkiya.JPG";
    if (date.getDay() == 6){
        background = 'shabat_2';
    }
    var body_elem = document.getElementsByTagName('body')[0];
    set_element_background_image(body_elem, background);
    
}

function should_present_ad_between_dates(ad_definition, current_date){
    var is_after_from = true;
    var is_before_until = true;
    if (ad_definition["from"]){
        var from_date = new Date(ad_definition["from"]);
        if (current_date < from_date){
            is_after_from = false;
        }
    }
    if (ad_definition["until"]){
        var from_date = new Date(ad_definition["until"]);
        if (current_date > from_date){
            is_before_until = false;
        }
    }
    return is_after_from && is_before_until;
}

function should_present_ad_in_weekday(ad_definition, current_date){
    var is_in_weekdays = true;
    var current_day = current_date.getDay();
    if (ad_definition.weekdays){
        if (!ad_definition.weekdays.includes(current_day)){
            is_in_weekdays = false;
        }
    }
    return is_in_weekdays;
}

function get_advertisements(current_date){
    var ads = [];
    for (var [key,advertisement_definition] of Object.entries(advertisements)){
        var present_ad = true;
        if (!should_present_ad_between_dates(advertisement_definition, current_date)){
            present_ad = false;
        }
        if (!should_present_ad_in_weekday(advertisement_definition, current_date)){
            present_ad = false;
        }

        if (present_ad){
            ads.push(advertisement_definition);
        }
    }
    return ads;
}

async function present_advertisement(current_date){
    var body = document.getElementsByTagName('body')[0];
    var header_element = document.getElementsByTagName('header')[0];
    var main_div_element = document.getElementById('main-div');
    toggle_element_show(header_element, true);
    toggle_element_show(main_div_element, true);
    var body_classes = body.className;
    body.className = 'advertisement';
    for (var ad_definition of get_advertisements(current_date)){
        var ad_file_name = ad_definition.image;
        set_element_background_image(body, 'images/' + ad_file_name);
        var exposure_time = ad_definition.exposure_time_seconds || ad_wait_seconds;
        await sleep_seconds(exposure_time);
    }
    body.className = body_classes;
    toggle_element_show(header_element, false);
    toggle_element_show(main_div_element, false);
}

let item_funcs = {
    'tfilot': present_prayer_times,
    'omer': present_sfirat_haomer,
    'shabat': present_shabat_prayer_times,
    'tormim': present_donators,
    'messages': present_messages,
    'advertisement': present_advertisement
};

async function loop_pages(){
    while (true){
        current_date_obj = current_date();
        set_main_area_background(current_date_obj);
        present_header_dates(current_date_obj);
        for (var item of get_slide_show_items_ids()){
            if (item == 'advertisement'){
                await present_advertisement(current_date_obj);
            }else{
                await insert_html('./html/'+ item + '.html', "main-div");
                var item_func = item_funcs[item];
                activate_element(item);
                await item_func(current_date_obj);
                await deactivate_element(item);
            }
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
