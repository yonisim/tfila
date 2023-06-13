import pandas as pd

def json_to_xls(input_file, output_file):
    df_json = pd.read_json(input_file, convert_dates=False)
    the_dict = df_json.to_dict()
    dates = [str(d.date()) for d in the_dict.keys()]
    mincha = [v['mincha'] for v in the_dict.values()]
    maariv = [v['maariv'] for v in the_dict.values()]
    df = pd.DataFrame(list(zip(dates, mincha, maariv)), columns=['תאריך','מנחה','ערבית'])
    df.to_excel(output_file)

json_to_xls("C:\\Users\\Yonatan.Simkins\\git\\tfila-data\\data\\mincha_maariv_v2.json",
 "C:\\Users\\Yonatan.Simkins\\Downloads\\mincha_maariv.xlsx")