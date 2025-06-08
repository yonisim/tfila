import json
from datetime import datetime, timedelta, time

def get_stars_for_date(some_date, times):
    times_for_date = times.get(str(some_date.date()))
    return time.fromisoformat((times_for_date['stars']))

def days_diff(some_date, days_diff):
    return some_date + timedelta(days=days_diff)

def minutes_diff(some_date, minutes_diff):
    return some_date + timedelta(minutes=minutes_diff)

def get_latest_stars_of_week(date_of_sunday, times):
    latest_stars = time(0)
    for x in range(5):
        try:
            stars_for_date = get_stars_for_date(days_diff(date_of_sunday, x), times)
            print(f'Comparing {latest_stars} with {stars_for_date}')
            latest_stars = max(latest_stars, stars_for_date)
        except Exception as e:
            print(e)
    return latest_stars

def round_stars_to_closest_five(some_time):
    minutes = some_time.minute
    modulu_five = minutes % 5
    if modulu_five == 0:
        minutes_delta = 0
    elif modulu_five == 1:
        minutes_delta = -1
    else:
        minutes_delta = 5 - modulu_five
    rounded_to_closest_five = datetime.combine(datetime.today(), some_time) + timedelta(minutes=minutes_delta)
    return rounded_to_closest_five

        

def generate_mincha_maariv_times(input_file_path, output_file_path):
    mincha_maariv_result = dict()
    with open(input_file_path, 'r', encoding="utf-8") as f:
        times = json.loads(f.read())
        #print(times)
        for k,v in times.items():
            as_date = datetime.fromisoformat(k)
            #print(as_date)
            weekday = as_date.weekday()
            #print(weekday)
            if weekday == 6:
                print(f'sunday {as_date.date()}')
                latest_stars = get_latest_stars_of_week(as_date, times)
                print(f'latest_stars: {latest_stars}')
                rounded_stars = round_stars_to_closest_five(latest_stars)
                print(f'rounded stars: {rounded_stars}')
                mincha_time = minutes_diff(rounded_stars, -40)
                print(f'mincha: {mincha_time}')
                mincha_maariv_result[str(as_date.date())] = dict(mincha=mincha_time.strftime('%H:%M'), 
                                                                 maariv=rounded_stars.strftime('%H:%M'))
    with open(output_file_path, 'w+') as f:
        f.write(json.dumps(mincha_maariv_result, indent=4))

generate_mincha_maariv_times('../tfila-data/data/parsed_dates_tashpah.json', '../tfila-data/data/mincha_maariv_tashpah.json')