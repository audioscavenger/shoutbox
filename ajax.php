<?php

if (file_exists('chat.json')) {
  $jsonAr = json_decode(file_get_contents('chat.json'), true);
}

if (isset($_POST) && isset($_POST['username']) && (strlen($_POST['username']) > 0) && (strlen($_POST['message']) > 0)) {
  if ($_POST['username'] != 'username') {
    $username = htmlentities(strip_tags(substr($_POST['username'], 0, 20)), ENT_QUOTES);
    $message = stripslashes(htmlentities(strip_tags(substr($_POST['message'], 0, 300)), ENT_QUOTES));
    $chat = array("username" => $username, "message" => $message, "timestamp" => date('H:i:s',time()), "size" => sizeof($jsonAr));
    $jsonAr[] = $chat;
  }
}

// $jsonAr = array_slice($jsonAr, sizeof($jsonAr) - 70);
$jsonAr = array_slice($jsonAr, -20, 20);

file_put_contents("chat.json", json_encode($jsonAr));

echo json_encode($jsonAr);

