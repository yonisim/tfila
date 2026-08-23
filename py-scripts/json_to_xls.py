from datetime import timedelta

import pandas as pd
from pyluach import dates as pyluach_dates
from pyluach import parshios


def get_parasha(sunday_date):
    """Parasha (or holiday) for the Shabbat right after the given Sunday, per the Israel reading schedule."""
    saturday = sunday_date + timedelta(days=6)
    gd = pyluach_dates.GregorianDate(saturday.year, saturday.month, saturday.day)
    parasha = parshios.getparsha_string(gd, hebrew=True, israel=True)
    if parasha is None:
        return gd.holiday(israel=True, hebrew=True) or ''
    return parasha.replace(', ', '-')


def json_to_xls(input_file, output_file):
    df_json = pd.read_json(input_file, convert_dates=False)
    the_dict = df_json.to_dict()
    week_dates = [d.date() for d in the_dict.keys()]
    parashot = [get_parasha(d) for d in week_dates]
    mincha = [v['mincha'] for v in the_dict.values()]
    maariv = [v['maariv'] for v in the_dict.values()]
    df = pd.DataFrame(list(zip([str(d) for d in week_dates], parashot, mincha, maariv)),
                       columns=['תאריך', 'פרשה', 'מנחה', 'ערבית'])
    df.to_excel(output_file, index=False)

json_to_xls("C:\\Users\\Yonatan.Simkins\\git\\tfila-data\\data\\mincha_maariv_tashpaz.json",
 "C:\\Users\\Yonatan.Simkins\\Downloads\\mincha_maariv_tashpaz.xlsx")
