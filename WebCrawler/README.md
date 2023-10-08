# 網路爬蟲之長榮大學課程資訊

爬蟲最後更新日期為**2023/10/08**，後續若學校網站更新可能導致失效。

若失效可自行根據原始碼進行維護，若有疑問歡迎來信 jhih.rong.guo@gmail.com

## 環境安裝

  - **`Python環境`**
    - **Python 3.9**

  - **`套件版本`**
    - **Selenium 4.8.3**
    - **PyMySQL 1.0.3**
    - **Webdriver-Manager 4.0.1**

  - **`簡易套件安裝方式`**
    - 將路徑指定至此資料夾
    - 輸入指令 `pip install -r requirements.txt`

## 注意事項

  - **`Selenium版本不同可能導致程式碼無法正常運行`**
    - 在**4.13.0**版本`Selenium.webdriver.Chrome()`寫法會有差異
    - 現行版本與早期版本搜尋元素寫法差異
      - 較早期搜尋元素`id`屬性`target`的寫法為`find_element_by_id('target')`
      - 現版本搜尋元素`id`屬性`target`的寫法為`find_element(By.ID, 'target')`