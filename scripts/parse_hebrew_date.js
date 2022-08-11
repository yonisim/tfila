'esversion: 8';

var hebrew_days = ["א","ב","ג","ד","ה","ו","ז","ח","ט","י","יא","יב","יג","יד","טו","טז"];
var hebrew_months = ["תשרי","חשוון","כסליו","טבת"];
var current_year = 'תשפ"ב';

var number_to_hebrew_word = ["אחד","שני","שלושה","ארבעה","חמישה","שישה","שבעה","שמונה","תשעה","עשרה"];
var tens_number_to_hebrew_word = ["עשר","עשרים","שלושים","ארבעים"];

var hayom = "היום";
var yom = "יום";
var ones_and_tens_connector = ' ו';
var days_descriptor = 'יום';
var laomer = 'לעומר';
var shehem = "שהם";

export function get_hebrew_date(hebrew_date_orig_format){
    var splitted = hebrew_date_orig_format.split('/');
    var hebrew_day_numeric = splitted[0];
    var hebrew_month_numeric = splitted[1];
    var hebrew_day = hebrew_days[hebrew_day_numeric - 1] + "'";
    var hebrew_month = hebrew_months[hebrew_month_numeric - 1];
    var formatted_hebrew_date = [hebrew_day,hebrew_month,current_year].join(" ");    
    return formatted_hebrew_date;
}


export function parse_sfirat_haomer(sfirat_haomer_numeric){
    var days_count_hebrew = omer_days_count_to_hebrew(sfirat_haomer_numeric);
    var omer_days_hebrew = [days_count_hebrew, laomer].join(' ');
    return omer_days_hebrew;
}

function omer_days_count_to_hebrew(sfirat_haomer_numeric){
    if (sfirat_haomer_numeric < 10){
        days_descriptor = 'ימים';
    }
    var ones = sfirat_haomer_numeric % 10;
    var tens = sfirat_haomer_numeric - ones;
    var ones_hebrew = '';
    if (ones > 0){
        ones_hebrew = number_to_hebrew_word[ones - 1];
    }
    var tens_hebrew = '';
    if (tens > 0){
        tens_hebrew = tens_number_to_hebrew_word[tens/10 - 1];
        if (ones > 0){
            tens_hebrew = ones_and_tens_connector + tens_hebrew;
        }
    }
    var first_part_result = [hayom, ones_hebrew, tens_hebrew, yom].join(' ');
    return first_part_result;
}