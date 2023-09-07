'esversion: 8';
import { insert_html, append_html, activate_element, deactivate_element,
    waitForElm, wait_for_scroll, toggle_element_show, show_by_id } from "./main-div-setter.js";
import {current_date, get_date_from_Date, get_date_from_Date_for_header, read_json} from "./read_data.js";
import {set_element_data, set_element_html, set_element_background, insert_html_at_start_of_element,
    insert_html_at_end_of_element,
    get_element_background, set_element_background_image} from "./main-div-setter.js";
import {get_hebrew_date, parse_sfirat_haomer, omer_days_count_to_hebrew, omer_days_count_to_hebrew_weeks} from "./parse_hebrew_date.js";
import {load_file} from "./scroll.js";
import { clockFunc } from "./clock-time.js";

const chokidar = require('chokidar');
async function watch_files(){
    chokidar.watch(data_dir).on('all', (event, path) => {
        console.log(event, path);
        if(event == 'change'){
            read_initial_data()
            var main_div_elem_id = "main-div";
            load_html_into_page_elem_end("data_updated_notification.html", main_div_elem_id);
            setTimeout(function(){
                var notification_elem = document.getElementById("data_updated_notification");
                notification_elem.classList.add('fade-out');
                wait_for_scroll(notification_elem).then(() => {notification_elem.remove()});
            }, 10000);
        }
      });
}

var day_times, week_times, shabat_times, advertisements;
var current_date_obj;
var main_div = 'main-div';
var base_data_folder = process.env.npm_config_data_dir || ".";
var data_dir = `${base_data_folder}/data`;
var images_dir = `${base_data_folder}/images`;
console.log(data_dir);

async function read_initial_data(){
    return read_json(`${data_dir}/parsed_dates.json`).then(times => {
        day_times = times;
    }).then(() => {
        return read_json(`${data_dir}/mincha_maariv_v2.json`).then(prayer_times => {
            week_times = prayer_times;
        });
    }).then(() => {
        return read_json(`${data_dir}/shabat.json`).then(prayer_times => {
            shabat_times = prayer_times;
        });
    }).then(() => {
        return read_json(`${data_dir}/advertisements.json`).then(ads => {
            advertisements = ads;
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
    var hebrew_date_text = today_times['hebrew_date'];
    if (is_night(current_date)){
        hebrew_date_text = "אור ל" + hebrew_date_text;
    }
    set_element_data("hebrew_date", hebrew_date_text);
}

function present_first_page(){
    var date = current_date();
    build_page_structure().then((promise) => {
        clockFunc();
        watch_files();
    });
    loop_pages();
}

function present_header_dates(date){
    waitForElm('#header').then((elm) => {
        waitForElm('#hebrew_date').then((hebrew_date_elm) => {
            present_hebrew_date_in_header(date);
        });
        waitForElm('#gregorian_date').then((greg_date_elm) => {
            set_element_data("gregorian_date", get_date_from_Date_for_header(date));
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

function is_between_dates(date, start_date, end_date){
    var is_between_dates = true;
    if (start_date){
        is_between_dates = date >= new Date(start_date);
    }
    if (end_date){
        is_between_dates = is_between_dates && date <= new Date(end_date);
    }
    return is_between_dates;
}

function is_in_weekdays(date, weekdays){
    return weekdays.includes(date.getDay());
}

function is_shacharit_8_30(date){
    if(is_between_dates(date, '2023-06-24', '2023-08-29')){
        return true;
    }
    return false;
}

function is_weekend(date){
    return is_in_weekdays(date, [5]) | (is_in_weekdays(date, [6]) && is_before_time(date, '16:00'));
}

function is_shabat_time(date){
    return (is_in_weekdays(date, [5]) && is_after_time(date, '18:30')) | (is_in_weekdays(date, [6]) && is_before_time(date, '21:00'));
}

function is_purim(date){
    return is_between_dates(date, "2023-03-06T13:00", "2023-03-07T18:00");
}

function is_present_pesach_eve(date){
    return is_between_dates(date, "2023-04-04T17:00", "2023-04-05T17:00");
}

function is_taanit(date){
    return is_between_dates(date, "2023-07-25T23:00", "2023-07-27T23:00");
}

function is_pesach_eve(date){
    return is_between_dates(date, "2023-04-05T00:00", "2023-04-05T17:00");
}

function is_pesach_first_chag(date){
    return is_between_dates(date, "2023-04-05T17:00", "2023-04-06T19:45:00");
}

function is_shavout(date){
    return is_between_dates(date, "2023-05-25T11:00", "2023-05-26T18:30:00");
}

function is_elul(date){
    return is_between_dates(date, "2023-08-17T00:00", "2023-09-18T23:00");
}

function is_rosh_hashana_eve(date){
    return is_between_dates(date, "2023-09-14T00:01", "2023-09-15T19:00");
}

function get_specific_single_page(current_date){
    var item = null
    if(is_shabat_time(current_date_obj)){
        item = 'shabat_single_page'
    } else if(is_pesach_first_chag(current_date_obj)){
        item = 'pesach_single_page'
    } else if(is_shavout(current_date_obj)){
        item = 'shavuot_single_page'
    } else if(is_rosh_hashana_eve(current_date_obj)){
        item = 'rosh_hashana_eve_single_page'
    }
    return item
}


function get_slide_show_items_ids(){
    //return ['advertisement'];
    var date = current_date();
    var current_date_var = get_date_from_Date(date);
    var today_times = get_today_times(current_date_var);
    var slide_show_items = [];
    if(!is_weekend(date) & !is_pesach_eve(date) & !is_taanit(date)){
        slide_show_items.push('tfilot_single_page');
    }
    if(is_taanit(date)){
        slide_show_items.push('taanit');
    }
    if (is_in_weekdays(date, [4,5])){
        slide_show_items.push('friday_single_page');
    }
    if (is_between_dates(date, "2023-09-14T10:00", "2023-09-15T19:10")){
        slide_show_items.push('rosh_hashana_eve');
    }
    if (is_between_dates(date, "2022-09-23T10:00", "2022-09-26T19:30")){
        slide_show_items.push('rosh_hashana_a');
    }
    if (is_between_dates(date, "2022-09-26T17:00", "2022-09-27T19:30")){
        slide_show_items.push('rosh_hashana_b');
    }
    if (is_between_dates(date, "2022-10-03T05:00", "2022-10-04T19:30")){
        slide_show_items.push('kipur_eve');
    }
    if (is_between_dates(date, "2022-10-04T05:00", "2022-10-05T19:30")){
        slide_show_items.push('kipur');
    }
    if (is_between_dates(date, "2022-10-09T05:00", "2022-10-09T19:30")){
        slide_show_items.push('sukot_eve');
    }
    if (is_between_dates(date, "2022-10-09T05:00", "2022-10-10T19:30")){
        slide_show_items.push('sukot');
    }
    if (is_between_dates(date, "2022-10-15T17:00", "2022-10-16T13:30")){
        slide_show_items.push('hoshana_raba');
    }
    if (is_between_dates(date, "2022-10-15T17:00", "2022-10-17T18:50")){
        slide_show_items.push('simchat_tora_eve');
        slide_show_items.push('simchat_tora');
    }
    if (today_times['omer']){
        //slide_show_items.push('omer');
    }
    if (is_purim(date)){
        slide_show_items.push('purim');
        slide_show_items.push('megila');
    }

    if(is_present_pesach_eve(date)){
        slide_show_items.push('pesach_eve')
    }
    
    //slide_show_items.push('day_times');
    //slide_show_items.push('messages');
    //slide_show_items.push('tormim');
    slide_show_items.push('advertisement');
    return slide_show_items;
}


let shacharit_regular_days = ['06:00', '06:50', '08:30(שישי)'];
let kabalat_shabat = ['17:46', '17:56'];
let shacharit_shabat = ['06:00', '07:20', '08:30'];
let mincha_shabat = ["13:15","14:00","17:15"];
let arvit_shabat = ['18:44', '19:00'];

function get_week_start_date(current_date){
    var start_of_week = new Date(current_date);
    start_of_week.setDate(current_date.getDate() - current_date.getDay());
    return start_of_week;
}

function get_next_week_start_date(current_date){
    var start_of_next_week = new Date(current_date);
    start_of_next_week.setDate(current_date.getDate() - current_date.getDay() + 7);
    return start_of_next_week;
}

function get_this_shabat_date(current_date){
    var shabat_date = new Date(current_date);
    shabat_date.setDate(current_date.getDate() + 6 - current_date.getDay());
    return shabat_date;
}

function get_date_plus_minutes(current_date, initial_time, add_minutes){
    var result = new Date(current_date);
    result.setMinutes(current_date.getMinutes() + add_minutes);
    return result;
}

function get_week_times(current_date){
    var week_start_date = get_week_start_date(current_date);
    return week_times[get_date_from_Date(week_start_date)];
}

function get_next_week_times(current_date){
    var week_start_date = get_next_week_start_date(current_date);
    return week_times[get_date_from_Date(week_start_date)];
}

function get_shabat_times(current_date){
    var shabat_date = get_this_shabat_date(current_date);
    return shabat_times[get_date_from_Date(shabat_date)];
}

function get_single_prayer_times_from_date_obj(date_obj, prayer_name){
    var prayer_times = date_obj[prayer_name];
    return prayer_times;
}

function round_to_five(some_date){
    var hour_and_minutes = some_date.split(':');
    var minutes = parseInt(hour_and_minutes[1]);
    var modulu_five = minutes % 5;
    var minutes_diff = 0;
    if (modulu_five == 1){
        minutes_diff = -1;
    } else if (modulu_five > 1){
        minutes_diff = 5 - modulu_five;
    }
    var rounded = add_minutes_to_time(some_date, minutes_diff);
    return rounded;
}

function show_slichot(date){
    if(is_between_dates(date, '2023-09-09', '2023-09-22T10:00')){
        set_element_data('shacharit_a', '05:50');
        set_element_data('shacharit_b', '06:55');
        var elements = document.getElementsByClassName('slichot');
        for (var element of elements){
            element.classList.add('show-element');
        }
    }
}

function show_siftei_renanot(date){
    if(is_elul(date)){
        var elements = document.getElementsByClassName('slichot');
        for (var element of elements){
            element.classList.add('show-element');
        }
    }
}

function show_shacharit_8_30(){
    var elements = document.getElementsByClassName('friday-shacharit');
    for (var element of elements){
        element.classList.add('show-element');
    }
}

function get_omer_numeric(date){
    var omer_start_date = new Date('2023-04-07');
    var omer_time_diff = date - omer_start_date;
    var omer_days = Math.ceil(omer_time_diff / (1000 * 3600 * 24));
    if(is_after_sunset(date)){
        omer_days += 1;
    }
    return omer_days;
}

function set_sfirat_haomer_regular_days(date, two_lines){
    var laomer = 'לעומר';
    var omer_numeric = get_omer_numeric(date);
    var omer_days = omer_days_count_to_hebrew(omer_numeric);
    var omer_weeks = omer_days_count_to_hebrew_weeks(omer_numeric);
    if(omer_weeks){
        omer_weeks = [omer_weeks, laomer].join(' ');
        show_by_id('omer-text-weeks');
    } else{
        omer_days = [omer_days, laomer].join(' ');
    }
    if(two_lines){
        set_element_data('omer-text', omer_days);
        set_element_data('omer-text-weeks', omer_weeks);
    } else{
        set_element_data('omer-text', omer_days + ' ' + omer_weeks);
    }
    
}

async function show_sfirat_haomer_if_needed(current_date, into_elem_id, two_lines){
    if(is_between_dates(current_date, '2023-04-07', '2023-05-25T19:00')){
        load_html_into_page_elem_end('omer_fouter.html', into_elem_id, () => {
            set_sfirat_haomer_regular_days(current_date, two_lines);
            show_by_id('omer');
        });
    }
}

async function show_footer_custom_message_if_needed(current_date, into_elem_id){
    var message = '';
    if(is_between_dates(current_date, '2023-09-07', '2023-09-10T03:00')){
        message = 'סליחות במוצאי שבת בשעה 00:35';
        load_html_into_page_elem_end('custom_fouter.html', into_elem_id, () => {
            set_element_data('footer-custom-message', message);
            show_by_id('custom-footer');
        });
    }
}

async function present_prayer_times_single_page(current_date){
    var this_week_times;
    if ([5,6].includes(current_date.getDay())){
        this_week_times = get_next_week_times(current_date);
    } else {
        this_week_times = get_week_times(current_date);
    }
    var mincha_time = get_single_prayer_times_from_date_obj(this_week_times, 'mincha');
    var arvit_time = get_single_prayer_times_from_date_obj(this_week_times, 'maariv');
    load_html_into_page_elem_start('shacharit.html', 'prayer_times', () => {
        if(is_shacharit_8_30(current_date)){
            show_shacharit_8_30();
        }
        show_slichot(current_date);
    });

    load_html_into_page_elem_end('mincha_arvit.html', 'prayer_times', () => {
        set_element_html('mincha-regulr-days', mincha_time);
        set_element_html('arvit-regulr-days', arvit_time);
    });

    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date, true);
    });
    show_sfirat_haomer_if_needed(current_date, 'tfilot_single_page', true);
    show_footer_custom_message_if_needed(current_date, 'tfilot_single_page');
    return sleep_seconds(wait_seconds*10);
}

async function  present_megila_times(){
    load_html_into_page('megila_times_night.html', 'night');
    load_html_into_page('megila_times_day.html', 'day');
    return sleep_seconds(wait_seconds*5);
}

async function present_purim_times(current_date){
    load_html_into_page_elem_start('purim_tfilot.html', 'prayer_times');
    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date, true);
    });
    return sleep_seconds(wait_seconds*5);
}

async function present_taanit_times(current_date){
    load_html_into_page_elem_start('tisha_beav.html', 'taanit_times');

    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date, true);
    });
    return sleep_seconds(wait_seconds*5);
}

async function present_prayer_times(current_date){    
    var shacharit_times = shacharit_regular_days.join('<br>');
    var this_week_times;
    if ([5,6].includes(current_date.getDay())){
        this_week_times = get_next_week_times(current_date);
    } else {
        this_week_times = get_week_times(current_date);
    }
    var mincha_times = get_single_prayer_times_from_date_obj(this_week_times, 'mincha');
    var arvit_times = get_single_prayer_times_from_date_obj(this_week_times, 'maariv');
    document.getElementById("prayer-times-title-parasha").innerText = this_week_times['parasha'];

    return load_html_into_page('shacharit.html', 'tfilot_times', () => {
        show_slichot(current_date);
        append_html('mincha_arvit.html', 'tfilot_times').then(() => {
            set_element_html('mincha-regulr-days', mincha_times);
            set_element_html('arvit-regulr-days', arvit_times[0]);
        });
        if(is_between_dates(current_date, '2022-10-10', '2022-10-13T10:00')){
            var elements = document.getElementsByClassName('friday-shacharit');
            for (var element of elements){
                element.classList.add('show-element');
            }
        }
    });
    //.then(response => {
    //    append_html('mincha_arvit.html', 'tfilot_times').then()
    //    set_element_html('mincha-regulr-days', mincha_times);
    //    set_element_html('arvit-regulr-days', arvit_times[0]);
    //    return sleep_seconds(wait_seconds);
    //});
}


function present_day_times(current_date, show_talit_tfilin){
    if (show_talit_tfilin){
        var elements = document.getElementsByClassName('talit_tfilin');
        for (var element of elements){
            element.classList.add('show-element');
        }
    }
    set_element_data('talit_tfilin', format_hour_and_minutes(get_today_talit_and_tfilin(current_date)));
    set_element_data('sunrise', format_hour_and_minutes(get_today_sunrise(current_date)));
    set_element_data('shma_end', format_hour_and_minutes(get_today_shma_end(current_date)));
    set_element_data('mincha_gedola', format_hour_and_minutes(get_today_mincha_gedola(current_date)));
    set_element_data('sunset', format_hour_and_minutes(get_today_sunset(current_date)));
    set_element_data('stars', format_hour_and_minutes(get_today_stars(current_date)));
    return sleep_seconds(wait_seconds);
}

async function present_rosh_eve_times(date){
    //set_element_data('chag_name', 'ראש השנה');
    fetch('./html/rosh_hashana_eve_1.html')
    .then(response => response.text())
    .then(lines => {
        set_element_html('rosh_hashana_times', lines);
    });
    await sleep_seconds(wait_seconds);
    fetch('./html/rosh_hashana_eve_2.html')
    .then(response => response.text())
    .then(lines => {
        set_element_html('rosh_hashana_times', lines);
    });
    return sleep_seconds(wait_seconds);
}

async function present_rosh_a_times(date){
    //set_element_data('chag_name', 'ראש השנה');
    await sleep_seconds(wait_seconds);
    fetch('./html/rosh_hashana_a_2.html')
    .then(response => response.text())
    .then(lines => {
        set_element_html('rosh_hashana_times', lines);
    });
    return sleep_seconds(wait_seconds);
}

async function present_rosh_b_times(date){
    //set_element_data('chag_name', 'ראש השנה');
    fetch('./html/rosh_hashana_b_1.html')
    .then(response => response.text())
    .then(lines => {
        set_element_html('rosh_hashana_times', lines);
    });
    await sleep_seconds(wait_seconds);
    fetch('./html/rosh_hashana_b_2.html')
    .then(response => response.text())
    .then(lines => {
        set_element_html('rosh_hashana_times', lines);
    });
    return sleep_seconds(wait_seconds);
}


function load_html_into_page(html_file_name, parent_element, callback){
    fetch('./html/' + html_file_name)
    .then(response => response.text())
    .then(lines => {
        set_element_html(parent_element, lines);
        if(callback){
            callback();
        }
    });
    return sleep_seconds(wait_seconds);
}

function load_html_into_page_elem_start(html_file_name, parent_element, callback){
    fetch('./html/' + html_file_name)
    .then(response => response.text())
    .then(lines => {
        insert_html_at_start_of_element(parent_element, lines);
        if(callback){
            callback();
        }
    });
    return sleep_seconds(wait_seconds);
}

function load_html_into_page_elem_end(html_file_name, parent_element, callback){
    fetch('./html/' + html_file_name)
    .then(response => response.text())
    .then(lines => {
        insert_html_at_end_of_element(parent_element, lines);
        if(callback){
            callback();
        }
    });
    return sleep_seconds(wait_seconds);
}

function get_pesach_times(){
    return ["18:39", "19:39"];
}

async function present_pesach_eve(current_date){
    load_html_into_page_elem_start('shacharit.html', 'tfilot_times', () => {
        var elements = document.getElementsByClassName('friday-shacharit');
        for (var element of elements){
            element.classList.add('show-element');
        }
    });
    
    load_html_into_page_elem_end('pesach_eve_times.html', 'tfilot_times', () => {
        var pesach_times = get_pesach_times();
        var pesach_in = pesach_times[0]
        set_element_html('hadlakat-nerot', pesach_in);
        set_element_html('kabalat-shabat', add_minutes_to_time(pesach_in, 10));
    });

    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date, true);
    });
    return sleep_seconds(wait_seconds*5);
}


async function present_pesach_times(current_date){
    var pesach_times = get_pesach_times();
    var pesach_in = pesach_times[0];
    var pesach_out = pesach_times[1];
    load_html_into_page_elem_start('pesach_eve_times.html', 'first_column', () => {
        set_element_html('hadlakat-nerot', pesach_in);
        set_element_html('kabalat-shabat', add_minutes_to_time(pesach_in, 10));
    });
    
    set_element_html('arvit-shabat', pesach_out);
    set_element_html('arvit-shabat-2', add_minutes_to_time(pesach_out, 15));

    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date);
    });
    return sleep_seconds(10*60);
}

async function present_shavuot_prayer_times(current_date){
    load_html_into_page_elem_end('shavuot_right_column.html', 'first_column');
    load_html_into_page_elem_end('shavuot_afternoon.html', 'second_column');
    load_html_into_page_elem_end('shavuot_shiurim.html', 'shiurim');
    
    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date);
    });
    return sleep_seconds(10*60);
}

async function present_rosh_hashana_prayer_times(current_date){
    load_html_into_page_elem_end('rosh_hashana_eve_1.html', 'first_column');
    load_html_into_page_elem_end('rosh_hashana_eve_2.html', 'first_column');
    
    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date);
    });
    return sleep_seconds(10*60);
}

async function present_shabat_prayer_times(current_date){
    var this_week_times = get_week_times(current_date);
    var this_shabat_times = get_shabat_times(current_date);
    document.getElementById("prayer-times-title-parasha").innerText = this_shabat_times['parasha'];
    var shabat_in = this_shabat_times["in"];
    var arvit_shabat = this_shabat_times["out"];
    var mincha_ktana = '18:00';

    load_html_into_page_elem_start('friday_times.html', 'first_column', () => {
        set_element_html('hadlakat-nerot', shabat_in);
        set_element_html('kabalat-shabat', add_minutes_to_time(shabat_in, 10));
    });
    load_html_into_page_elem_end('shabat_first_column.html', 'first_column', () => {
        show_siftei_renanot(current_date);
    });

    load_html_into_page_elem_start('shabat_3.html', 'second_column', () => {
        set_element_html('lesson-halacha', add_minutes_to_time(mincha_ktana, -60));
        set_element_html('mincha-ktana', mincha_ktana);
        set_element_html('tehilim', mincha_ktana);
        set_element_html('lesson-pirkei-avot', add_minutes_to_time(mincha_ktana, 20));

        set_element_html('arvit-shabat', arvit_shabat);
        set_element_html('arvit-shabat-2', add_minutes_to_time(arvit_shabat, 15));
    });

    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date);
    });

    this_week_times = get_next_week_times(current_date);
    var mincha_time = get_single_prayer_times_from_date_obj(this_week_times, 'mincha');
    var arvit_time = get_single_prayer_times_from_date_obj(this_week_times, 'maariv');
    set_element_html('mincha-regulr-days', mincha_time);
    set_element_html('arvit-regulr-days', arvit_time);

    show_sfirat_haomer_if_needed(current_date, 'shabat_single_page', false);
    show_footer_custom_message_if_needed(current_date, 'shabat_single_page');
    return sleep_seconds(10*60);
}

function load_friday_shacharit_times(current_date){
    return load_html_into_page('shacharit.html', 'friday_prayers', () => {
        show_slichot(current_date);
        var elements = document.getElementsByClassName('friday-shacharit');
        for (var element of elements){
            element.classList.add('show-element');
        }
    });
}

async function present_kipur_eve_times(current_date){
    await sleep_seconds(wait_seconds);
    return load_html_into_page('kipur_eve_a.html', 'tfilot_times');
}

async function present_kipur_times(current_date){
    await sleep_seconds(wait_seconds);
    return load_html_into_page('kipur_a.html', 'tfilot_times');
}
async function present_sukot_eve_times(current_date){
    return sleep_seconds(wait_seconds);
}

async function present_sukot_times(current_date){
    await sleep_seconds(wait_seconds);
    return load_html_into_page('sukot_a.html', 'tfilot_times');
}

async function present_hoshana_raba_times(current_date){
    return sleep_seconds(wait_seconds);
}

async function present_simchat_tora_eve_times(current_date){
    return sleep_seconds(wait_seconds);
}

async function present_simchat_tora_times(current_date){
    await sleep_seconds(wait_seconds);
    await load_html_into_page('simchat_tora_a.html', 'tfilot_times');
    return load_html_into_page('simchat_tora_b.html', 'tfilot_times');
}

async function present_friday_single_page(current_date){
    var this_week_times = get_week_times(current_date);
    var this_shabat_times = get_shabat_times(current_date);
    var shabat_in = this_shabat_times["in"];
    document.getElementById("prayer-times-title-parasha").innerText = this_shabat_times['parasha'];
    
    load_html_into_page_elem_start('shacharit.html', 'friday_prayers', () => {
        show_slichot(current_date);
        var elements = document.getElementsByClassName('friday-shacharit');
        for (var element of elements){
            element.classList.add('show-element');
        }
    });
    
    var plag = get_today_plag(current_date);
    var rounded = round_to_five(plag);
    var kabalat_shabat_early_mincha = add_minutes_to_time(rounded, -20);
    load_html_into_page_elem_end('kabalat_shabat_early.html', 'plag', () => {
        set_element_html('kabalat-shabat-early-mincha', format_hour_and_minutes(kabalat_shabat_early_mincha));
        set_element_html('kabalat-shabat-early', format_hour_and_minutes(plag));
    });
    
    load_html_into_page_elem_end('friday_times.html', 'kabalat-shabat-parent', () => {
        set_element_html('hadlakat-nerot', shabat_in);
        set_element_html('kabalat-shabat', add_minutes_to_time(shabat_in, 10));
    });

    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date, true);
    });
    show_sfirat_haomer_if_needed(current_date, 'friday_single_page', true);
    show_footer_custom_message_if_needed(current_date, 'friday_single_page')
    return sleep_seconds(wait_seconds*5);
}

async function present_friday_prayer_times(current_date){
    var this_week_times = get_week_times(current_date);
    var this_shabat_times = get_shabat_times(current_date);
    var shabat_in = this_shabat_times["in"];
    document.getElementById("prayer-times-title-parasha").innerText = this_week_times['parasha'];
    
    if(is_in_weekdays(current_date, [4]) || (is_in_weekdays(current_date, [5]) && !is_after_time(current_date, '10:00'))){
        load_html_into_page_elem_start('shacharit.html', 'friday_prayers', () => {
            show_slichot(current_date);
            var elements = document.getElementsByClassName('friday-shacharit');
            for (var element of elements){
                element.classList.add('show-element');
            }
        });
    }
    return load_html_into_page_elem_end('friday_times.html', 'friday_prayers', () => {
        set_element_html('hadlakat-nerot', shabat_in);
        set_element_html('kabalat-shabat', add_minutes_to_time(shabat_in, 10));
    });
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
    read_json(`${data_dir}/special_day_timeline.json`).then(data => {
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
    load_file(`${data_dir}/shagririm_sorted.txt`).then(lines => {
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

    return read_json(`${data_dir}/messages.json`).then(messages_dict => {
        var messages_list = get_items_to_present(date, messages_dict).map(item => item.message);
        var elem = document.getElementById('messages-text');
        return display_message(messages_list, elem);
      });
}

function set_main_area_background(date){
    var background = `${images_dir}/mishkan-tkiya.JPG`;
    if (date.getDay() == 6){
        //background = 'shabat_2';
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

function should_remove_ad_specific_date_range(ad_definition, current_date){
    var is_date_in_range = false;
    var exclude_date_range = ad_definition.exclude_date_range;
    if (exclude_date_range){
        is_date_in_range = is_between_dates(current_date, exclude_date_range.from, exclude_date_range.until);
    }
    return is_date_in_range;
}

function get_sukot_ads(){
    return [advertisements.sukot];
}

function get_kipur_ads(){
    return [advertisements.kipur];
}

function get_items_to_present(current_date, items){
    var ads = [];
    for (var [key, item_definition] of Object.entries(items)){
        var present_ad = true;
        if (!should_present_ad_between_dates(item_definition, current_date)){
            present_ad = false;
        }
        if (!should_present_ad_in_weekday(item_definition, current_date)){
            present_ad = false;
        }
        if (should_remove_ad_specific_date_range(item_definition, current_date)){
            present_ad = false;
        }

        if (present_ad){
            ads.push(item_definition);
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
    var ads_for_present;
    if (is_between_dates(current_date, "2022-10-09", "2022-10-18")){
        ads_for_present = get_sukot_ads();
    } else if (is_between_dates(current_date, "2022-10-04", "2022-10-06")){
        ads_for_present = get_kipur_ads();
    } else {
        ads_for_present = get_items_to_present(current_date, advertisements);
    }
    for (var ad_definition of ads_for_present){
        var ad_file_name = ad_definition.image;
        set_element_background_image(body, `${images_dir}/${ad_file_name}`);
        var exposure_time = ad_definition.exposure_time_seconds || ad_wait_seconds;
        await sleep_seconds(exposure_time);
    }
    body.className = body_classes;
    toggle_element_show(header_element, false);
    toggle_element_show(main_div_element, false);
}

let item_funcs = {
    'tfilot_single_page': present_prayer_times_single_page,
    'day_times': present_day_times,
    'omer': present_sfirat_haomer,
    'shabat': present_shabat_prayer_times,
    'shabat_single_page': present_shabat_prayer_times,
    'friday': present_friday_prayer_times,
    'friday_single_page': present_friday_single_page,
    'tormim': present_donators,
    'messages': present_messages,
    'advertisement': present_advertisement,
    'rosh_hashana_a': present_rosh_a_times,
    'rosh_hashana_b': present_rosh_b_times,
    'rosh_hashana_eve_single_page': present_rosh_hashana_prayer_times,
    'kipur_eve': present_kipur_eve_times,
    'kipur': present_kipur_times,
    'sukot_eve': present_sukot_eve_times,
    'sukot': present_sukot_times,
    'hoshana_raba': present_hoshana_raba_times,
    'simchat_tora_eve': present_simchat_tora_eve_times,
    'simchat_tora': present_simchat_tora_times,
    'megila': present_megila_times,
    'purim': present_purim_times,
    'pesach_eve': present_pesach_eve,
    'pesach_single_page': present_pesach_times,
    'shavuot_single_page': present_shavuot_prayer_times,
    'taanit': present_taanit_times
};

async function loop_pages(){
    while (true){
        current_date_obj = current_date();
        set_main_area_background(current_date_obj);
        present_header_dates(current_date_obj);
        var single_page_item = get_specific_single_page(current_date_obj)
        if(single_page_item){
            await insert_html('./html/'+ single_page_item + '.html', "main-div");
            var element = document.getElementById(single_page_item);
            element.classList.add('background-opac');
            var item_func = item_funcs[single_page_item];
            await item_func(current_date_obj);
        } else{
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
}

function build_page_structure(){
    return insert_html('./html/header.html', "header");
}

function get_today_property(date, property_name){
    var current_date_var = get_date_from_Date(date);
    var today_times = get_today_times(current_date_var);
    return today_times[property_name];
}

function get_today_dawn(date){
    return get_today_property(date, 'dawn');
}

function get_today_talit_and_tfilin(date){
    return get_today_property(date, 'tfilin');
}

function get_today_shma_end(date){
    return get_today_property(date, 'shma_end');
}

function get_today_sunrise(date){
    return get_today_property(date, 'sunrise');
}

function get_today_mid_day(date){
    return get_today_property(date, 'mid_day');
}

function get_today_mincha_gedola(date){
    return get_today_property(date, 'mincha_gedola');
}

function get_today_plag(date){
    return get_today_property(date, 'plag');
}

function get_today_sunset(date){
    return get_today_property(date, 'sunset');
}

function get_today_stars(date){
    return get_today_property(date, 'stars');
}

function is_after_sunset(date){
    var sunset_time = new Date(date);
    var sunset_time = get_today_sunset(date);
    return is_after_time(date, sunset_time);
}

function is_after_time(date, time, plus_minutes){
    var date_time = new Date(date);
    var hour_and_minutes = time.split(':');
    if(plus_minutes){
        hour_and_minutes[1] = parseInt(hour_and_minutes[1]) + plus_minutes;
    }
    date_time.setHours(hour_and_minutes[0], hour_and_minutes[1], '00');
    return date > date_time;
}

function is_before_time(date, time){
    var date_time = new Date(date);
    var hour_and_minutes = time.split(':');
    date_time.setHours(hour_and_minutes[0], hour_and_minutes[1], '00');
    return date < date_time;
}

function is_before_sunrise(date){
    var sunrise_time = new Date(date);
    var sunrise_hour_and_minutes = get_today_sunrise(date).split(':');
    sunrise_time.setHours(sunrise_hour_and_minutes[0], sunrise_hour_and_minutes[1], '00');
    return date < sunrise_time;
}

function is_night(date){
    return is_after_sunset(date) || is_before_sunrise(date);
}

function add_minutes(date, minutes) {
    return new Date(date.getTime() + minutes*60*1000);
}

function two_digit_time(time){
    return time < 10 ? '0' + time : time;
}

function add_minutes_to_time(time, minutes) {
    var hour_and_minutes = time.split(':');
    var date = new Date();
    date.setHours(hour_and_minutes[0]);
    date.setMinutes(hour_and_minutes[1]);
    date.setTime(date.getTime() + minutes*60*1000);
    return two_digit_time(date.getHours()) + ':' + two_digit_time(date.getMinutes());
}

function format_hour_and_minutes(full_time_string){
    return full_time_string.substring(0, 5);
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
