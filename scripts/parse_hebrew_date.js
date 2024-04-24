'esversion: 8';

var hebrew_days = ["א","ב","ג","ד","ה","ו","ז","ח","ט","י","יא","יב","יג","יד","טו","טז"];
var hebrew_months = ["תשרי","חשוון","כסליו","טבת"];
var current_year = 'תשפ"ב';

var number_to_hebrew_word = ["אחד","שני","שלושה","ארבעה","חמישה","שישה","שבעה","שמונה","תשעה","עשרה"];
var tens_number_to_hebrew_word = ["עשר","עשרים","שלושים","ארבעים"];

var hayom = "היום";
var yom = "יום";
var yamim = "ימים";
var ones_and_tens_connector = ' ו';
var laomer = 'לעומר';
var shehem = "שהם";
var shavua = 'שבוע';
var shavuot = 'שבועות';

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

export function omer_days_count_to_hebrew(sfirat_haomer_numeric){
    var days_descriptor = yom;
    if (sfirat_haomer_numeric <= 10){
        days_descriptor = yamim;
    }
    
    var ones = sfirat_haomer_numeric % 10;
    if (sfirat_haomer_numeric == 10){
        ones = 10;
    }
    var tens = sfirat_haomer_numeric - ones;
    var ones_hebrew = '';
    if (ones > 0){
        if(ones == 2 && tens > 0){
            ones_hebrew = 'שנים';
        }else{
            ones_hebrew = number_to_hebrew_word[ones - 1];
        }
    }
    var tens_hebrew = '';
    if (tens > 0){
        tens_hebrew = tens_number_to_hebrew_word[tens/10 - 1];
        if (tens > 10 && ones > 0){
            tens_hebrew = ones_and_tens_connector + tens_hebrew;
        }
    }
    var first_part_result = [hayom, ones_hebrew, tens_hebrew, days_descriptor].join(' ');
    if(sfirat_haomer_numeric == 1){
        first_part_result = [hayom, yom, ones_hebrew].join(' ');
    }
    
    return first_part_result;
}

export function omer_days_count_to_hebrew_weeks(sfirat_haomer_numeric){
    var weeks_part_result = '';
    if (sfirat_haomer_numeric >= 7){
        var connector = shehem;
    
        var days = sfirat_haomer_numeric % 7;
        var weeks = Math.floor(sfirat_haomer_numeric / 7);
        var days_hebrew = '';
        var weeks_hebrew = '';

        if (weeks > 0){
            weeks_hebrew = number_to_hebrew_word[weeks-1]
            if (weeks == 1){
                weeks_hebrew = shavua + ' ' + weeks_hebrew;
            } else{
                weeks_hebrew = weeks_hebrew + ' ' + shavuot;
            }
            
        }
        if (days > 0){
            days_hebrew = number_to_hebrew_word[days - 1];
            if (days == 1){
                days_hebrew = ones_and_tens_connector + yom + ' ' + days_hebrew;
            } else{
                days_hebrew = ones_and_tens_connector + days_hebrew + ' ' + yamim;
            }
        }
        weeks_part_result = [connector, weeks_hebrew, days_hebrew].join(' ');
    }
    return weeks_part_result;
}