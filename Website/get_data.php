<?php
require_once('config.php');

$data = "SELECT * FROM `data`";

$result = mysqli_query($link, $data);

while ($row = $result->fetch_assoc()) {
    echo "✐", json_encode($row);
}
