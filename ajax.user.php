<?php
// username is a MD5 hash
// file_put_contents('post', $_POST.PHP_EOL, FILE_APPEND);
if (isset($_POST)) {
  if (isset($_POST['chatroom'])) {
    $jsonAr = json_encode (new stdClass);
    $chatroom = 'chat.'.trim(htmlentities(strip_tags(substr($_POST['chatroom'], 0, 32)), ENT_QUOTES)).'.json';
    if (file_exists($chatroom)) {
      $jsonAr = json_decode(file_get_contents($chatroom), true);
    }
    
    $check_array = array('username', 'fullname', 'message');
    if (!array_diff($check_array, array_keys($_POST))) {
      if (strlen($_POST['username']) == 32) && (strlen($_POST['message']) > 0) {
        // if ($_POST['username'] != 'ENTER YOUR NAME') {
        if ($_POST['username'] != '2296ccd7646898546e22d60a049d2e6b') {
          $username = trim(htmlentities(strip_tags(substr($_POST['username'], 0, 32)), ENT_QUOTES));
          $fullname = trim(htmlentities(strip_tags(substr($_POST['fullname'], 0, 32)), ENT_QUOTES));
          $message = stripslashes(htmlentities(strip_tags(substr($_POST['message'], 0, 300)), ENT_QUOTES));
          $chat = array(
            "username" => $username,
            "message" => $message,
            "timestamp" => (int)(microtime(true) * 1000)   // 1550293556854
            // "timestamp" => date('H:i:s',time())
          );
          $jsonAr[] = $chat;
        }
      }
    }
    
    if (sizeof($jsonAr)) {
      $jsonAr = array_slice($jsonAr, sizeof($jsonAr) - 70);
      // $jsonAr = array_slice($jsonAr, -20, 20);
      file_put_contents($chatroom, json_encode($jsonAr));
    }

    echo json_encode($jsonAr);
  }
}


