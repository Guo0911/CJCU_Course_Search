import time, random, json
import urllib.request as req
from pymysql import NULL
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from webdriver_manager.chrome import ChromeDriverManager

start_t = time.time()

year_list = {112: [1], 111: [1, 2], 110: [1, 2], 109: [1, 2], 108: [1, 2], 107: [1, 2]}
Class_ID = {"A": 1, "B": 2, "C": 3, "D": 4}
cjcu_title = "https://eportal.cjcu.edu.tw"

dep_id = {}


def get_select_value(element_id):  # 獲取專業課程或共同課程的課程代碼前綴
    select = chrome.find_element(By.ID, element_id)

    option = select.find_elements(By.TAG_NAME, "option")
    for opt in option:
        try:
            dep_id[opt.text] = opt.get_attribute("value")
        except:
            print(opt.text + " ERROR")


error_module = []


def get_module(course_json, general):
    module = ""

    if course_json != "":
        course_json = json.loads(course_json)
        module = course_json["modules"][0]["name"]

        if "-" in module:
            module = module.split("-")[0]
        else:
            error_module.append(module)
            module = ""

    general = general.replace("105學年度(含)後之通識類別:「", "").replace("」。", "")

    if module != "":
        return module
    elif general != "":
        return general
    else:
        return ""


options = webdriver.ChromeOptions()
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option("useAutomationExtension", False)
options.add_experimental_option(
    "prefs",
    {
        "profile.password_manager_enabled": False,
        "credentials_enable_service": False,
        "profile.default_content_setting_values": {"notifications": 2},
    },
)
options.add_experimental_option("excludeSwitches", ["enable-logging"])
chrome = webdriver.Chrome(ChromeDriverManager().install(), chrome_options=options)
chrome.maximize_window()

chrome.get("https://eportal.cjcu.edu.tw/syllabus")

button_of_dep_search = chrome.find_element(By.ID, "btndep")

button_of_dep_search.click()

course_class = ["專業課程", "共同課程"]
for cc in course_class:
    select_of_course_class = Select(chrome.find_element(By.ID, "dep_type"))
    select_of_course_class.select_by_visible_text(cc)
    get_select_value("deps")

with open("./Data/department.json", "w", encoding="utf-8") as j:
    json.dump(dep_id, j, indent=4, ensure_ascii=False)

chrome.quit()

course_information = {}
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36 Edg/96.0.1054.57"
}
for year in year_list.keys():  # stop when y is 106
    course_information[year] = {}
    for semester in year_list[year]:
        course_information[year][semester] = {}
        for edus in ["大學部"]:
            course_information[year][semester][edus] = {}
            for dep in dep_id.keys():
                course_information[year][semester][edus][dep] = {}
                for grade in range(1, 5):
                    request = req.Request(
                        f"https://eportal.cjcu.edu.tw/api/Course/Get/?syear={year}&semester={semester}&dep={dep_id[dep]}&grade={grade}",
                        headers=headers,
                    )

                    with req.urlopen(request) as response:
                        data = response.read().decode("utf-8")

                    data = json.loads(data)

                    grade_information = {}
                    for d in data:
                        grade_information[d["open_no"]] = {
                            "class_": d["class_name"],  # 班級名稱：A、B、C、D
                            "course_name": d["course_name"],  # 課程名稱
                            "course_sm": d["course_sm_name"],  # 選必修
                            "credit": d["credit"],  # 學分
                            "grade_information": d["group_note"],  # 合班資訊
                            "rule": d["rule_name"],  # 選課規則：先到先選...
                            "module": get_module(
                                d["module_note"], d["comm_general_kind_v2_name"]
                            ),  # A、B、C模組或通識類別
                            "course_link": cjcu_title
                            + d["CoreCapability_path"],  # 課程大綱
                        }

                    course_information[year][semester][edus][dep][
                        grade
                    ] = grade_information


for year in year_list.keys():  # stop when y is 106
    for semester in year_list[year]:
        for edus in ["大學部"]:
            for dep in dep_id.keys():
                for grade in range(1, 5):
                    now_grade_information = {}
                    for course_id in course_information[year][semester][edus][dep][
                        grade
                    ].keys():
                        request = req.Request(
                            f"https://eportal.cjcu.edu.tw/api/Course/GetSummary/?syear={year}&semester={semester}&openno={course_id}",
                            headers=headers,
                        )

                        with req.urlopen(request) as response:
                            data = response.read().decode("utf-8")

                        data = json.loads(data)
                        time_list_unprocessing = data["course_arrange_time_info"].split(
                            ";"
                        )  # 星期一(6節~7節)T30202;星期三(3節~3節)T30205
                        time_list = []
                        for time_ in time_list_unprocessing:
                            now_time = time_.split("(")
                            now_time = [now_time[0]] + now_time[1].split(")")
                            if len(now_time) == 2:
                                time_list.append(
                                    {
                                        "course_date": now_time[0],
                                        "course_time": now_time[1],
                                        "course_classroom": "",
                                    }
                                )
                            elif len(now_time) == 3:
                                time_list.append(
                                    {
                                        "course_date": now_time[0],
                                        "course_time": now_time[1],
                                        "course_classroom": now_time[2],
                                    }
                                )
                            else:
                                print("Error")

                        main_teacher = data["master_teacher_name"]
                        other_teacher = data["other_teacher_name"].split(";")
                        if other_teacher == [""]:
                            teacher_list = [main_teacher]
                        else:
                            teacher_list = [main_teacher] + other_teacher

                        grade_information = course_information[year][semester][edus][
                            dep
                        ][grade][course_id]

                        if grade_information["class_"] not in now_grade_information:
                            now_grade_information[grade_information["class_"]] = {}

                        now_grade_information[grade_information["class_"]][
                            course_id
                        ] = {}
                        times = 0
                        for teacher in teacher_list:
                            times += 1
                            now_grade_information[grade_information["class_"]][
                                course_id
                            ][times] = {
                                "課程名稱": grade_information["course_name"],
                                "學分": grade_information["credit"],
                                "選必修": grade_information["course_sm"],
                                "時間組": time_list,
                                "教師": teacher,
                                "課程大綱": grade_information["course_link"],
                                "模組": grade_information["module"],
                                "備註": [
                                    grade_information["grade_information"],
                                    grade_information["rule"],
                                ],
                            }

                    course_information[year][semester][edus][dep][
                        grade
                    ] = now_grade_information


end_t = time.time()
print(end_t - start_t)

with open("./Data/Data.json", "w", encoding="utf-8") as dj:
    json.dump(course_information, dj, indent=4, ensure_ascii=False)


with open("./Data/Error_Module.json", "w", encoding="utf-8") as em:
    json.dump(error_module, em, indent=4, ensure_ascii=False)

# open_no 課程代碼
# class_name 班級名稱
# course_sm_name 選必修
# credit 學分
# course_name 課程名稱
# group_note 合班訊息(資工2A/2B合班)
# module_note 模組課程
# CoreCapability_path 課程大綱
# rule_name 先到先選；人工審核
# comm_general_kind_name 通識類別 ~104
# comm_general_kind_v2_name 通識類別 105~
