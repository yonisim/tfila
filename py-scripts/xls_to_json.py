import codecs
from datetime import datetime
import json
import os
import pandas as pd

mapper = {
    'hebrew_date': 'יום בחודש',
    'dawn': 'עלות השחר',
    'tfilin': 'זמן טלית ותפילין',
    'sunrise': 'הנץ החמה',
    'shma_end': 'סו"ז ק"ש לגר"א',
    'mid_day': 'חצות',
    'mincha_gedola': 'מנחה גדולה',
    'plag': 'פלג המנחה',
    'sunset': 'שקיעה',
    'stars': 'צאת הכוכבים'
}

def xls_to_json(xls_file_path, output_file_path):
    xls = pd.ExcelFile(xls_file_path)
    sheet: pd.DataFrame = xls.parse(0)
    records_as_json = json.loads(sheet.to_json(orient='records'))
    formatted_json = {}
    for json_record in records_as_json:
        formatted_record = {}
        for k,v in mapper.items():
            formatted_record[k] = json_record.get(v)
        greg_timestamp = int(json_record.get('תאריך לועזי')/1000)
        greg_date = datetime.fromtimestamp(greg_timestamp)
        greg_date_str = greg_date.strftime('%Y-%m-%d')
        formatted_json[greg_date_str] = formatted_record
    json_for_print = json.dumps(formatted_json)
    print(json_for_print)
    print(json.loads(json_for_print))
    print(os.getcwd())
    with open(output_file_path, 'w+') as f:
        f.write(json_for_print)


def csv_to_json(csv_file_path, month_name):
    sheet: pd.DataFrame = pd.read_csv(csv_file_path)
    records_as_json = json.loads(sheet.to_json(orient='records'))
    formatted_json = {}
    for json_record in records_as_json:
        formatted_record = {}
        for k, v in mapper.items():
            formatted_record[k] = json_record.get(v)
        formatted_record['hebrew_date'] = ' '.join([formatted_record['hebrew_date'], month_name])
        greg_timestamp_val = json_record.get('תאריך לועזי')
        print(greg_timestamp_val)
        greg_date_str = datetime.strptime(greg_timestamp_val, '%d/%m/%Y').strftime('%Y-%m-%d')
        formatted_json[greg_date_str] = formatted_record
    return formatted_json


def dump_to_file(formatted_json, output_file_path):
    json_for_print = json.dumps(formatted_json, ensure_ascii=False, indent=4, sort_keys=True
) # Added indent and ensure_ascii for readability
    print(json_for_print)
    # The following print might be redundant if you just printed json_for_print
    # print(json.loads(json_for_print))
    print(os.getcwd())
    # It's good practice to specify encoding when working with files, especially with non-ASCII characters
    with open(output_file_path, 'w+', encoding='utf-8') as f:
        f.write(json_for_print)

parent_dir = "C:\\Users\\Yonatan Simkins\\Downloads\\day_times"
all_dates = {}
for filename in os.listdir(parent_dir):
    month_name = os.path.splitext(filename)[0]
    print(month_name)
    month_json = csv_to_json(os.path.join(parent_dir, filename), month_name)
    all_dates.update(month_json)
dump_to_file(all_dates, "../tfila-data/data/parsed_dates_tashpah.json",)

def sort_shagririm():
    print(os.getcwd())
    with codecs.open('C:\\Users\\Yonatans\\git\\electron-quick-start\\data\\shagririm.txt', 'r', 'utf-8') as f:
        lines = f.readlines()
        splitted_lines = []
        for line in lines:
            line = line.strip()
            splitted = line.split()
            splitted_lines.append(splitted)
        sorted_lines = sorted(splitted_lines, key= lambda item: item[-1])
        print(sorted_lines)

    with codecs.open('C:\\Users\\Yonatans\\git\\electron-quick-start\\data\\shagririm_sorted.txt', 'w+', 'utf-8') as f:
        for line in sorted_lines:
            print(' '.join(line), file=f)
