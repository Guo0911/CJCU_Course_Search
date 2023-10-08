import pymysql
import json
from pymysql import NULL

with open("./Data/Data.json", "r", encoding="utf-8") as j:
    data = json.load(j)

db_settings = {
    "host": "localhost",
    "port": 3306,
    "user": "username",
    "password": "password",
    "db": "course",
    "charset": "utf8",
}


db = pymysql.connect(**db_settings)

total = 0
cursor = db.cursor()
for year in data.keys():
    for sem in data[year].keys():
        if total == 100:  # 上傳近一學期=1，兩學期=2
            continue

        total += 1
        for edus in data[year][sem].keys():
            for deps in data[year][sem][edus].keys():
                for grade in data[year][sem][edus][deps].keys():
                    for class_no in data[year][sem][edus][deps][grade].keys():
                        for course_id in data[year][sem][edus][deps][grade][
                            class_no
                        ].keys():
                            for times in data[year][sem][edus][deps][grade][class_no][
                                course_id
                            ].keys():
                                if class_no == "":
                                    c_no = NULL
                                else:
                                    c_no = class_no
                                if (
                                    data[year][sem][edus][deps][grade][class_no][
                                        course_id
                                    ][times]["模組"]
                                    != ""
                                ):
                                    cursor.execute(
                                        "INSERT INTO `Data` VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                                        (
                                            year,
                                            sem,
                                            edus,
                                            deps,
                                            grade,
                                            c_no,
                                            course_id,
                                            data[year][sem][edus][deps][grade][
                                                class_no
                                            ][course_id][times]["課程名稱"],
                                            data[year][sem][edus][deps][grade][
                                                class_no
                                            ][course_id][times]["學分"],
                                            data[year][sem][edus][deps][grade][
                                                class_no
                                            ][course_id][times]["選必修"],
                                            json.dumps(
                                                data[year][sem][edus][deps][grade][
                                                    class_no
                                                ][course_id][times]["時間組"]
                                            ),
                                            data[year][sem][edus][deps][grade][
                                                class_no
                                            ][course_id][times]["教師"],
                                            data[year][sem][edus][deps][grade][
                                                class_no
                                            ][course_id][times]["課程大綱"],
                                            f"#{data[year][sem][edus][deps][grade][class_no][course_id][times]['模組']}",
                                        ),
                                    )
                                else:
                                    cursor.execute(
                                        "INSERT INTO `Data` VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                                        (
                                            year,
                                            sem,
                                            edus,
                                            deps,
                                            grade,
                                            c_no,
                                            course_id,
                                            data[year][sem][edus][deps][grade][
                                                class_no
                                            ][course_id][times]["課程名稱"],
                                            data[year][sem][edus][deps][grade][
                                                class_no
                                            ][course_id][times]["學分"],
                                            data[year][sem][edus][deps][grade][
                                                class_no
                                            ][course_id][times]["選必修"],
                                            json.dumps(
                                                data[year][sem][edus][deps][grade][
                                                    class_no
                                                ][course_id][times]["時間組"]
                                            ),
                                            data[year][sem][edus][deps][grade][
                                                class_no
                                            ][course_id][times]["教師"],
                                            data[year][sem][edus][deps][grade][
                                                class_no
                                            ][course_id][times]["課程大綱"],
                                            NULL,
                                        ),
                                    )


db.commit()

db.close()
