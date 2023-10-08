<?php
date_default_timezone_set('Asia/Taipei');
require_once('config.php');

$email = $_REQUEST["email"];
$question = $_REQUEST["question"];
$DateAndTime = date('Y-m-d H:i:s a', time());

$data = "INSERT INTO `question`(`date`, `mail`, `question`) VALUES ('$DateAndTime','$email','$question')";

$result = mysqli_query($link, $data);

echo "<script>alert('我們已收到您的訊息，謝謝您');history.back();</script>";
