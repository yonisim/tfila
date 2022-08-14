from datetime import datetime
import json
import os
import pandas as pd

mapper = {
    'hebrew_date': 'תאריך מלא',
    'sunrise': 'הנץ החמה',
    'sunset': 'שקיעה'
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


xls_to_json("C:/Users/Yonatans/Downloads/calander_jewish_times.xlsx", "./data/parsed_dates.json")