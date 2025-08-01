'esversion: 8';
import { insert_html, append_html, activate_element, deactivate_element,
    waitForElm, wait_for_scroll, toggle_element_show, show_by_id } from "./main-div-setter.js";
import {current_date, get_date_from_Date, get_date_from_Date_for_header, read_json} from "./read_data.js";
import {set_element_data, set_element_html, set_element_background, insert_html_at_start_of_element,
    insert_html_at_end_of_element,
    get_element_background, set_element_background_image, add_class_to_element_style} from "./main-div-setter.js";
import {get_hebrew_date, parse_sfirat_haomer, omer_days_count_to_hebrew, omer_days_count_to_hebrew_weeks} from "./parse_hebrew_date.js";
import {load_file} from "./scroll.js";
import { clockFunc } from "./clock-time.js";

const chokidar = require('chokidar');
const { execSync } = require('child_process');

async function watch_files(){
    var cwd = process.cwd()
    console.log('cwd: ' + cwd);
    chokidar.watch([data_dir, cwd], {ignored: /\.venv|node_modules|\.git|\.vscode/}).on('all', (event, path) => {
        console.log(event, path);
        if(['change'].includes(event)){
            location.replace(window.location.href);
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
    return read_json(`${data_dir}/parsed_dates_tashpah.json`).then(times => {
        day_times = times;
    }).then(() => {
        return read_json(`${data_dir}/mincha_maariv_tashpah.json`).then(prayer_times => {
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

function get_today_hebrew_date(current_date){
    var today_times = get_today_times_according_to_sunset(current_date);
    return today_times['hebrew_date'];
}

function present_hebrew_date_in_header(current_date){
    var hebrew_date_text = get_today_hebrew_date(current_date);
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
    present_last_commit();
    loop_pages();
}

function present_header_dates(date){
    waitForElm('#header').then((elm) => {
        waitForElm('#hebrew_date').then((hebrew_date_elm) => {
            present_hebrew_date_in_header(date);
        });
        waitForElm('#gregorian_date').then((greg_date_elm) => {
            //set_element_data("gregorian_date", get_date_from_Date_for_header(date));
        });
    });
}

function present_next_main_div(item){
    insert_html('./html/'+ item + '.html', "main-div");
}

function sleep(ms, abort_key='ArrowRight') {
    let timeoutId;
    return new Promise((resolve) => {
        timeoutId = setTimeout(resolve, ms);
        
        function handleKeyDown(event) {
            if (event.key === abort_key) {
                clearTimeout(timeoutId);
                resolve(); // Resolve immediately when arrow right is pressed
                document.removeEventListener("keydown", handleKeyDown);
            }
        }

        document.addEventListener("keydown", handleKeyDown);
    });
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

function is_between_hours(date, start_date, end_date){
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

function is_war(date){
    return is_between_dates(date, '2025-06-12', '2025-06-30');
}

function is_big_vacation(date){
    var month = date.getMonth();
    return month === 6 || month === 7;
}

function is_sukot_vacation(date){
    return is_between_dates(date, '2024-10-12', '2024-10-27');
}

function is_shacharit_8_30(date){
    if(is_war(date) | is_big_vacation(date) | is_sukot_vacation(date) | is_hanuka(date) | is_pesach_vacation(date)){
        return true;
    }
    return false;
}

function is_mincha_13_30(date){
    return is_big_vacation(date) || is_pesach_vacation(date) || is_war(date);
}

function is_weekend(date){
    return is_in_weekdays(date, [5]) | (is_in_weekdays(date, [6]) && is_before_time(date, '16:00'));
}

function is_shabat_time(date, buffer_minutes=30){
    var is_shabat_time = false;
    var this_shabat_times = get_shabat_times(date);
    if (is_in_weekdays(date, [5])){
        var shabat_in = this_shabat_times["in"];
        var shabat_in_minus_half_hour = add_minutes_to_time(shabat_in, -buffer_minutes);
        is_shabat_time = is_after_time(date, shabat_in_minus_half_hour)
    } else if (is_in_weekdays(date, [6])){
        var shabat_out = this_shabat_times["out"];
        var shabat_out_plus_half_hour = add_minutes_to_time(shabat_out, buffer_minutes);
        is_shabat_time = is_before_time(date, shabat_out_plus_half_hour);
    }
    return is_shabat_time;
}



function is_present_sukot_eve(date){
    return is_between_dates(date, '2023-10-06T10:00', '2023-10-06T20:00');
}

function is_purim(date){
    return is_between_dates(date, "2025-03-13T13:00", "2025-03-14T20:00");
}

function is_show_megila(date){
    return is_between_dates(date, "2025-03-13T13:00", "2025-03-14T12:00");
}

function is_present_pesach_eve(date){
    return is_between_dates(date, "2024-04-21T01:00", "2024-04-22T17:00");
}

function is_present_memorial_day(date){
    return is_between_dates(date, "2025-04-30T01:00", "2025-04-30T22:00");
}

function is_present_atzmaut(date){
    return is_between_dates(date, "2025-04-30T01:00", "2025-05-01T20:00");
}

function is_rosh_chodesh(date){
    var hebrew_date = get_today_hebrew_date(date)
    var day_of_month = hebrew_date.split(' ')[0].replace("'", "")
    return day_of_month == 'א' || day_of_month == 'ל'
}

function is_show_taanit(date){
    return is_between_dates(date, "2025-03-12T17:00", "2025-03-13T18:00");
}

function is_taanit(date){
    return is_between_dates(date, "2025-03-12T20:00", "2025-03-13T18:00");
}

function is_shabat_hagadol_tashpa(date){
    return is_between_dates(date, "2025-04-11T17:00", "2025-04-12T17:00");
}

function is_pesach_eve(date){
    return is_between_dates(date, "2024-04-22T00:00", "2024-04-22T17:00");
}

function is_pesach_first_chag(date){
    return is_between_dates(date, "2025-04-12T17:00", "2025-04-13T20:00:00");
}

function is_pesach_7(date){
    return is_between_dates(date, "2024-04-28T12:00", "2024-04-29T20:00:00");
}

function is_shavout(date){
    return is_between_dates(date, "2025-06-01T19:00", "2025-06-02T20:40:00");
}

function is_hanuka(date){
    return is_between_dates(date, "2024-12-25T17:00", "2025-01-02T17:00:00");
}
function is_pesach_vacation(date){
    return is_between_dates(date, "2025-04-05T23:00", "2025-04-20T12:00");
}

function is_elul(date){
    return is_between_dates(date, "2023-08-17T00:00", "2023-09-18T23:00");
}

function is_slihot_days(date){
    return is_between_dates(date, "2024-09-01T00:00", "2024-09-30T23:00");
}

function is_minyan_plag_active(date){
    return is_between_dates(date, "2025-04-20T00:00", "2025-09-10T23:00");
}

function is_show_rosh_hashana_eve(date){
    return is_between_dates(date, "2024-10-01", "2024-10-02T18:00");
}

function is_rosh_hashana_eve(date){
    return is_between_dates(date, "2024-10-02T05:01", "2024-10-03T02:00");
}

function is_rosh_hashana(date){
    return is_between_dates(date, "2024-10-03T02:01", "2024-10-04T02:00");
}

function is_rosh_hashana_b(date){
    return is_between_dates(date, "2024-10-04T02:01", "2024-10-04T19:00");
}

function is_gedalia(date){
    return is_between_dates(date, "2024-10-06T02:00", "2024-10-06T23:00");
}

function is_show_kipur_eve(date){
    return is_between_dates(date, "2024-10-10T02:00", "2024-10-11T10:00");
}

function is_kipur_eve(date){
    return is_between_dates(date, "2024-10-11T02:00", "2024-10-11T22:00");
}

function is_kipur(date){
    return is_between_dates(date, "2024-10-11T18:00", "2024-10-12T19:00");
}

function is_sukot_eve(date){
    return is_between_dates(date, "2024-10-15T19:00", "2024-10-16T14:00");
}

function is_sukot(date){
    return is_between_dates(date, "2024-10-16T14:01", "2024-10-17T19:00");
}

function is_present_simchat_tora_eve(date){
    return is_between_dates(date, "2024-10-22T17:00", "2024-10-22T23:59");
}

function is_simchat_tora_eve(date){
    return is_between_dates(date, "2024-10-23T00:01", "2024-10-23T23:59");
}

function is_simchat_tora(date){
    return is_between_dates(date, "2024-10-24T00:01", "2024-10-24T19:00");
}

function is_present_hakafot_single_page(date){
    return is_between_dates(date, "2024-10-24T00:01", "2024-10-24T13:15");
}

function is_10_tevet_friday(date){
    return is_between_dates(date, "2025-01-09T11:00", "2025-01-10T19:00");
}

function is_tisha_beav_eve(date){
    return is_between_dates(date, "2024-08-11T12:00", "2024-08-11T22:00");
}

function is_tisha_beav(date){
    return is_between_dates(date, "2025-08-02T20:00", "2025-08-03T20:30");
}

function is_shabat_chazon(date){
    return is_between_dates(date, "2025-08-01T19:00", "2025-08-02T20:00");
}

function is_tisha_beav_shabat(date){
    return is_between_dates(date, "2025-08-02T20:00", "2025-08-03T20:30");
}

function is_shabat_irgun(date){
    return is_between_dates(date, "2024-12-06T12:00", "2024-12-07T20:30");
}

function is_special_day(date){
    return is_shabat_time(date) |
        is_pesach_eve(date) | is_taanit(date) | is_kipur(date) | 
        is_present_memorial_day(date) | is_present_atzmaut(date) |
        is_simchat_tora_eve(date) | is_simchat_tora(date) | is_purim(date)
}

function get_specific_single_page(current_date){
    var item = null
    if(is_pesach_first_chag(current_date_obj)){
        item = 'pesach_single_page'
    } else if(is_pesach_7(current_date_obj)){
        item = 'pesach_7'
    } else if(is_tisha_beav(current_date_obj)){
        item = 'tisha_beav'
    } else if(is_shavout(current_date_obj)){
        item = 'shavuot_single_page'
    } else if(is_rosh_hashana_eve(current_date_obj)){
        item = 'rosh_hashana_eve_single_page'
    } else if(is_rosh_hashana(current_date_obj)){
        item = 'rosh_hashana_a_single_page'
    } else if(is_rosh_hashana_b(current_date_obj)){
        item = 'rosh_hashana_b_shabat_shuva_eve'
    } else if(is_gedalia(current_date_obj)){
        item = 'gedalia'
    } else if (is_kipur_eve(current_date_obj)){
        item = 'kipur_eve_single_page';
    } else if (is_kipur(current_date_obj)){
        item = 'kipur_single_page';
    } else if (is_sukot_eve(current_date_obj)){
        item = 'chag_eve';
    } else if (is_sukot(current_date_obj)){
        item = 'chag_single_page';
    } else if (is_between_dates(current_date_obj, "2025-06-01T01:00", "2025-06-01T19:00")){
        item = 'shavuot_eve';
    } else if(is_gedalia(current_date_obj)){
        item = 'gedalia'
    } else if(is_shabat_time(current_date_obj) && !is_between_dates(current_date_obj, "2024-03-21T15:00", "2024-03-23T21:00") && !is_shabat_hagadol_tashpa(current_date_obj)){
        item = 'shabat_single_page'
    } else if(is_tisha_beav(current_date_obj)){
        item = 'taanit'
    } else if(is_shabat_hagadol_tashpa(current_date_obj)){
        item = 'shabat_hagadol_tashpa'
    }
    return item
}


function get_slide_show_items_ids(){
    //return ['advertisement'];
    var date = current_date();
    var current_date_var = get_date_from_Date(date);
    var today_times = get_today_times(current_date_var);
    var slide_show_items = [];
    if(!is_in_weekdays(date, [5]) & !is_special_day(date)){
        slide_show_items.push('tfilot_single_page');
    } else if(is_shabat_time(date) & !is_kipur(date) & !is_kipur_eve(date)){
        slide_show_items.push('shabat_single_page')
    }
    if(is_taanit(date) | is_show_taanit(date) | is_tisha_beav_eve(date)){
        slide_show_items.push('taanit');
    }
    if (is_in_weekdays(date, [4,5]) & !is_special_day(date)){
        if(is_minyan_plag_active(date)){
            slide_show_items.push('friday_single_page_plag')
        } else {
            slide_show_items.push('friday_single_page');
        }
    }
    if (is_show_rosh_hashana_eve(date)){
        slide_show_items.push('rosh_hashana_eve_single_page');
    }
    if (is_between_dates(date, "2022-09-23T10:00", "2022-09-26T19:30")){
        slide_show_items.push('rosh_hashana_a');
    }
    if (is_between_dates(date, "2022-09-26T17:00", "2022-09-27T19:30")){
        slide_show_items.push('rosh_hashana_b');
    }
    if (is_show_kipur_eve(date)){
        slide_show_items.push('kipur_eve_single_page');
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
    if (is_present_simchat_tora_eve(date) | is_simchat_tora_eve(date)){
        slide_show_items.push('simchat_tora_eve_single_page');
    }
    if (is_simchat_tora_eve(date) | is_simchat_tora(date)){
        slide_show_items.push('simchat_tora_single_page');
    }
    if (is_present_hakafot_single_page(date)){
        slide_show_items.push('hakafot_single_page');
    }

    if (is_purim(date)){
        slide_show_items.push('purim');
    }

    if (is_show_megila(date)){
        slide_show_items.push('megila');
    }

    if(is_present_pesach_eve(date)){
        slide_show_items.push('pesach_eve')
    }

    if(is_present_memorial_day(date)){
        slide_show_items.push('memorial_day')
    }

    if(is_present_atzmaut(date)){
        slide_show_items.push('atzmaut')
    }
    
    //slide_show_items.push('day_times');
    read_json(`${data_dir}/messages.json`).then(messages_dict => {
        var messages_list = get_items_to_present(date, messages_dict).map(item => item.message);
        if (messages_list.length) {
            slide_show_items.push('messages');
        } 
    });
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

function get_this_friday_date(current_date){
    var shabat_date = new Date(current_date);
    shabat_date.setDate(current_date.getDate() + 5 - current_date.getDay());
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

function get_chag_times(current_date){
    return {'in': '17:43', 'out': '18:41'};
}

function get_single_prayer_times_from_date_obj(date_obj, prayer_name){
    var prayer_times = date_obj[prayer_name];
    return prayer_times;
}

function roundToNearest5(numToRound, numToRoundTo) {
  const rem = numToRound % numToRoundTo;
  return rem < 3 ? numToRound - rem : numToRound + (5 - rem);
}

function roundToNearest(numToRound, numToRoundTo, prefer_floor=true) {
    var round_func = Math.round;
    if(prefer_floor){
        round_func = Math.floor;
    }
    return round_func(numToRound / numToRoundTo) * numToRoundTo;
}

function round_to_five(some_date, round_down=false, reverse_round_offset=1){
    var hour_and_minutes = some_date.split(':');
    var minutes = parseInt(hour_and_minutes[1]);
    var modulu_five = minutes % 5;
    var prefer_floor = round_down;
    if (modulu_five == 4 && !prefer_floor){
        prefer_floor = false;
    }
    var rounded = roundToNearest5(minutes, 5);
    if(rounded < 10){
        rounded = '0' + rounded;
    }
    return hour_and_minutes[0] + ':' + rounded;
}

function show_slichot(date){
    if(is_between_dates(date, '2024-09-29T10:00', '2024-10-12T18:00')){
        set_element_data('shacharit_a', '05:50');
        set_element_data('shacharit_b', '06:55');
        var elements = document.getElementsByClassName('slichot');
        for (var element of elements){
            element.classList.add('show-element');
        }
    }
}

function show_siftei_renanot(date){
    if(is_slihot_days(date)){
        var elements = document.getElementsByClassName('slichot');
        for (var element of elements){
            element.classList.add('show-element');
        }
    }
}

function show_parents_and_children(date){
    if(is_shabat_time(date)){
        var elements = document.getElementsByClassName('parents-and-children');
        for (var element of elements){
            element.classList.add('show-element');
        }
    }
}

function show_shacharit_7_30(){
    var elements = document.getElementsByClassName('shacharit-730');
    for (var element of elements){
        element.classList.add('show-element');
    }
}

function show_shacharit_8_30(){
    var elements = document.getElementsByClassName('friday-shacharit');
    for (var element of elements){
        element.classList.add('show-element');
    }
}

function hide_element(elem_class){
    var elements = document.getElementsByClassName(elem_class);
    for (var element of elements){
        element.classList.add('hidden-element');
    }
}

function add_class_to_elements_by_class_name(class_identifier, class_name_to_add){
    var elements = document.getElementsByClassName(class_identifier);
    for (var element of elements){
        element.classList.add(class_name_to_add);
    }
}

function show_mincha_gedola(){
    var elements = document.getElementsByClassName('mincha-gedola');
    for (var element of elements){
        element.classList.add('show-element');
    }
}

function get_omer_numeric(date){
    var omer_start_date = new Date('2025-04-14');
    var omer_time_diff = date - omer_start_date;
    var omer_days = Math.ceil(omer_time_diff / (1000 * 3600 * 24));
    if(is_after_sunset(date)){
        omer_days += 1;
    }
    return omer_days;
}

function get_omer_days_and_weeks(current_date){
    var laomer = 'לעומר';
    var omer_numeric = get_omer_numeric(current_date);
    var omer_days = omer_days_count_to_hebrew(omer_numeric);
    var omer_weeks = omer_days_count_to_hebrew_weeks(omer_numeric);
    return [omer_days, omer_weeks];
}

function set_sfirat_haomer_regular_days(date, two_lines){
    var laomer = 'לעומר';
    var omer_days_and_weeks = get_omer_days_and_weeks(date);
    var omer_days = omer_days_and_weeks[0];
    var omer_weeks = omer_days_and_weeks[1];
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
    return;
    var omer_numeric = get_omer_numeric(current_date);
    if(omer_numeric >= 0 && omer_numeric <= 49 && is_after_sunset(current_date)){
        load_html_into_page_elem_end('omer_fouter.html', into_elem_id, () => {
            set_sfirat_haomer_regular_days(current_date, two_lines);
            show_by_id('omer');
        });
    }
}

async function show_footer_custom_message_if_needed(current_date, into_elem_id, caller_slee_seconds=60){
    var messages = [];
    var show_footer = false;
    if(is_between_dates(current_date, '2024-09-27T16:00', '2024-09-29T03:00')){
        messages.push('במוצאי שבת שיחה בשעה 00:00, סליחות בשעה 00:30');
        show_footer = true;
    }
    
    if(is_between_dates(current_date, '2024-10-05T10:00', '2024-10-11T14:00')){
        messages.push('המלך הקדוש   |   המלך המשפט');
        show_footer = true;
    }
    
    if(is_between_dates(current_date, '2024-10-24T10:00', '2024-10-31T09:00')){
        messages.push('משיב הרוח ומוריד הגשם');
        show_footer = true;
    }

    if(is_hanuka(current_date)){
        messages.push('על הניסים');
        show_footer = true;
    }

    if(is_between_dates(current_date, '2024-11-07T17:10', '2024-11-14T22:00') & !is_between_dates(current_date, '2024-11-12T21:00', '2024-11-12T22:00') & !is_shabat_time(current_date, -25)){
        messages.push('ותן טל ומטר לברכה');
        show_footer = true;
    }

    if(is_between_dates(current_date, '2025-07-18T16:30', '2025-07-19T20:00')){
        messages.push('מזל טוב למשפחת הופמן לרגל אירוסי יצחק');
        show_footer = true;
    }

    if(is_between_dates(current_date, '2025-03-21T16:30', '2025-03-22T18:00')){
        messages.push('מזל טוב למשפחת עופר לרגל בר המצווה של יהודה');
        show_footer = true;
    }

    if(is_between_dates(current_date, '2025-01-10T16:00', '2025-01-11T18:00')){
        messages.push('מזל טוב למשפחת לסר (אורן ואורית) להולדת הבן');
        show_footer = true;
    }

    if(is_between_dates(current_date, '2024-08-02T17:30', '2024-08-02T23:00')){
        messages.push('שלום זכר ב 22:00 אצל משפחת לוין רחוב הגיתית 10 דירה 5');
        show_footer = true;
    }

    if(is_between_dates(current_date, '2025-07-19T05:30', '2025-07-19T10:10')){
        messages.push('ר"ח מנחם אב יהיה ביום שבת הבעל"ט');
        show_footer = true;
    }

    if(is_between_dates(current_date, '2025-03-07T12:30', '2025-03-08T17:00')){
        messages.push('קריאות זכור: 09:30, 10:15, 16:45');
        show_footer = true;
    }

    if(is_between_dates(current_date, '2025-03-13T12:30', '2025-03-13T18:05')){
        messages.push('זכר למחצית השקל');
        show_footer = true;
    }
    if(is_between_dates(current_date, '2025-04-04T18:00', '2025-04-05T19:00')){
        messages.push('דרשת שבת הגדול מפי הרב נחום 18:20');
        show_footer = true;
    }

    if(is_between_dates(current_date, '2025-04-18T18:00', '2025-04-19T22:00')){
        messages.push('מהשבוע לא תתקיים תפילת ערבית בשעה 20:00');
        show_footer = true;
    }

    if(is_between_dates(current_date, '2025-04-09T10:00', '2025-04-10T12:00')){
        var msg = "תענית בכורות - סיום מסכת לאחר כל מניין";
        if(is_in_weekdays(current_date, [3])){
            msg = "ביום חמישי " + msg;
        }
        messages.push(msg);
        show_footer = true;
    }

    if(is_between_dates(current_date, '2025-04-10T19:00', '2025-04-10T22:00')){
        messages.push('בדיקת חמץ');
        show_footer = true;
    }

    if(is_between_dates(current_date, '2025-07-18T16:00', '2025-07-19T21:00')){
        messages.push('הציבור מוזמן לסיום ש"ס וסיום ספר משלי במוצ"ש בשעה 21:30');
        show_footer = true;
    }
    
    if(is_between_dates(current_date, '2024-12-20T16:00', '2024-12-21T17:30')){
        messages.push('מזל טוב למשפחת מאירפלד להולדת הבת');
        messages.push('משתתפים בצערו של ראובן עוז על פטירת אביו');
        //messages.push('מסיבת חנוכה קהילתית במוצאי שבת חנוכה - הזדרזו להירשם');
        show_footer = true;
    }

    if(is_between_dates(current_date, '2024-08-30T05:30', '2024-08-31T05:00') || 
       is_between_dates(current_date, '2024-08-31T10:00', '2024-08-31T11:00')){
        messages.push('הציבור מוזמן לקידושא רבא לאחר תפילת שחרית של 8:30');
        show_footer = true;
    }

    if(is_rosh_chodesh(current_date)){
        messages.push('יעלה ויבוא');
        show_footer = true
    }

    if(is_shabat_chazon(current_date) && is_after_time(current_date, '17:00')){
        messages.push('כניסת הצום בשעה 19:35');
    }

    if(is_tisha_beav(current_date)){
        messages.push("כי ניחם ה' ציון ניחם כל חרבותיה וישם מדברה כעדן וערבתה כגן ה'");
    }

    var omer_numeric = get_omer_numeric(current_date);
    if(omer_numeric >= 0 && omer_numeric <= 49){
        var laomer = 'לעומר';
        var omer_days_and_weeks = get_omer_days_and_weeks(current_date);
        messages.push([omer_days_and_weeks[0], omer_days_and_weeks[1], laomer].join(' '));
    }

    if(messages.length > 0){
        var messages_html = messages; //.join('<br>');
        if (messages.length > 1){
            var delay_between_message = caller_slee_seconds / messages.length;
        }
        load_html_into_page_elem_end('custom_fouter.html', into_elem_id, () => {
            show_by_id('custom-footer');
            show_messages(messages, delay_between_message);
        });
    }
}

async function show_messages(messages, delay_between_message_seconds){
    for(const message of messages){
        if(message.length > 50){
            add_class_to_element_style('footer-custom-message', 'my-text-footer-small');
        }
        else if(message.length > 54){
            add_class_to_element_style('footer-custom-message', 'text-single-page-shaba');
        };
        set_element_html('footer-custom-message', message)
        await sleep(delay_between_message_seconds*1000, "ArrowLeft");
    }
}

function create_table_row_html(key, value){
    var entry = `
        <div class="grid-box-right grid-body-box">${key}</div>
        <div class="grid-box-right grid-body-box">${value}</div>
        `;
    return entry;
}

function create_empty_line(){
    return create_table_row_html('', '')
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
    if (is_shacharit_8_30(current_date) && is_mincha_13_30(current_date)){
        add_class_to_element_style('prayer_times', 'table-line-height-less')
    }
    load_html_into_page_elem_start('shacharit.html', 'prayer_times', () => {
        if(is_war(current_date)){
            show_shacharit_7_30();
            set_element_data("shacharit-730-name", "שחרית ג");
            set_element_data("shacharit-830-name", "שחרית ד");
        }
        if(is_shacharit_8_30(current_date)){
            show_shacharit_8_30();
        }
        show_slichot(current_date);
    });

    if(is_mincha_13_30(current_date)){
        var mincha_gedola_time_min = get_today_mincha_gedola(current_date);
        var mincha_date = new Date(current_date);
        mincha_date.setHours(mincha_gedola_time_min.split(":")[0]);
        mincha_date.setMinutes(mincha_gedola_time_min.split(":")[1]);
        var mincha_gedola_time = '13:15';
        if (is_after_time(mincha_date, '13:17')){
            mincha_gedola_time = '13:20';
        }
        var mincha_13_30 = create_table_row_html(mincha_gedola_time, 'מנחה גדולה');
        insert_html_at_start_of_element('prayer_times', mincha_13_30);
    }

    load_html_into_page_elem_end('mincha_arvit.html', 'prayer_times', () => {
        set_element_html('mincha-regulr-days', mincha_time);
        set_element_html('arvit-regulr-days', arvit_time);
        set_arvit_times(current_date, arvit_time);
    });

    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date, true);
    });
    show_sfirat_haomer_if_needed(current_date, 'tfilot_single_page', true);
    show_footer_custom_message_if_needed(current_date, 'tfilot_single_page');
    return sleep_seconds(wait_seconds*10);
}

function set_arvit_times(current_date, arvit_time){
    var arvit_date = new Date(current_date);
    arvit_date.setHours(arvit_time.split(":")[0]);
    arvit_date.setMinutes(arvit_time.split(":")[1]);
    if(is_after_time(arvit_date, "19:35")){
        hide_element("arvit-8");
        set_element_data("arvit-9", "ערבית ב")
    }
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

async function present_tisha_beav_times(current_date){
    insert_html_at_end_of_element('taanit_times', create_table_row_html('19:35', 'כניסת הצום'));
    insert_html_at_end_of_element('taanit_times', create_table_row_html('20:30', 'ערבית ומגילת איכה'));
    insert_html_at_end_of_element('taanit_times', create_table_row_html('06:50', 'שחרית א'));
    insert_html_at_end_of_element('taanit_times', create_table_row_html('08:30', 'שחרית ב'));
    insert_html_at_end_of_element('taanit_times', create_table_row_html('13:20', 'מנחה גדולה'));
    insert_html_at_end_of_element('taanit_times', create_table_row_html('19:00', 'מנחה קטנה'));
    insert_html_at_end_of_element('taanit_times', create_table_row_html('20:02', 'ערבית וצאת הצום'));

    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date, true);
    });
    show_footer_custom_message_if_needed(current_date, "tisha_beav")
    return sleep_seconds(wait_seconds*5);
}

async function present_taanit_times(current_date){
    var start_of_fest = create_table_row_html('04:37', 'כניסת הצום');
    var mincha_gedola = create_table_row_html('13:15', 'מנחה גדולה');
    var mincha_ktana = create_table_row_html('17:00', 'מנחה קטנה');
    var arvit = create_table_row_html('18:05', 'ערבית וקריאת מגילה');
    var megila_2 = create_table_row_html('19:45', 'קריאת מגילה לנשים');
    var empty_line = create_empty_line()

    load_html_into_page_elem_start('shacharit.html', 'taanit_times', () => {
        insert_html_at_start_of_element('taanit_times', start_of_fest);
        insert_html_at_end_of_element('taanit_times', mincha_gedola + mincha_ktana
            + arvit + megila_2);
    });
    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date, true);
    });
    show_footer_custom_message_if_needed(current_date, "taanit")
    return sleep_seconds(wait_seconds*5);
}

async function present_memorial_day_times(current_date){
    var this_week_times = get_week_times(current_date);
    var mincha_time = '19:05';
    var arvit_time = '19:45';
    load_html_into_page_elem_start('shacharit.html', 'prayer_times');

    load_html_into_page_elem_end('mincha_arvit_atzmaut.html', 'atzmaut_eve', () => {
        set_element_html('mincha-regulr-days', mincha_time);
        set_element_html('arvit-regulr-days', arvit_time);
    });

    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date, true);
    });
    show_footer_custom_message_if_needed(current_date, 'memorial_day');
    return sleep_seconds(wait_seconds*10);
}

async function present_atzmaut_times(current_date){
    var this_week_times = get_week_times(current_date);
    var mincha_time = get_single_prayer_times_from_date_obj(this_week_times, 'mincha');
    var arvit_time = get_single_prayer_times_from_date_obj(this_week_times, 'maariv');
    load_html_into_page_elem_start('shacharit.html', 'prayer_times', () => {
        show_shacharit_8_30();
    });

    load_html_into_page_elem_end('mincha_arvit.html', 'prayer_times', () => {
        show_mincha_gedola();
        set_element_html('mincha-regulr-days', mincha_time);
        set_element_html('arvit-regulr-days', arvit_time);
        set_arvit_times(current_date, arvit_time);
    });

    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date, true);
    });
    show_footer_custom_message_if_needed(current_date, 'atzmaut');
    return sleep_seconds(wait_seconds*10);
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

async function load_html_into_page_elem_start(html_file_name, parent_element, callback){
    fetch('./html/' + html_file_name)
    .then(response => response.text())
    .then(lines => {
        insert_html_at_start_of_element(parent_element, lines);
        if(callback){
            callback();
        }
    });
}

async function load_html_into_page_elem_end(html_file_name, parent_element, callback){
    return fetch('./html/' + html_file_name)
    .then(response => response.text())
    .then(lines => {
        insert_html_at_end_of_element(parent_element, lines);
        if(callback){
            callback();
        }
    });
}

function get_pesach_times(){
    return ["19:44", "19:45"];
}

function get_pesach_7_times(){
    return ["18:56", "19:58"];
}

async function present_shabat_hagadol_tashpa(current_date){
    load_html_into_page_elem_start('shabat_hagadol_first_column.html', 'first_column');
    load_html_into_page_elem_start('shabat_hagadol_second_column.html', 'second_column');
    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date, true);
    });
    return sleep_seconds(wait_seconds*5);
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
    });
    
    set_element_html('arvit-shabat', pesach_out);

    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date);
    });
    return sleep_seconds(10*60);
}

async function present_pesach_7_times(current_date){
    var pesach_times = get_pesach_7_times();
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
    show_sfirat_haomer_if_needed(current_date, 'pesach_7', true);
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

async function present_rosh_hashana_eve_prayer_times(current_date){
    load_html_into_page_elem_start('rosh_hashana_eve_1.html', 'first_column');
    load_html_into_page_elem_end('rosh_hashana_eve_2.html', 'first_column');
    load_html_into_page_elem_end('rosh_hashana_a.html', 'rosh_hashana_day');
    
    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date);
    });
    return sleep_seconds(10*60);
}

async function present_rosh_hashana_a_prayer_times(current_date){
    load_html_into_page_elem_end('rosh_hashana_a.html', 'first_column');
    load_html_into_page_elem_end('rosh_hashana_b.html', 'rosh_hashana_day');
    load_html_into_page_elem_end('shabat_shuva_eve.html', 'rosh_hashana_day');
    
    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date);
    });
    return sleep_seconds(10*60);
}

async function present_rosh_hashana_b_prayer_times(current_date){
    load_html_into_page_elem_end('rosh_hashana_b.html', 'first_column');
    
    var gedalia_date = new Date('2023-09-18');
    var mincha_gedalia = add_minutes_to_time(get_today_sunset(gedalia_date), -30);
    var arvit_gedalia = get_today_stars(gedalia_date);
    set_element_html('mincha_gedalia', format_hour_and_minutes(mincha_gedalia));
    set_element_html('arvit_gedalia', format_hour_and_minutes(arvit_gedalia));

    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date);
    });

    var this_week_times = get_week_times(current_date);
    var mincha_time = get_single_prayer_times_from_date_obj(this_week_times, 'mincha');
    var arvit_time = get_single_prayer_times_from_date_obj(this_week_times, 'maariv');
    load_html_into_page_elem_start('shacharit.html', 'prayer_times');

    load_html_into_page_elem_end('mincha_arvit.html', 'prayer_times', () => {
        set_element_html('mincha-regulr-days', mincha_time);
        set_element_html('arvit-regulr-days', arvit_time);
    });
    return sleep_seconds(10*60);
}

async function present_rosh_hashana_b_shabat_shuva_eve_prayer_times(current_date){
    load_html_into_page_elem_end('rosh_hashana_b.html', 'first_column');
    load_html_into_page_elem_end('shabat_shuva_eve.html', 'shabat');

    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date);
    });
    return sleep_seconds(wait_seconds*10);
}


async function present_gedalia_times(current_date){
    var this_week_times = get_week_times(current_date);
    
    var mincha_time = get_single_prayer_times_from_date_obj(this_week_times, 'mincha');
    var arvit_time = get_single_prayer_times_from_date_obj(this_week_times, 'maariv');
    load_html_into_page_elem_start('shacharit.html', 'prayer_times');
    
    var gedalia_date = new Date('2023-09-18');
    var mincha_gedalia = add_minutes_to_time(get_today_sunset(gedalia_date), -30);
    var arvit_gedalia = get_today_stars(gedalia_date);

    load_html_into_page_elem_end('mincha_arvit.html', 'prayer_times', () => {
        set_element_html('mincha-regulr-days', format_hour_and_minutes(mincha_gedalia));
        set_element_html('arvit-regulr-days', format_hour_and_minutes(arvit_gedalia));
    });

    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date, true);
    });
    return sleep_seconds(wait_seconds*10);
}

function shabat_chazon_adaptions(){
    add_class_to_elements_by_class_name('tehilim','strikethrough');
    add_class_to_elements_by_class_name('shiur-pirkei-avot','strikethrough');
    hide_element('arvit-shabat');
    hide_element('arvit-shabat-2');
    insert_html_at_end_of_element('second_column', create_table_row_html('20:16', 'צאת השבת'));
    insert_html_at_end_of_element('second_column', create_table_row_html('20:30', 'ערבית ומגילת איכה'));
}

async function present_shabat_prayer_times(current_date){
    var this_week_times = get_week_times(current_date);
    var this_shabat_times = get_shabat_times(current_date);
    document.getElementById("prayer-times-title-parasha").innerText = this_shabat_times['parasha'];
    var shabat_in = this_shabat_times["in"];
    var arvit_shabat = this_shabat_times["out"];
    var shacharit_main = '08:30';
    var mincha_ktana = '18:00';

    await show_shabat_eve_times(current_date, shabat_in, 'first_column');
    
    load_html_into_page_elem_end('shabat_first_column.html', 'first_column', () => {
        show_siftei_renanot(current_date);
        show_parents_and_children(current_date);
        set_element_data('shacharit_main', shacharit_main);
        set_element_data('kidush', add_minutes_to_time(shacharit_main, 120));
    });

    load_html_into_page_elem_start('shabat_3.html', 'second_column', () => {
        set_element_html('lesson-halacha', add_minutes_to_time(mincha_ktana, -60));
        set_element_html('mincha-ktana', mincha_ktana);
        set_element_html('tehilim', add_minutes_to_time(mincha_ktana, 20));
        set_element_html('shiur-pirkei-avot', add_minutes_to_time(mincha_ktana, 20));

        set_element_html('arvit-shabat', arvit_shabat);
        set_element_html('arvit-shabat-2', add_minutes_to_time(arvit_shabat, 15));

        if (is_shabat_chazon(current_date)){
            shabat_chazon_adaptions();
        }
    });

    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date);
    });

    this_week_times = get_next_week_times(current_date);
    var mincha_time = get_single_prayer_times_from_date_obj(this_week_times, 'mincha');
    var arvit_time = get_single_prayer_times_from_date_obj(this_week_times, 'maariv');
    set_element_html('mincha-regulr-days', mincha_time);
    set_element_html('arvit-regulr-days', arvit_time);

    show_footer_custom_message_if_needed(current_date, 'shabat_single_page', wait_seconds*10);
    return sleep_seconds(wait_seconds*10);
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

async function present_day_times_page(current_date){
    load_html_into_page_elem_end('day_times_inner.html', 'day_times_inner', () => {
        present_day_times(current_date);
    });
    return sleep_seconds(20);
}

async function present_kipur_eve_times(current_date){
    var chag_in = '17:49';
    if(is_show_kipur_eve(current_date)){
        load_html_into_page_elem_start('kipur_eve_morning.html', 'kipur_eve_times');
    } else {
        load_html_into_page_elem_end('day_times_embedded_with_title.html', 'first_column', () => {
            load_html_into_page_elem_start('day_times_inner.html', 'day_times_inner', () => {
                present_day_times(current_date);
            });
        });
    }
    
    load_html_into_page_elem_end('kipur_eve_a.html', 'kipur_eve_times', () => {
        set_element_html('chag_in', chag_in);
        set_element_html('kol_nidrei', add_minutes_to_time(chag_in, 11));
    });
    load_html_into_page_elem_start('kipur.html', 'kipur_day');
    load_html_into_page_elem_end('kipur_a.html', 'kipur_day');

    show_footer_custom_message_if_needed(current_date, 'kipur_eve_single_page');
    
    return sleep_seconds(60*3);
}

async function present_kipur_times(current_date){
    load_html_into_page_elem_start('kipur.html', 'kipur_day');
    load_html_into_page_elem_end('kipur_a.html', 'kipur_day');

    load_html_into_page_elem_start('day_times_embedded_with_title.html', 'second_column', () => {
        load_html_into_page_elem_start('day_times_inner.html', 'day_times_inner', () => {
            present_day_times(new Date('2024-10-12'));
        });
    });

    var this_week_times = get_next_week_times(current_date);
    var mincha_time = get_single_prayer_times_from_date_obj(this_week_times, 'mincha');
    var arvit_time = get_single_prayer_times_from_date_obj(this_week_times, 'maariv');

    load_html_into_page_elem_start('shacharit.html', 'prayer_times', () => {
        show_shacharit_8_30();
    });

    load_html_into_page_elem_end('mincha_arvit.html', 'prayer_times', () => {
        set_element_html('mincha-regulr-days', mincha_time);
        set_element_html('arvit-regulr-days', arvit_time);
    });
    
    return sleep_seconds(60*3);
}

async function present_chag_eve_times(current_date){
    var chag_name = 'ערב חג סוכות';
    var chag_times = get_chag_times(current_date);
    var chag_in = chag_times["in"];
    document.getElementById("prayer-times-title-parasha").innerText = chag_name;
    
    load_html_into_page_elem_start('shacharit.html', 'chag_eve_prayers', () => {
        var elements = document.getElementsByClassName('friday-shacharit');
        for (var element of elements){
            element.classList.add('show-element');
        }
    });
    
    show_chag_eve_times(current_date, chag_in, 'chag_eve_prayers');

    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date, true);
    });
    return sleep_seconds(wait_seconds*10);
}

async function present_chag_times_old(current_date){
    var chag_name = 'חג סוכות';
    var chag_times = get_chag_times(current_date);
    var chag_in = chag_times["in"];
    document.getElementById("prayer-times-title-parasha").innerText = chag_name;
    
    load_html_into_page_elem_start('shacharit.html', 'chag_eve_prayers', () => {
        var elements = document.getElementsByClassName('friday-shacharit');
        for (var element of elements){
            element.classList.add('show-element');
        }
    });
    
    show_chag_eve_times(current_date, chag_in, 'chag_eve_prayers');

    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date, true);
    });
    return sleep_seconds(wait_seconds*10);
}

async function insert_blank_table_row(elem_id, num_rows){
    Array.from({ length: num_rows }, () => {
        load_html_into_page_elem_end('blank_table_row.html', elem_id); 
    });
}

async function present_chag_times(current_date){
    var chag_name = 'חג סוכות';
    var chag_times = get_chag_times(current_date);
    var chag_in = chag_times["in"];
    var chag_out = chag_times["out"];
    var mincha_ktana = '17:30';
    document.getElementById("prayer-times-title-parasha").innerText = chag_name;
    
    show_chag_eve_times(current_date, chag_in, 'first_column');
    
    load_html_into_page_elem_end('chag_first_column.html', 'first_column');

    load_html_into_page_elem_start('chag_afternoon.html', 'second_column', () => {
        set_element_html('mincha-ktana', mincha_ktana);
        set_element_html('arvit-shabat', chag_out);
    });

    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date);
    });

    return sleep_seconds(wait_seconds*10);
}

async function present_shachcarit_with_8_30(parent_elem){
    load_html_into_page_elem_start('shacharit.html', parent_elem, () => {
        var elements = document.getElementsByClassName('friday-shacharit');
        for (var element of elements){
            element.classList.add('show-element');
        }
    });
}

async function present_simchat_tora_eve_full(current_date){
    await present_shachcarit_with_8_30('first_column');
    insert_html_at_end_of_element('first_column', create_table_row_html('13:15', 'מנחה גדולה'));
    show_chag_eve_times(current_date, '17:36', 'first_column');
    load_html_into_page_elem_end('hakafot.html', 'second_column');

    load_html_into_page_elem_end('day_times_inner_1.html', 'day_times_first_column', () => {
        load_html_into_page_elem_end('day_times_inner_2.html', 'day_times_second_column', () => {
            present_day_times('2024-10-23', true);
        });
    });
    return sleep_seconds(wait_seconds*10);
}

async function present_simchat_tora_full(current_date){
    var chag_out = '18:34';
    load_html_into_page_elem_start('simchat_tora.html', 'first_column');
    await load_html_into_page_elem_end('simchat_tora_a.html', 'first_column');
    load_html_into_page_elem_end('simchat_tora_b.html', 'second_column', () => {
        set_element_html('arvit-shabat', chag_out);
        set_element_html('arvit-shabat-2', add_minutes_to_time(chag_out, 15));
    });

    load_html_into_page_elem_end('day_times_inner_1.html', 'day_times_first_column', () => {
        load_html_into_page_elem_end('day_times_inner_2.html', 'day_times_second_column', () => {
            present_day_times('2024-10-24', true);
        });
    });
    return sleep_seconds(wait_seconds*10);
}

async function present_hakafot(current_date){
    load_html_into_page('hakafot.html', 'main_column');
    return sleep_seconds(wait_seconds*3);
}

async function present_simchat_tora_times_full(current_date){
    if(is_simchat_tora_eve(current_date)){
        load_html_into_page_elem_start('simchat_tora_eve.html', 'first_column');
        insert_blank_table_row('first_column', 3);
        load_html_into_page_elem_end('simchat_tora.html', 'first_column');
        load_html_into_page_elem_start('simchat_tora_a.html', 'sukot_column_b');
        insert_blank_table_row('sukot_column_b', 3);
        load_html_into_page_elem_end('simchat_tora_b.html', 'sukot_column_b');
    } else {
        load_html_into_page_elem_start('simchat_tora.html', 'first_column');
        load_html_into_page_elem_end('simchat_tora_a.html', 'first_column');
        load_html_into_page_elem_start('simchat_tora_b.html', 'sukot_column_b');
        load_html_into_page_elem_end('shabat_inner_table.html', 'second_column', () => {
            load_html_into_page_elem_start('day_times_inner.html', 'day_times', () => {
                present_day_times(current_date);
            });
            var this_week_times = get_next_week_times(current_date);
            var mincha_time = get_single_prayer_times_from_date_obj(this_week_times, 'mincha');
            var arvit_time = get_single_prayer_times_from_date_obj(this_week_times, 'maariv');
            set_element_html('mincha-regulr-days', mincha_time);
            set_element_html('arvit-regulr-days', arvit_time);
        });
    }
    show_footer_custom_message_if_needed(current_date, 'sukot_single_page');
    return sleep_seconds(10*60);
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

async function present_shavuot_eve_page(current_date){
    var shabat_in = "19:19";
    
    load_html_into_page_elem_start('shacharit.html', 'friday_prayers', () => {
        var elements = document.getElementsByClassName('friday-shacharit');
        for (var element of elements){
            element.classList.add('show-element');
        }
    });
    await show_shabat_eve_times(current_date, shabat_in, 'friday_prayers');
    set_element_html("kabalat-shabat-name", "ערבית של חג");
    set_element_html("kabalat_shabat", "20:06");

    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(current_date, true);
    });
    show_sfirat_haomer_if_needed(current_date, bla, false);
    return sleep_seconds(wait_seconds*5);
}

async function present_friday_single_page(current_date){
    var this_week_times = get_week_times(current_date);
    var this_shabat_times = get_shabat_times(current_date);
    var shabat_in = this_shabat_times["in"];
    var main_page_id = 'friday_single_page';
    document.getElementById("prayer-times-title-parasha").innerText = this_shabat_times['parasha'];
    if (is_10_tevet_friday(current_date)){
        document.getElementById("prayer-times-title-parasha").innerText = this_shabat_times['parasha'] + ' (עשרה בטבת)';
    }
    
    load_html_into_page_elem_start('shacharit.html', 'friday_prayers', () => {
        show_slichot(current_date);
        if (is_10_tevet_friday(current_date)) {
            insert_html_at_start_of_element('friday_prayers', create_table_row_html('05:06', 'כניסת הצום'));
        }
        var elements = document.getElementsByClassName('friday-shacharit');
        for (var element of elements){
            element.classList.add('show-element');
        }
    });
    
    if(is_minyan_plag_active(current_date)){
        show_minyan_plag(current_date);
        main_page_id += '_plag'
    }
    show_shabat_eve_times(current_date, shabat_in, 'friday_prayers');

    load_html_into_page_elem_end('day_times_inner.html', 'day_times', () => {
        present_day_times(get_this_friday_date(current_date), true);
    });
    show_sfirat_haomer_if_needed(current_date, main_page_id, true);
    show_footer_custom_message_if_needed(current_date, main_page_id)
    return sleep_seconds(wait_seconds*5);
}

async function show_shabat_eve_times(current_date, shabat_in, parent_element) {
    var friday_times_html = 'friday_times.html';
    if (is_10_tevet_friday(current_date)) {
        friday_times_html = 'friday_times_10_tevet.html';
    }
    return load_html_into_page_elem_end(friday_times_html, parent_element, () => {
        set_element_html('hadlakat-nerot', shabat_in);
        if(is_purim(current_date)){
            hide_element('mincha_shabat_eve')
            set_element_data('kabalat_shabat', add_minutes_to_time(shabat_in, 20))
        }
        if (!is_10_tevet_friday(current_date)) {
            set_element_html('mincha_shabat_eve', add_minutes_to_time(shabat_in, 10));
        }
    });
}

async function show_chag_eve_times(current_date, chag_in, parent_element) {
    var friday_times_html = 'chag_eve_times.html';
    return load_html_into_page_elem_end(friday_times_html, parent_element, () => {
        set_element_html('hadlakat-nerot', chag_in);
        set_element_html('mincha_shabat_eve', add_minutes_to_time(chag_in, 10));
    });
}

function show_minyan_plag(current_date) {
    var elements = document.getElementsByClassName('plag-block');
        for (var element of elements){
            element.classList.add('show-element');
    }
    var day = current_date;
    if(is_in_weekdays(current_date, [4])){
        day = addDays(current_date, 1);
    }
    var plag = get_today_plag(day);
    var kabalat_shabat_early_mincha = get_today_kabalat_shabat_early_mincha(day);
    if(!kabalat_shabat_early_mincha){
        var rounded = round_to_five(plag, true);
        var kabalat_shabat_early_mincha = add_minutes_to_time(rounded, -20);
    }

    load_html_into_page_elem_end('kabalat_shabat_early.html', 'plag', () => {
        set_element_html('kabalat-shabat-early-mincha', format_hour_and_minutes(kabalat_shabat_early_mincha));
        set_element_html('kabalat-shabat-early', format_hour_and_minutes(plag));
    });
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
        if (messages_list.length) {
            return display_message(messages_list, elem);
        } else{
            return sleep_seconds(0);
        }
      });
}

function set_main_area_background(date){
    var background = 'beit_midrash_new_2.JPG';
    if (date.getDay() == 6){
        //background = 'shabat_2';
    }
    if(is_between_dates(date, '2024-10-02T02:00', '2024-10-05T23:00')){
        background = 'shofar.jpg';
    }
    if(is_between_dates(date, '2024-10-08T02:00', '2024-10-12T23:00')){
        background = 'beit-hamikdash-1.jpeg';
    }
    if(is_between_dates(date, '2024-10-15T02:00', '2024-10-22T23:00')){
        background = 'sukot_3.jpg';
    }
    if(is_present_memorial_day(date) || is_present_atzmaut(date)){
        background = 'degel.jpg';
    }
    if(is_simchat_tora_eve(date) | is_simchat_tora(date)){
        background = 'simchat_tora_israel.png';
    }
    if(is_shabat_irgun(date)){
        background = 'bnei-akiva.png';
    }
    
    var background_file_path = `${images_dir}/${background}`
    var body_elem = document.getElementsByTagName('body')[0];
    set_element_background_image(body_elem, background_file_path);
    
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
    'friday_single_page_plag': present_friday_single_page,
    'tormim': present_donators,
    'messages': present_messages,
    'advertisement': present_advertisement,
    'rosh_hashana_eve_single_page': present_rosh_hashana_eve_prayer_times,
    'rosh_hashana_a_single_page': present_rosh_hashana_a_prayer_times,
    'rosh_hashana_b_single_page': present_rosh_hashana_b_prayer_times,
    'rosh_hashana_b_shabat_shuva_eve': present_rosh_hashana_b_shabat_shuva_eve_prayer_times,
    'gedalia': present_gedalia_times,
    'kipur_eve_single_page': present_kipur_eve_times,
    'kipur_single_page': present_kipur_times,
    'chag_eve': present_chag_eve_times,
    'chag_single_page': present_chag_times,
    'hoshana_raba': present_hoshana_raba_times,
    'simchat_tora_eve_single_page': present_simchat_tora_eve_full,
    'simchat_tora_single_page': present_simchat_tora_full,
    'hakafot_single_page': present_hakafot,
    'megila': present_megila_times,
    'purim': present_purim_times,
    'pesach_eve': present_pesach_eve,
    'shabat_hagadol_tashpa': present_shabat_hagadol_tashpa,
    'pesach_single_page': present_pesach_times,
    'pesach_7': present_pesach_7_times,
    'memorial_day': present_memorial_day_times,
    'atzmaut': present_atzmaut_times,
    'shavuot_eve': present_shavuot_eve_page,
    'shavuot_single_page': present_shavuot_prayer_times,
    'taanit': present_taanit_times,
    'tisha_beav': present_tisha_beav_times,
    'day_times': present_day_times_page
};

async function loop_pages(){
    while (true){
        current_date_obj = current_date();
        set_main_area_background(current_date_obj);
        present_header_dates(current_date_obj);
        var single_page_item = get_specific_single_page(current_date_obj)
        if(single_page_item){
            try{
                await insert_html('./html/'+ single_page_item + '.html', "main-div");
                var element = document.getElementById(single_page_item);
                element.classList.add('background-opac');
                var item_func = item_funcs[single_page_item];
                await item_func(current_date_obj);
            } catch (ex){
                console.log("An error occured while activating page " + single_page_item);
                console.log('test');
                console.error(ex.stack);
                await sleep_seconds(30);
            }
        } else{
            for (var item of get_slide_show_items_ids()){
                try{
                    if (item == 'advertisement'){
                        await present_advertisement(current_date_obj);
                    }else{
                        await insert_html('./html/'+ item + '.html', "main-div");
                        var item_func = item_funcs[item];
                        activate_element(item);
                        await item_func(current_date_obj);
                        await deactivate_element(item);
                    }
                } catch (ex){
                    console.log("An error occured while activating page" + item);
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

function get_today_kabalat_shabat_early_mincha(date){
    return get_today_property(date, 'kabalat_shabat_early_mincha');
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

function getLastCommitHash() {
    try {
        // Executes the git command and returns the output as a string [[2]](https://medium.com/@masnun/node-js-getting-current-git-commit-information-on-an-app-753a1835c57c)
        var res = execSync('git log -1 --pretty=%B\n');
        var hash = res.toString().trim();
        return hash;
    } catch (error) {
        console.error("Error getting last commit hash:", error);
        return "N/A";
    }
}

// Event listener for keydown
document.addEventListener('keydown', function(event) {
    if (event.key === "ArrowUp") {
        present_last_commit();
    }
});

function present_last_commit(){

        const commitHash = getLastCommitHash();
        let commitHashElement = document.getElementById('commit-hash-display');

        if (!commitHashElement) {
            commitHashElement = document.createElement('div');
            commitHashElement.id = 'commit-hash-display';
            commitHashElement.style.position = 'fixed';
            commitHashElement.style.top = '10px';
            commitHashElement.style.left = '10px';
            commitHashElement.style.padding = '10px';
            commitHashElement.style.backgroundColor = 'lightgray';
            commitHashElement.style.border = '1px solid black';
            commitHashElement.style.zIndex = '10000'; // Ensure it's on top
            document.body.appendChild(commitHashElement);
        }

        commitHashElement.textContent = `Last Commit: ${commitHash}`;
        commitHashElement.style.display = 'block';

        // Hide the element after 5 seconds
        setTimeout(() => {
            if (commitHashElement) {
                commitHashElement.style.display = 'none';
            }
        }, 5000);
}
