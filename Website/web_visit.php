<?php
date_default_timezone_set('Asia/Taipei');
require_once('config.php');

$DateAndTime = date('Y-m-d H:i:s a', time());

$data = "INSERT INTO `visit`(`date`) VALUES ('$DateAndTime')";

$result = mysqli_query($link, $data);
