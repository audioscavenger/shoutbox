<?php
// username and chatroom are MD5 hash
// $_POST = messageDict = [{"chatroom":"aaa","index":10"},..,{"chatroom":"bbb","index":currentNum","username":"md5","fullname":"lolo","message":"blah blah"}]
// $_POST = messageDict = [{"chatroom":"0e23f94f1435d2e63d39865c407d847f","index":0}, ..]
if (isset($_POST)) {
  // http://thisinterestsme.com/receiving-json-post-data-via-php/
  $jsonPost = json_decode(trim(file_get_contents("php://input")), true);
  // file_put_contents('post', json_encode($jsonPost).PHP_EOL);
  // file_put_contents('post', var_dump(json_decode($_POST, true), FILE_APPEND);
  // echo json_encode($jsonPost);
  // return;

  //If json_decode failed, the JSON is invalid.
  if (is_array($jsonPost)) {
    // file_put_contents('post', json_encode($jsonPost).PHP_EOL, FILE_APPEND);
    foreach ($jsonPost as $room) {
      // file_put_contents('post', json_encode($room).PHP_EOL, FILE_APPEND);
      $check_array = array('chatroom', 'index');
      if (!array_diff($check_array, array_keys($room))) {
      
        // this works although generates errors...
        // $jsonAr = json_decode(file_get_contents($chatroom), true) ? : [];
        // $index = (end($jsonAr)['index']) ? : 0;
        
        $jsonAr = [];
        $chatroom = 'chat.'.trim(htmlentities(strip_tags(substr($room['chatroom'], 0, 32)), ENT_QUOTES)).'.json';
        if (file_exists($chatroom)) {
          $jsonAr = json_decode(file_get_contents($chatroom), true);  // get indexed history
          $index = end($jsonAr)['index'];
        } else { $index = -1; }
        
        // is username sending a message as well?
        $check_array = array('username', 'fullname', 'message');
        if (!array_diff($check_array, array_keys($room))) {
          if (strlen($room['username']) == 32 && strlen($room['message']) > 0) {
            // TODO: replace this check by a uniq user test from users.json
            // if ($room['username'] != 'ENTER YOUR NAME') {
            if ($room['username'] != '2296ccd7646898546e22d60a049d2e6b') {
              $username = trim(htmlentities(strip_tags($room['username']), ENT_QUOTES));
              $fullname = trim(htmlentities(strip_tags(substr($room['fullname'], 0, 32)), ENT_QUOTES));
              $message = stripslashes(htmlentities(strip_tags(substr($room['message'], 0, 288)), ENT_QUOTES));
              $chat = array(
                "username" => $username,
                "message" => $message,
                "timestamp" => (int)(microtime(true) * 1000)   // 1550293556854
                // "index" => $index++   // this is the actual index of the very last message sent to this room + 1
                // "timestamp" => date('H:i:s',time())
              );
              $jsonAr[] = $chat;
            }
          }
        }
        
        if (sizeof($jsonAr)) {
          // comment this line to keep full history:
          $jsonAr = array_slice($jsonAr, -10, null, true);
          file_put_contents($chatroom, json_encode($jsonAr));
        }

        // we return only the missing messages from $room['index']+1 to sizeof($jsonAr)
        $indexStart = (isset($jsonAr[$room['index']])) ? array_search($room['index']+1,array_keys($jsonAr)) : 0;
        // echo json_encode(array_slice($jsonAr, $indexStart, null, true));
        $messageDict[$room['chatroom']] = array_slice($jsonAr, $indexStart, null, true);
      }
    }
    echo json_encode($messageDict);
  }
}

// test:
// $jsonAr = array(29=>array( "username"=>"u1", "fullname"=>"gigi", "message"=>"aa"),30=>array( "username"=>"u1", "fullname"=>"gigi", "message"=>"bb"),31=>31);
// print_r($jsonAr);
// print_r(json_encode($jsonAr));       // {"29":{"username":"u1","fullname":"gigi","message":"aa"},"30":{"username":"u1","fullname":"gigi","message":"bb"},"31":31}
// print_r(array_slice($jsonAr,29));    // nothing, there are only 2 elements in here
// print_r(array_combine(range(1, count($jsonAr)), array_values($jsonAr)));
// print_r(array_combine(range(5, count($jsonAr)+4), array_values($jsonAr)));

// $room['index']=29;echo array_search($room['index'],array_keys($jsonAr)); // = 0
// $room['index']=29;echo array_search(++$room['index'],array_keys($jsonAr)); // = 1
// $room['index']=29;print_r(array_slice($jsonAr, array_search(++$room['index'],array_keys($jsonAr)), null, true));
// $room['index']=29;print_r(json_encode(array_slice($jsonAr, array_search(++$room['index'],array_keys($jsonAr)), null, true))); // {"30":{"username":"u1","fullname":"gigi","message":"bb"},"31":31}

