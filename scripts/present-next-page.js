'esversion: 8';
import { insert_html } from "./main-div-setter.js";
import { append_html } from "./main-div-setter.js";
import { activate_element, waitForElm } from "./main-div-setter.js";
import {read_json} from "./read_data.js";
import {current_date} from "./read_data.js";
import {set_element_data} from "./main-div-setter.js";
import {parse_hebrew_date} from "./parse_hebrew_date.js";

var day_times;

var my_promise = read_json("./data/day_times.json");
my_promise.then(times => {
    day_times = times;
    present_first_page(day_times);
});
var wait_seconds = 10;


function get_today_times(current_date){
    return day_times[current_date];
}

function present_hebrew_date_in_header(current_date){
    var today_times = get_today_times(current_date);
    set_element_data("hebrew_date", parse_hebrew_date(today_times['hebrew_date']));
}

function present_first_page(day_times){
    var current_date_var = '2022-05-15';
    build_page_structure();
    waitForElm('#header').then((elm) => {
        waitForElm('#hebrew_date').then((hebrew_date_elm) => {
            present_hebrew_date_in_header(current_date_var)
        });
        waitForElm('#gregorian_date').then((greg_date_elm) => {
            set_element_data("gregorian_date", current_date_var);
        });
    });
    
    waitForElm('#tfilot').then((elm) => {
        activate_element("tfilot", "main-div");
        loop_pages();
    });
}

function present_next_main_div(item){
    insert_html('./html/'+ item + '.html', "main-div");
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function prepare_slide_show_pages(day_times_object){
    return ["tfilot_times", "sfirat_haomer"];
}

function get_slide_show_items_ids(){
    return ["tfilot", "sfirat_haomer"];
}

async function loop_pages(){
    while (true){
        for (var item of get_slide_show_items_ids()){
            activate_element(item, "main-div");
            await sleep(wait_seconds * 1000);
        }
    }
}

function build_page_structure(){
    insert_html('./html/header.html', "header");
    for (var item of ["tfilot_times", "sfirat_haomer"]){
        append_html('./html/'+ item + '.html', "main-div");
    }
}