<?php
$server_name = 'server_name';
$username = 'username';
$password = 'password';
$db_name = 'db_name';


$link = new mysqli($server_name, $username, $password, $db_name);

mysqli_query($link, "SET NAMES utf8");

if (!empty($link->connect_error)) {
  die('資料庫連線錯誤:' . $link->connect_error);
}
