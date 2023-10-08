window.onscroll = Check_top_btn; //畫面滾動觸發 Check_top_btn

var arr, zhuyin_dict = {}, year = "", semester = "", deps = "", grade = "", class_no = "", input = ""

var search_related_set = new Set(), search_related_dep_set = new Set(), related_mode = false, Zhuyin_dict = {}

var edu_center = ['通識教育中心', '語文教育中心', '華語文教育中心', '共同教育中心', '校安中心', '學生學習組']

var general_module = ['#敬天', '#愛人', '#惜物', '#力行']

var day = { "星期一": 0, "星期二": 1, "星期三": 2, "星期四": 3, "星期五": 4, "星期六": 5, "星期日": 6 }

var Zhuyin = /[\u3105-\u3129\u02CA\u02C7\u02CB\u02D9]/ //注音的Unicode碼，用於檢測搜尋框有沒有注音

visit()
Zhuyin_read()
Client_connect()

function visit() {
    $.get("web_visit.php", function (data) { })
} // 更新造訪次數

function Zhuyin_read() {
    $.get("get_zhuyin.php", function (data) {
        zhuyin_sql = data.split("✐")
        for (i = 1; i < zhuyin_sql.length; i++) {
            zhuyin_sql[i] = JSON.parse(zhuyin_sql[i])
            zhuyin_dict[zhuyin_sql[i]['Chinese']] = zhuyin_sql[i]['Zhuyin'].split(",")
        }
    })
} // 讀取中文注音辭典

function Client_connect() {
    $.get("get_data.php", function (data) {
        arr = data.split("✐")

        year_semester_set = new Set()
        year_set = new Set()
        semester_set = new Set()
        dep_set = new Set()
        grade_set = new Set()
        class_set = new Set()

        search_related_set = new Set()
        search_related_dep_set = new Set()

        for (i = 1; i < arr.length; i++) {
            arr[i] = JSON.parse(arr[i])
            arr[i]['course_time_group'] = JSON.parse(arr[i]['course_time_group'])
            year_semester_set.add(arr[i]['year'] + "-" + arr[i]['semester'])
            year_set.add(arr[i]['year'])
            semester_set.add(arr[i]['semester'])
            dep_set.add(arr[i]['deps'])
            grade_set.add(arr[i]['grade'])
            class_set.add(arr[i]['class_no'])

            teacher = arr[i]['course_teacher']
            while (teacher.includes(" ")) {
                teacher = teacher.replace(" ", "-")
            }

            if (arr[i]['class_no'] == "NULL") {
                search_related_dep_set.add(arr[i]['deps'] + arr[i]['grade'] + "#")
            }
            else {
                search_related_dep_set.add(arr[i]['deps'] + arr[i]['grade'] + arr[i]['class_no'])
            }
            search_related_set.add(arr[i]['course_name'])
            search_related_set.add(teacher)

            if (general_module.includes(arr[i]['course_module'])) {
                search_related_set.add(arr[i]['course_module'])
            }

            for (let j of arr[i]['course_time_group']) {
                search_related_set.add(j['course_classroom'])
            }
        }
        $("ul.year").empty()
        $("ul.semester").empty()
        $("ul.deps_1").empty()
        $("ul.deps_2").empty()
        $("ul.grade").empty()
        $("ul.class_no").empty()
        $("#course_tabs").empty()
        $("#course_table").empty()

        year_semester_set = Array.from(year_semester_set).sort().reverse()
        for (let i of year_semester_set) {
            i = i.split("-")
            Create_tabs_and_table(i[0], i[1])
        }

        year_set = Array.from(year_set).sort().reverse()
        for (let i of year_set) {
            $('ul.year').append('<li class="Second_level year" onclick=Search("year","' + i + '")><span>' + i + '</span></li>')
        }

        semester_set = Array.from(semester_set).sort()
        for (let i of semester_set) {
            $('ul.semester').append('<li class="Second_level semester" onclick=Search("semester","' + i + '")><span>' + i + '</span></li>')
        }

        dep_set = Array.from(dep_set).sort()
        for (let i of dep_set) {
            if (edu_center.indexOf(i) == -1) {
                $('.deps_1').append('<li id="' + i + '" class="Third_level deps" onclick=Search("deps","' + i + '")><span>' + i + '</span></li>')
            }
            else {
                $('.deps_2').append('<li id="' + i + '" class="Third_level deps" onclick=Search("deps","' + i + '")><span>' + i + '</span></li>')
            }
        }

        grade_set = Array.from(grade_set).sort()
        for (let i of grade_set) {
            $('ul.grade').append('<li id="' + i + '" class="Second_level grade" onclick=Search("grade","' + i + '")><span>' + i + '</span></li>')
        }

        class_set = Array.from(class_set).sort()
        for (let i of class_set) {
            if (i != "NULL") {
                $('ul.class_no').append('<li id="' + i + '" class="Second_level class_no" onclick=Search("class_no","' + i + '")><span>' + i + '</span></li>')
            }
            else {
                $('ul.class_no').append('<li id="' + i + '" class="Second_level class_no" onclick=Search("class_no","' + i + '")><span>共同課程</span></li>')
            }
        }

        search_related_set = Array.from(search_related_set).sort()
        search_related_dep_set = Array.from(search_related_dep_set).sort()

        // document.getElementById("How_to_use_img").style.display = "block";

        Search("input", input) // 當clear按鈕被點擊，需要進行搜尋框的判斷，初次載入並不受影響
    });
} // 連結時取得資料及科系輸出，已完成

function Create_tabs_and_table(y, s) {

    tab_html = `
    <li class="nav-item">
      <a class="nav-link Tabs disabled" id="${y}-${s}-course" data-bs-toggle="tab" href="#show-${y}-${s}-course">${y}-${s}</a>
    </li>
               `

    table_html = `
            <div class="tab-pane fade" id="show-${y}-${s}-course">
                <table class="Table_css">
                    <tr class="Table_title">
                        <th></th>
                        <th>週一</th>
                        <th>週二</th>
                        <th>週三</th>
                        <th>週四</th>
                        <th>週五</th>
                        <th>週六</th>
                        <th>週日</th>
                    </tr>

                    <tr>
                        <th>第 0 節<br><br>07:10 ~ 08:00</th>
                        <td id="${y}-${s}-0-0"></td>
                        <td id="${y}-${s}-0-1"></td>
                        <td id="${y}-${s}-0-2"></td>
                        <td id="${y}-${s}-0-3"></td>
                        <td id="${y}-${s}-0-4"></td>
                        <td id="${y}-${s}-0-5"></td>
                        <td id="${y}-${s}-0-6"></td>
                    </tr>
                    
                    <tr>
                        <th>第 1 節<br><br>08:10 ~ 09:00</th>
                        <td id="${y}-${s}-1-0"></td>
                        <td id="${y}-${s}-1-1"></td>
                        <td id="${y}-${s}-1-2"></td>
                        <td id="${y}-${s}-1-3"></td>
                        <td id="${y}-${s}-1-4"></td>
                        <td id="${y}-${s}-1-5"></td>
                        <td id="${y}-${s}-1-6"></td>
                    </tr>
                    
                    <tr>
                        <th>第 2 節<br><br>09:10 ~ 10:00</th>
                        <td id="${y}-${s}-2-0"></td>
                        <td id="${y}-${s}-2-1"></td>
                        <td id="${y}-${s}-2-2"></td>
                        <td id="${y}-${s}-2-3"></td>
                        <td id="${y}-${s}-2-4"></td>
                        <td id="${y}-${s}-2-5"></td>
                        <td id="${y}-${s}-2-6"></td>
                    </tr>
                    
                    <tr>
                        <th>第 3 節<br><br>10:10 ~ 11:00</th>
                        <td id="${y}-${s}-3-0"></td>
                        <td id="${y}-${s}-3-1"></td>
                        <td id="${y}-${s}-3-2"></td>
                        <td id="${y}-${s}-3-3"></td>
                        <td id="${y}-${s}-3-4"></td>
                        <td id="${y}-${s}-3-5"></td>
                        <td id="${y}-${s}-3-6"></td>
                    </tr>
                    
                    <tr>
                        <th>第 4 節<br><br>11:10 ~ 12:00</th>
                        <td id="${y}-${s}-4-0"></td>
                        <td id="${y}-${s}-4-1"></td>
                        <td id="${y}-${s}-4-2"></td>
                        <td id="${y}-${s}-4-3"></td>
                        <td id="${y}-${s}-4-4"></td>
                        <td id="${y}-${s}-4-5"></td>
                        <td id="${y}-${s}-4-6"></td>
                    </tr>
                    
                    <tr>
                        <th>第 5 節<br><br>12:10 ~ 13:00</th>
                        <td id="${y}-${s}-5-0"></td>
                        <td id="${y}-${s}-5-1"></td>
                        <td id="${y}-${s}-5-2"></td>
                        <td id="${y}-${s}-5-3"></td>
                        <td id="${y}-${s}-5-4"></td>
                        <td id="${y}-${s}-5-5"></td>
                        <td id="${y}-${s}-5-6"></td>
                    </tr>
                    
                    <tr>
                        <th>第 6 節<br><br>13:20 ~ 14:10</th>
                        <td id="${y}-${s}-6-0"></td>
                        <td id="${y}-${s}-6-1"></td>
                        <td id="${y}-${s}-6-2"></td>
                        <td id="${y}-${s}-6-3"></td>
                        <td id="${y}-${s}-6-4"></td>
                        <td id="${y}-${s}-6-5"></td>
                        <td id="${y}-${s}-6-6"></td>
                    </tr>
                    
                    <tr>
                        <th>第 7 節<br><br>14:20 ~ 15:10</th>
                        <td id="${y}-${s}-7-0"></td>
                        <td id="${y}-${s}-7-1"></td>
                        <td id="${y}-${s}-7-2"></td>
                        <td id="${y}-${s}-7-3"></td>
                        <td id="${y}-${s}-7-4"></td>
                        <td id="${y}-${s}-7-5"></td>
                        <td id="${y}-${s}-7-6"></td>
                    </tr>
                    
                    <tr>
                        <th>第 8 節<br><br>15:20 ~ 16:10</th>
                        <td id="${y}-${s}-8-0"></td>
                        <td id="${y}-${s}-8-1"></td>
                        <td id="${y}-${s}-8-2"></td>
                        <td id="${y}-${s}-8-3"></td>
                        <td id="${y}-${s}-8-4"></td>
                        <td id="${y}-${s}-8-5"></td>
                        <td id="${y}-${s}-8-6"></td>
                    </tr>
                    
                    <tr>
                        <th>第 9 節<br><br>16:20 ~ 17:10</th>
                        <td id="${y}-${s}-9-0"></td>
                        <td id="${y}-${s}-9-1"></td>
                        <td id="${y}-${s}-9-2"></td>
                        <td id="${y}-${s}-9-3"></td>
                        <td id="${y}-${s}-9-4"></td>
                        <td id="${y}-${s}-9-5"></td>
                        <td id="${y}-${s}-9-6"></td>
                    </tr>
                    
                    <tr>
                        <th>第 10 節<br><br>17:20 ~ 18:10</th>
                        <td id="${y}-${s}-10-0"></td>
                        <td id="${y}-${s}-10-1"></td>
                        <td id="${y}-${s}-10-2"></td>
                        <td id="${y}-${s}-10-3"></td>
                        <td id="${y}-${s}-10-4"></td>
                        <td id="${y}-${s}-10-5"></td>
                        <td id="${y}-${s}-10-6"></td>
                    </tr>
                    
                    <tr>
                        <th>第 11 節<br><br>18:20 ~ 19:10</th>
                        <td id="${y}-${s}-11-0"></td>
                        <td id="${y}-${s}-11-1"></td>
                        <td id="${y}-${s}-11-2"></td>
                        <td id="${y}-${s}-11-3"></td>
                        <td id="${y}-${s}-11-4"></td>
                        <td id="${y}-${s}-11-5"></td>
                        <td id="${y}-${s}-11-6"></td>
                    </tr>
                    
                    <tr>
                        <th>第 12 節<br><br>19:15 ~ 20:05</th>
                        <td id="${y}-${s}-12-0"></td>
                        <td id="${y}-${s}-12-1"></td>
                        <td id="${y}-${s}-12-2"></td>
                        <td id="${y}-${s}-12-3"></td>
                        <td id="${y}-${s}-12-4"></td>
                        <td id="${y}-${s}-12-5"></td>
                        <td id="${y}-${s}-12-6"></td>
                    </tr>
                    
                    <tr>
                        <th>第 13 節<br><br>20:10 ~ 21:00</th>
                        <td id="${y}-${s}-13-0"></td>
                        <td id="${y}-${s}-13-1"></td>
                        <td id="${y}-${s}-13-2"></td>
                        <td id="${y}-${s}-13-3"></td>
                        <td id="${y}-${s}-13-4"></td>
                        <td id="${y}-${s}-13-5"></td>
                        <td id="${y}-${s}-13-6"></td>
                    </tr>
                    
                    <tr>
                        <th>第 14 節<br><br>21:05 ~ 21:55</th>
                        <td id="${y}-${s}-14-0"></td>
                        <td id="${y}-${s}-14-1"></td>
                        <td id="${y}-${s}-14-2"></td>
                        <td id="${y}-${s}-14-3"></td>
                        <td id="${y}-${s}-14-4"></td>
                        <td id="${y}-${s}-14-5"></td>
                        <td id="${y}-${s}-14-6"></td>
                    </tr>
                </table>
            </div>
                 `

    $("#course_tabs").append(tab_html)
    $("#course_table").append(table_html)
} // 創建新的學期選單及課表

function Search(class_, value) {
    switch (class_) {
        case "year":
            year = value
            break
        case "semester":
            semester = value
            break
        case "deps":
            deps = value
            break
        case "grade":
            grade = value
            if (class_no == "") {
                $('ul.class_no').slideDown()
                $('ul.grade').slideUp()
            }
            break
        case "class_no":
            class_no = value
            break
        case "input":
            input = value
            break
        case "clear":
            year = "", semester = "", deps = "", grade = "", class_no = ""
            Client_connect()
            $(".chosen").removeClass("chosen")
            $('ul.submenu ').slideUp()
            $('ul.year').slideDown()

            // document.getElementById("post").style.display = "block";
            // document.getElementById("How_to_use_img").style.display = "block";
            return
    }

    if (!Zhuyin.test(input)) { // 檢查搜尋框的文字有沒有注音，沒有注音就進入if內
        while (input.includes("-")) {
            input = input.replace("-", " ")
        }

        $("#table-content").empty()
        check_grade_class_no = [{ "grade": false, "A": false, "B": false, "C": false, "D": false, "NULL": false }, { "grade": false, "A": false, "B": false, "C": false, "D": false, "NULL": false }, { "grade": false, "A": false, "B": false, "C": false, "D": false, "NULL": false }, { "grade": false, "A": false, "B": false, "C": false, "D": false, "NULL": false }]
        check_class_no_have = { "A": false, "B": false, "C": false, "D": false, "NULL": false }
        activit_course = new Set()

        for (y_f = 107; y_f <= year_set[0]; y_f++) { // year_set[0] 為最新的學年
            for (s_f = 1; s_f <= 2; s_f++) {
                $(`#${y_f}-${s_f}-course`).addClass('disabled')
                for (i = 0; i < 7; i++) {
                    for (j = 0; j < 15; j++) {
                        $(`#${y_f}-${s_f}-${j}-${i}`).empty()
                    }
                }
            }
        }

        teacher_set_of_course_id = {}
        course_id = {}
        course_teacher = {}

        for (i = 1; i < arr.length; i++) {
            for (let k of arr[i]['course_time_group']) {
                classroom_check = ((k['course_classroom'].includes(input) && (input.length > 3)))
                if (classroom_check) {
                    break
                }
            }

            if (related_mode ||
                ((arr[i]['course_name'].replace("-", " ").includes(input) || arr[i]['course_teacher'].includes(input) || (`#${arr[i]['course_module']}`.includes(input) && general_module.includes(arr[i]['course_module'])) || classroom_check) && input != "") ||
                (input == "" && (year != "" || semester != "" || deps != "" || grade != "" || class_no != ""))) {

                if ((arr[i]['year'] != year && year != "") ||
                    (arr[i]['semester'] != semester && semester != "") ||
                    (arr[i]['deps'] != deps && deps != "")) { // 判斷是否與左方選項相同(搜尋欄輸入同樣會判斷)
                    continue
                }

                check_grade_class_no[parseInt(arr[i]['grade']) - 1]["grade"] = true

                if (arr[i]['grade'] != grade && grade != "") {
                    continue
                }

                check_grade_class_no[parseInt(arr[i]['grade']) - 1][arr[i]['class_no']] = true

                if (arr[i]['class_no'] != class_no && class_no != "") {
                    continue
                }

                for (let k of arr[i]['course_time_group']) {
                    if (classroom_check && !k['course_classroom'].includes(input)) {
                        continue
                    }

                    time = k['course_time'].replace(" ", "").replace("節", "").replace("節", "").split("~")
                    start_time = parseInt(time[0])
                    end_time = parseInt(time[1])

                    for (j = start_time; j <= end_time; j++) {

                        key = `${arr[i]['year']}-${arr[i]['semester']}-${(j)}-${day[k['course_date']]}-${arr[i]['course_id']}`

                        if (course_id.hasOwnProperty(key)) {
                            if (course_id[key]['course_teacher'].indexOf(arr[i]['course_teacher']) == -1) {
                                course_id[key]['course_teacher'].push(arr[i]['course_teacher'])
                            }
                            continue
                        }
                        else {
                            course_id[key] = {

                                "course_id": arr[i]['course_id'],
                                "course_name": arr[i]['course_name'],
                                "course_teacher": [arr[i]['course_teacher']],
                                "course_classroom": k['course_classroom'],
                                "course_date": `${arr[i]['year']}-${arr[i]['semester']}-${(j)}-${day[k['course_date']]}`,
                                "course_module": arr[i]['course_module'],
                                "course_outline": arr[i]['course_outline'].replace(arr[i]['course_id'], "change_now_course_id")

                            }
                        }
                        activit_course.add(arr[i]['year'] + "-" + arr[i]['semester'])
                    } // course_id[110-2-0-3-ACS008] = {course_id:ACS008, course_name:課程名稱, course_teacher:[黃琨義, 楊珮菁], course_classroom:T30201, course_date:110-2-0-3, course_module: "模組類別", course_outline:url}
                }
            }
        }

        for (let i in course_id) {
            key = course_id[i]['course_date']
            for (let k of course_id[i]['course_teacher']) {
                key += ("-" + k)
            }

            if (course_teacher.hasOwnProperty(key)) {
                course_teacher[key]['course_id'].push(course_id[i]['course_id'])
            }
            else {
                course_teacher[key] = {

                    "course_id": [course_id[i]['course_id']],
                    "course_name": course_id[i]['course_name'],
                    "course_teacher": course_id[i]['course_teacher'],
                    "course_classroom": course_id[i]['course_classroom'],
                    "course_date": course_id[i]['course_date'],
                    "course_module": course_id[i]['course_module'],
                    "course_outline": course_id[i]['course_outline']

                }
            }
        } // course_teacher[110-2-0-3-黃琨義-楊珮菁] = {course_id:[ACS008, ACS029], course_name:課程名稱, course_teacher:[黃琨義, 楊珮菁], course_classroom:T30201, course_date:110-2-0-3, course_module: "模組類別", course_outline:url}

        for (let i in course_teacher) {
            id_list = ""

            course_show_teacher = ""

            course_show_classroom =
                `
            <div>
                <a class='Class_room' onclick=Choose_related_words('${course_teacher[i]['course_classroom']}')>
                    ${course_teacher[i]['course_classroom']}
                </a>
            </div>
            `

            if (course_teacher[i]['course_id'].length > 1) {
                first_id = course_teacher[i]['course_id'].splice(0, 1)
                first_outline = course_teacher[i]['course_outline'].replace("change_now_course_id", first_id)

                for (let k of course_teacher[i]['course_id']) {
                    course_show_outline = (course_teacher[i]['course_outline'].replace("change_now_course_id", k))

                    id_list +=
                        `
                        <div>
                            <a class='Course_id' href="${course_show_outline}" target="_blank">
                                ${k} 
                            </a>
                        </div>
                        `
                }

                id_list = ("<br>" + id_list)
                course_show_id =
                    `
                <div class='Course_id_more'>
                    <a class='Course_id' href="${first_outline}" target="_blank">
                        ${first_id}
                    </a>
                    <img class='arrow' style='cursor: default;' height="15" src="img/Arrows_down_mini.png" alt="more">
                </div>
                <div class='Course_id_more_view'><strong class='Course_id_more_word>'${id_list}</strong></div>
                `
            }
            else {
                for (let k of course_teacher[i]['course_id']) {
                    course_show_outline = (course_teacher[i]['course_outline'].replace("change_now_course_id", k))

                    id_list +=
                        `
                        <div>
                            <a class='Course_id' href="${course_show_outline}" target="_blank">
                                ${k} 
                            </a>
                        </div>
                        `
                }

                course_show_id = id_list
            }

            teacher_list = ""
            for (let k of course_teacher[i]['course_teacher']) {
                teacher_list += ("<strong style='cursor: pointer;'><a class='Teacher' onclick=Choose_related_words('" + k + "')>" + k + "</a></strong>")
                if (course_teacher[i]['course_teacher'].length > 1) {
                    teacher_list += "<br>"
                }
            }

            if (general_module.includes(course_teacher[i]['course_module'])) {
                course_module_temp =
                    `
                <a class='Course_module' onclick=Choose_related_words('${course_teacher[i]['course_module']}')>
                    <strong style="cursor: pointer;">
                        (${course_teacher[i]['course_module'].replace("#", "")})
                    </strong>
                </a>
                `
            }
            else if (course_teacher[i]['course_module'] != 'NULL') {
                course_module_temp =
                    `
                <strong class='Course_module'>
                    (${course_teacher[i]['course_module'].replace("#", "")})
                </strong>
                `
            }
            else {
                course_module_temp = ''
            }

            if (course_teacher[i]['course_teacher'].length > 1) {
                teacher_list = ("<br>" + teacher_list)
                course_show_teacher =
                    `
                <div>
                    <a class='Course_name' onclick=Choose_related_words('${course_teacher[i]['course_name']}')>
                        <strong style="cursor: pointer;">
                            ${course_teacher[i]['course_name']}
                        </strong>
                    </a>
                    ${course_module_temp}
                    <br>
                    <a><strong style="color: black; cursor: default;"> | </strong></a>
                    <a class='Teacher_more'><strong style="cursor: pointer;">查看教師清單</strong></a>
                    <div class='Teacher_more_view'><strong class='Teacher_more_word>'${teacher_list}</strong></div>
                </div>
                `
            }
            else {

                course_show_teacher =
                    `
                <div>
                    <a class='Course_name' onclick=Choose_related_words('${course_teacher[i]['course_name']}')>
                        <strong style="cursor: pointer;">
                            ${course_teacher[i]['course_name']}
                        </strong>
                    </a>
                    ${course_module_temp}
                    <a><strong style="color: black; cursor: default;"> | </strong></a>
                    ${teacher_list}
                </div>
                `
            }

            if (course_teacher[i]['course_classroom'] != "") {
                course_show = course_show_id + course_show_teacher + course_show_classroom + "<br>"
            }
            else {
                course_show = course_show_id + course_show_teacher + "<br>"
            }

            $(`#${course_teacher[i]['course_date']}`).append(course_show)
        }

        for (let i of Array.from(activit_course)) {
            $(`#${i}-course`).removeClass('disabled')
        }

        $(".active").removeClass("active")
        $(".show").removeClass("show")

        last = Array.from(activit_course).sort().pop()
        $("#" + last + "-course").addClass("active")
        $("#show-" + last + "-course").addClass("show active")

        if (related_mode) {
            related_mode = false
            input = ""
        }

        check_have_grade = false // 當搜尋沒有任何項目時，不執行年級及班級的更換，以免造成數據遺失
        for (i = 0; i < 4; i++) {
            if (check_grade_class_no[i]['grade']) {
                check_have_grade = true
            }
        }
        if (!check_have_grade) {
            // document.getElementById("post").style.display = "block";
            // document.getElementById("How_to_use_img").style.display = "block";
            return
        }

        // document.getElementById("post").style.display = "none";
        // document.getElementById("How_to_use_img").style.display = "none";
        // 將如何使用的圖片隱藏

        if (grade != "" && !check_grade_class_no[parseInt(grade) - 1]['grade']) {
            grade = ""
            $("li[class = 'Second_level grade chosen']").removeClass('chosen')
            Search(class_, value)
            return
        }
        else if (class_no != "") {
            if (grade == "") {
                check_choose_class_no = false
                for (i = 0; i < 4; i++) {
                    if (check_grade_class_no[i][class_no]) {
                        check_choose_class_no = true
                    }
                }
                if (!check_choose_class_no) {
                    class_no = ""
                    $("li[class = 'Second_level class_no chosen']").removeClass('chosen')
                    Search(class_, value)
                    return
                }
            }
            else if (!check_grade_class_no[parseInt(grade) - 1][class_no]) {
                class_no = ""
                $("li[class = 'Second_level class_no chosen']").removeClass('chosen')
                Search(class_, value)
                return
            }
        }

        $('ul.grade').empty()
        $('ul.class_no').empty()

        for (i = 0; i < check_grade_class_no.length; i++) {
            if (check_grade_class_no[i]["grade"]) {
                $('ul.grade').append('<li id="' + (i + 1) + '" class="Second_level grade" onclick=Search("grade","' + (i + 1) + '")><span>' + (i + 1) + '</span></li>')

                for (let j of Object.keys(check_grade_class_no[i])) {
                    if (j == "grade") {
                        continue
                    }
                    if (check_grade_class_no[i][j] == true && !check_class_no_have[j]) {
                        if (j != "NULL") {
                            $('ul.class_no').append('<li id="' + j + '" class="Second_level class_no" onclick=Search("class_no","' + j + '")><span>' + j + '</span></li>')
                            check_class_no_have[j] = true
                        }
                        else {
                            $('ul.class_no').append('<li id="' + j + '" class="Second_level class_no" onclick=Search("class_no","' + j + '")><span>共同課程</span></li>')
                            check_class_no_have[j] = true
                        }
                    }
                }
            }
        }

        if (grade != "") {
            $("#" + grade).addClass('chosen')
        }

        if (class_no != "") {
            $("#" + class_no).addClass('chosen')
        }
    }
} // 執行課程搜尋

function Related_words(value) {
    document.getElementById("Search").style.color = "#2b2b2b";
    if (!Zhuyin.test(value)) {
        $(".Search_ul").empty()

        if (value != "") {
            related_set = new Set()

            for (let i of search_related_dep_set) {
                if (Word_to_Zhuyin(i, value, true)) {
                    related_set.add(i)
                }
            }

            for (let i of search_related_set) {
                if (Word_to_Zhuyin(i, value, false)) {
                    related_set.add(i)
                }
            }

            related_set = Array.from(related_set).sort()

            for (let i of related_set) {
                if (i != "") {
                    $(".Search_ul").append(`<li><button type="button" onclick=Choose_related_words('${i}')>${i}</button></li>`)
                }
            }

            if (related_set.length == 1) {
                Input_search(related_set[0])
            }
        }
    }
} // 搜尋欄相關字提示

function Word_to_Zhuyin(w, v, bool) {  // (比對項目、搜尋框內容、是否為學系比對)
    w = w.split("")
    v = v.split("")

    for (j = 0; j < w.length; j++) {
        if (zhuyin_dict[w[j]] == undefined) { // 如果注音辭典中沒有 w[j] 的注音，則將 w[j] 設為 w[j] 而不是注音
            w[j] = [w[j]]
        }
        else {
            w[j] = zhuyin_dict[w[j]]
        }
    }

    for (j = 0; j < v.length; j++) {
        if (zhuyin_dict[v[j]] == undefined) {
            v[j] = [v[j]]
        }
        else {
            v[j] = zhuyin_dict[v[j]]
        }
    }

    if (bool) {
        check_words = true
        for (j = 0; j < v.length; j++) {
            check_word = false
            for (let v_w of v[j]) {
                for (k = 0; k < w.length; k++) {
                    for (let w_w of w[k]) {
                        if (v_w == w_w) {
                            check_word = true
                            break
                        }
                    }
                    if (check_word) {
                        break
                    }
                }
                if (check_word) {
                    break
                }
            }
            if (!check_word) {
                check_words = false
            }
        }

        return check_words

    }
    else {
        check_words = false
        for (j = 0; j <= (w.length - v.length); j++) { // 資料結構，料結構
            first_check = false // 比對搜尋框內的首字與資料中第 j 個字是否相同，減少運算時間
            for (let w_w of w[j]) {
                for (let v_w of v[0]) {
                    if (w_w == v_w) {
                        first_check = true
                        break
                    }
                }
                if (first_check) {
                    break
                }
            }

            if (first_check) {
                check_words = true
                for (k = 0; k < v.length; k++) {
                    check_word = false
                    for (let w_w of w[j + k]) {
                        for (let v_w of v[k]) {
                            if (w_w == v_w) {
                                check_word = true
                                break
                            }
                        }
                        if (check_word) {
                            break
                        }
                    }
                    if (!check_word) {
                        check_words = false
                        break
                    }
                }
            }

            if (check_words) {
                break
            }
        }

        return check_words

    }
} // 文字轉換注音並配對，回傳 true 或 false

function Choose_related_words(value) {
    Input_search(value)
    $("#Search").val(value)
} // 選擇相關字

function Input_search(value) {
    dep_check = value.substring(0, value.length - 2)
    if (edu_center.includes(dep_check) || dep_check.includes("學系") || dep_check.includes("學程") || dep_check.includes("學士班")) {
        stay_deps = deps, stay_grade = grade, stay_class_no = class_no
        if (value.includes("1")) {
            grade = "1"
        }
        else if (value.includes("2")) {
            grade = "2"
        }
        else if (value.includes("3")) {
            grade = "3"
        }
        else if (value.includes("4")) {
            grade = "4"
        }

        if (value.includes("A")) {
            class_no = "A"
        }
        else if (value.includes("B")) {
            class_no = "B"
        }
        else if (value.includes("C")) {
            class_no = "C"
        }
        else if (value.includes("D")) {
            class_no = "D"
        }
        else if (value.includes("#")) {
            class_no = "NULL"
        }

        value = value.replace(grade, "").replace(class_no, "").replace("#", "")

        related_mode = true
        Search("deps", value)

        if ((deps + grade + class_no) != (stay_deps + stay_grade + stay_class_no)) {
            document.getElementById("Search").style.color = "#b6b6b6";

            $("#" + deps).removeClass('chosen')
            $("#" + grade).removeClass('chosen')
            $("#" + class_no).removeClass('chosen')

            deps = stay_deps, grade = stay_grade, class_no = stay_class_no

            try {
                $("#" + deps).addClass('chosen')
            }
            catch { }
            try {
                $("#" + grade).addClass('chosen')
            }
            catch { }
            try {
                $("#" + class_no).addClass('chosen')
            }
            catch { }
        }
    }
    else {
        Search("input", value)
    }
} // 輸入框關鍵字搜尋

function Check_top_btn() {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        document.getElementById("To_top_btn").style.display = "block";
    }
    else {
        document.getElementById("To_top_btn").style.display = "none";
    }
} // 檢查是否在最上層，以利顯示至頂按鈕

function To_top() {
    document.body.scrollTop = 0; // 針對 Safari 瀏覽器
    document.documentElement.scrollTop = 0; // 針對其他瀏覽器
} // 至頂按鈕按下後，要回到最上層

function Submit_a_question() {
    email = document.getElementById('email').value
    question = document.getElementById('question').value

    if (email.indexOf("cjcu.edu.tw") > 0) {
        if (question != "") {
            return true
        }
        else {
            alert("請輸入問題")
        }
    }
    else {
        alert("請輸入您正確的CJCU信箱")
    }
    return false

} // 提交問題

$(document).ready(function () {
    var $submenu = $('.submenu');
    var $mainmenu = $('.mainmenu');

    $submenu.hide();
    $submenu.first().delay(400).slideDown(700); // 讓第一個選單在啟動時等待0.4秒，並設定完全下拉速度為0.7秒

    $submenu.on('click', 'li', function () { //控制chosen
        $now_class = $(this).attr('class') + " chosen"
        $("li[class = '" + $now_class + "']").removeClass('chosen')
        $(this).addClass('chosen');

        switch ($(this).attr('class')) {
            case "Second_level year chosen":
                if (semester == "") {
                    $('ul.semester').slideDown()
                    $('ul.year').slideUp()
                }
                break
            case "Second_level semester chosen":
                if (deps == "") {
                    $('ul.deps').slideDown()
                    $('ul.semester').slideUp()
                }
                break
            case "Third_level deps chosen":
                if (grade == "") {
                    $('ul.grade').slideDown()
                    $('ul.deps').slideUp()
                }
            // grade 跳 class_no 改寫在 Search() 的 switch mode, 因為 Search() 會把 grade 及 class_no 的 li 重製
        }
    });

    $mainmenu.on('click', 'li', function () { //控制選單下拉
        $(this).next('.submenu').slideToggle().siblings('.submenu').slideUp();
        // slideToggle()用於滑動的切換顯示狀態，隱藏項目被點擊則顯示，反之顯示項目被點擊則隱藏。
        // siblings(.x)選取所有class為x的元素，但把$(this)排除在外，此處this代表點擊的項目。
        // slideUp()將元素狀態用滑動的切換至隱藏。
    });
}); // 控制左側選單亮燈，待修改不同欄位不互相影響