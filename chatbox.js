/*
https://bootsnipp.com/snippets/exR5v
https://codepen.io/emilcarlsson/pen/ZOQZaV

TODO:
- [ ] userDict class should include a trigger on messages to update the gui
- [ ] userDict should be a class
- [ ] download only new messages instead of the whole thing: add a counter to ajax.message.php 
- [ ] add a data-username= in <li class="contact">
- [ ] build the contact list from shoutbox active users
- [ ] make sure $("#fullname") is actually an input so its value is kept on page reload
- [ ] store gravatars in new user db + create new ajax.user.php or smth like so
- [ ] store generated gravatars locally in new css base64 elements
- [ ] lots of sensitive work is done at the client side to ease the server; I should encrypt this js !
*/

// var debug = true;
var debug = false;

var currentPeerName = $('.contact.active .name').text();    // always start with shoutbox or whatever the name will be
var shoutboxChatroom = MD5(currentPeerName);
var profileSize = '&s=40';
var chatSize = '&s=22';
var messageFormat = '<li class="{0}" data-username="{1}" data-timestamp={2} data-index={3}><img src="{4} alt="" /><p>{5}</p></li>';
var cannotClose = false;
var lastMessage = null;   // user becomes active after posting one message in the shoutbox; could be activated by login or smth else
var intervalId=null;
var messages = {}; messages[shoutboxChatroom] = [];

var anonymous = {
  username:null,                // MD5
  fullname:'ENTER YOUR NAME',   // String
  gravatar:generateGravatar(),  // uri
  chatrooms:[shoutboxChatroom], // array of MD5   // TODO: maybe just add a 'currentChatroom' property?
  messages:messages,            // array of dicts
  lastMessage:null,             // Unix microtime   // TODO: do smth with that
  nameHistory:[]                // String array
};
var userDict = anonymous;

$("#profile-img").click(function() {
  $("#status-options").toggleClass("active");
});

// update chatroom and contact-profile
$(".contact").click(function() {
  if (userDict.username != null) {
    currentPeerName = $('.name', this).text();    // this is a full name - TODO: use username instead?
    if (debug) console.log('click: '+currentPeerName);
    $(".contact.active").toggleClass("active");
    $(this).toggleClass("active");
    
    
    const type = $(this).data('type');   // TODO: add more stuff like 'privacy', etc
    switch (type) {
    case 'room':
      currentChatroom = MD5(currentPeerName);
      break;
    default:  // 'user' =~ private room; can be changed to 'room' once they invite a 3rd person
      currentChatroom = md5Sum(userDict.username, MD5(currentPeerName));
      break;
    }

    if (debug) console.log('switch to '+JSON.stringify(currentChatroom)+' ('+currentPeerName+')');
    updateUserChatroom(currentChatroom);
    updateRoomProfile(currentPeerName);
    // updateChatbox(userDict.messages[userDict.chatrooms.last()], true);
    switchToChatroom(userDict.chatrooms.last());
    sendMessage();
  }
});

// update .contact-profile
// TODO: retrieve actual chatroom hash + gravatar uri from that user and add a data-username= in <li class="contact"> or an id
function updateUserChatroom(chatroom, messages=[]) {
  if (debug) console.log('updateUserChatroom: '+chatroom);
  if (is_inArray(chatroom, userDict.chatrooms)) {
    // move this chatroom in last position
    userDict.chatrooms.push(userDict.chatrooms.splice(userDict.chatrooms.indexOf(chatroom), 1)[0]);
    userDict.messages[chatroom].pushArray(messages);
  } else {
    userDict.chatrooms.push(chatroom);
    userDict.messages[chatroom] = messages;
  }
  updateChatbox(chatroom, messages);
}

// update .contact-profile
// TODO: retrieve actual md5 hash + gravatar uri from that user and add a data-username= in <li class="contact"> or an id
function updateRoomProfile(peerName=currentPeerName) {
  $(".contact-profile img").attr("src", generateGravatar(MD5(peerName))+profileSize);
  $(".contact-profile p").text(peerName);
}

// setup user fullname
$("#fullname").click(function(e) {
// $(".expand-button").click(expandProfile);
  // $(".expand-button").click();
  // if ($(this).text() == 'ENTER YOUR NAME') {
  if ($(this).val() == 'ENTER YOUR NAME') {
    // $(this).empty();
    $(this).prop('disabled', false);
    $(this).val('');
    cannotClose = true;
  }
});

$(".expand-button").click(expandProfile);

function expandProfile() {
  if (cannotClose) return false;

  $("#profile").toggleClass("expanded");
  $("#contacts").toggleClass("expanded");
  // console.log($("#profile.expanded").length);
  // update things on close:
  if ($("#profile.expanded").length == 1) {
    // $("#fullname").attr('contenteditable', 'true');
    $("input[name=fullname]").prop('disabled', false);
  } else {
    // $("#fullname").attr('contenteditable', 'false');
    $("input[name=fullname]").prop('disabled', true);
    if ($("#fullname").val() != 'ENTER YOUR NAME') updateProfile();
  }
}

function generateGravatar(md5=null) {
  return url = (md5) ? 'https://www.gravatar.com/avatar/'+md5+'?d=wavatar' : 'https://www.gravatar.com/avatar?d=mp';
}

// to ease the server, all the MD5 are calculated by clients.
// This could be abused but I couldn't care less since it's a free service
function updateProfile() {
  userDict.fullname = $("#fullname").val();
  userDict.username = MD5(userDict.fullname);
  userDict.gravatar = generateGravatar(userDict.username);    // TODO: let user choose another url and gravatar type, color etc
  userDict.nameHistory.push(userDict.fullname);
  $('#profile-img').attr("src", userDict.gravatar+profileSize);
  $("#fullname").removeClass('pulse');

  // sendMessage();
  // sendUser(userDict);
}

// setup user fullname
$("#fullname").on('keyup', function(e) {
  // if ($(this).text() != 'ENTER YOUR NAME' && $(this).text().length > 2) {
  if ($(this).val() != 'ENTER YOUR NAME' && $(this).val().length > 2) {
    $(this).removeClass('pulse');
    $(".message-input input").prop("disabled", false);
    cannotClose = false;
  } else {
    $(this).addClass('pulse');
    $(".message-input input").prop("disabled", true);
    cannotClose = true;
  }
});
$("#fullname").on('keydown', function(e) {
  if (e.which == 13) {
    $(".expand-button").click();
    return false;
  }
});


$("#status-options ul li").click(function() {
  $("#profile-img").removeClass();
  $("#status-online").removeClass("active");
  $("#status-away").removeClass("active");
  $("#status-busy").removeClass("active");
  $("#status-offline").removeClass("active");
  $(this).addClass("active");
  
  if($("#status-online").hasClass("active")) {
    $("#profile-img").addClass("online");
  } else if ($("#status-away").hasClass("active")) {
    $("#profile-img").addClass("away");
  } else if ($("#status-busy").hasClass("active")) {
    $("#profile-img").addClass("busy");
  } else if ($("#status-offline").hasClass("active")) {
    $("#profile-img").addClass("offline");
  } else {
    $("#profile-img").removeClass();
  };
  
  $("#status-options").removeClass("active");
});


// appendTo($('.messages ul')):
// <li class="sent" data-username="d6581d542c7eaf801284f084478b5fcc" data-timestamp:1550446018923 data-index:29>
  // <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
  // <p>How the hell am I supposed to get a jury to believe you when I am not even sure that I do?!</p>
// </li>
// data = {"29":{"username":"u1","fullname":"gigi","message":"aa","timestamp":1550446018923},"30":{"username":"u1","fullname":"gigi","message":"bb","timestamp":1550446018923},"31":31,..}
// Object.entries(data) = [["29",{"username":"u1","fullname":"gigi","message":"aa","timestamp":1550446018923}],["30",{"username":"u1","fullname":"gigi","message":"bb","timestamp":1550446018923}],["31",31],..]
function updateChatbox(chatroom, messages=[], force=false) {
  if (debug) console.log('updateChatbox: '+chatroom);
  
  if (!is_empty(messages)) {
    let chatbox = $('#'+chatroom+' ul');
    // var messages = (!is_array(messages)) ? Object.entries(messages) : messages;
    // if (messages[0][0]-1 != $('.messages ul').children().last().data('index')) { $('.messages ul').empty(); }
    // if (force || is_empty(userDict.messages[userDict.chatrooms.last()]) || messages[0][0]-1 != userDict.messages[userDict.chatrooms.last()].last()[0]) { $('.messages ul').empty(); }
    if (force) { chatbox.empty(); }
    // had to wait until 2017 to iterate over key,value... that's so modern...
    // for (let [index, message] of Object.entries(messages)) { // if messages is an object
    for (var [index, message] of messages) {                    // if messages is an array of arrays
      if (userDict.username == message.username) {
        var senderClass = 'sent';
        var gravatar = userDict.gravatar+chatSize;
      } else {
        var senderClass = 'replies';
        var gravatar = generateGravatar(message.username)+chatSize;   // TODO: use sendUser() or a user db instead
      }
      var htmlMessage = messageFormat.format(senderClass, message.username, message.timestamp, index, gravatar, message.message)
      // $(htmlMessage).appendTo($('.messages ul'));
      $(htmlMessage).appendTo(chatbox);
    }
    
    updateContactStatus(message.username, message.message);
    modifyRefresh(message.timestamp);
  } else {
    modifyRefresh((new Date).getTime());
  }
}

function updateContactStatus(username, message) {
  // update last message in sidepanel for each contact:
  if (debug) console.log('someone said: '+message);
  if (username == userDict.username) {
    $('.contact.active .preview').html('<span>You: </span>' + message);
    userDict.lastMessage = message.timestamp;
  } else {
    $('.contact.active .preview').html(message);
  }
}

function switchToChatroom(chatroom) {
  let newChatroomJq = $('#'+chatroom);
  if (!$('.content').has(newChatroomJq).length) {
    newChatroomJq = $(createTag('div', chatroom, 'messages', createTag('ul'), 'hidden'));
    // hide current room:
    $('.hidden').append($('.content .messages'));
    // show new room:
    $('.content').append(newChatroomJq);
  }
  if (debug) console.log('switchToChatroom: '+chatroom);
  if (debug) console.log(newChatroomJq);
  return newChatroomJq;
}

// function sendMessage() will return shoutbox content by default
// MD5('shoutbox') = 0e23f94f1435d2e63d39865c407d847f
// messageDict = {"chatroom":"0e23f94f1435d2e63d39865c407d847f","username":"d6581d542c7eaf801284f084478b5fcc","fullname":"lolo","message":"blah"}
// function sendMessage(messageDict={chatroom:userDict.chatroom.last()}) {
// messageArray = [{"chatroom":"aaa","index":10"},..,{"chatroom":"bbb","index":currentNum","username":"md5","fullname":"lolo","message":"blah"}]
function sendMessage(messageArray=generateChatroomStatus()) {
if (debug) console.log('sending: '+JSON.stringify(messageArray));
$.ajax({
  type: "POST",
  url: "ajax.message.php",
  data: JSON.stringify(messageArray),
  contentType: "application/json",
  dataType: "json",
  success: function(data) {
    // PHP data = {"0e23f94f1435d2e63d39865c407d847f":{"29":{"username":"u1","fullname":"gigi","message":"aa","timestamp":1550446018923},"30":{},"31":{}, ..}, ..}
    if (debug) console.log(data);                         //  { "0e23f94f1435d2e63d39865c407d847f": { 24: { username: "d6581d542c7eaf801284f084478b5fcc", message: "blah", timestamp: "1550446018923" }, ..}, ..}
    if (debug) console.log(Object.entries(data));         // [[ "0e23f94f1435d2e63d39865c407d847f", { 24: { username: "d6581d542c7eaf801284f084478b5fcc", message: "blah", timestamp: "1550446018923" }, ..}, ..], ..]
    if (debug) console.log(Object.entries(data).last());  //  [ "0e23f94f1435d2e63d39865c407d847f", { 24: { username: "d6581d542c7eaf801284f084478b5fcc", message: "blah", timestamp: "1550446018923" }, ..}, ..]
    // for (let [chatroom, messages] of data) { // if data is array
    for (let chatroom in data) {                // if data is object
      const messages = Object.entries(data[chatroom]);
      if (debug) console.log('pushing '+JSON.stringify(messages)+' to userDict.messages['+chatroom+']');
      updateUserChatroom(chatroom, messages);
    }
    // $('.content .messages').animate({ scrollTop: $(document).height() }, "fast");
    $('.content .messages').scrollTop($('.content .messages').get(0).scrollHeight);
  },
  error: function(XMLHttpRequest, textStatus, errorThrown) {
    modifyRefresh(0);
    console.log("XMLHttpRequest: " + JSON.stringify(XMLHttpRequest));
    console.log("Status: " + textStatus+' Error: ' + errorThrown);
  }
});
}

function sendUser(user=userDict) {
$.ajax({
  type: "POST",
  url: "ajax.user.php",
  data: user,
  contentType: "application/json",
  dataType: "json",
  success: function(data) {
    if (debug) console.log(data);
    // if it's not just a refresh, update your last message in sidepanel:
    if (messageDict.hasOwnProperty('message')) $('.contact.active .preview').html('<span>You: </span>' + messageDict.message);
    if (data) {
      $('.contact.active .preview').html(data.last().message);
      modifyRefresh(data.last().timestamp);
    } else {
      modifyRefresh((new Date).getTime());
    }
  }
});
}

/*
// TODO check this out:
$.extend({
  jpost: function(url, body) {
    return $.ajax({
      type: 'POST',
      url: url,
      data: JSON.stringify(body),
      contentType: "application/json",
      dataType: 'json'
    });
  }
});

// $.jpost Usage:
$.jpost('/form/', { name: 'Jonh' }).then(res => {
  console.log(res);
});
 */
 
// TODO: userDict could be a class, and this could be a function within
// TODO: messageArray could actually replace userDict.chatrooms but then this will cause an issue with re-ordering in updateUserChatroom()
// function generateChatroomStatus returns messageArray[]
// return messageArray = [{"chatroom":"aaa","index":10"},{"chatroom":"bbb","username":"md5","fullname":"lolo","message":"blah blah","index":currentNum"}]
function generateChatroomStatus() {
  var messageArray = [];
  // active chatroom is already the last element in userDict.chatrooms:
  userDict.chatrooms.forEach(function(chatroom) {
    if (debug) console.log('generateChatroomStatus: '+chatroom);
    let index = (userDict.messages[chatroom].length > 0) ? userDict.messages[chatroom].last()[0] : -1;
    let chatroomStatus = {
      chatroom: chatroom,
      index: index
    };
    messageArray.push(chatroomStatus);
  });
  return messageArray;
}

// function newMessage will also notify server of user's current status
// TODO: update ajax to return updates for other chatrooms as well
function newMessage() {
  message = $(".message-input input").val();
  if($.trim(message) == '') {
    // why not use this button to force update?
    sendMessage();
    return false;
  }
  var messageDict = generateChatroomStatus();
  // finally add the message in the last messageDict element, the current chatroom:
  messageDict.last().username = userDict.username;
  messageDict.last().fullname = userDict.fullname;
  messageDict.last().message = message;

  if (debug) console.log(messageDict);
  sendMessage(messageDict);
  $('.message-input input').val(null);
};

$('.submit').click(function() {
  newMessage();
});

// $(window).on('keydown', function(e) {
$('.message-input input').on('keydown', function(e) {
  if (e.which == 13) {
    newMessage();
    return false;
  }
});

function setRefresh(seconds=2) {
  seconds=0;
  if (intervalId) clearInterval(intervalId);
  if (seconds>0) {
    intervalId = setInterval(function() {
      if (debug) console.log('next reload in '+seconds);
      sendMessage();
    }, seconds*1000);
  }
}

// function modifyRefresh is CRITICAL for server load
// timestamp=(new Date).getTime()=1550293556854
function modifyRefresh(timestamp) {
  const lastMessage = (new Date).getTime()/1000 - timestamp/1000;
  if (debug) console.log('lastMessage: '+lastMessage);
  if      (lastMessage < 10) { setRefresh(2); }
  else if (lastMessage < 60) { setRefresh(10); }
  else if (lastMessage < 300) { setRefresh(60); }
  else if (lastMessage > 600) { setRefresh(0); }
}

$(document).ready(function() {
  if ($("#fullname").val() != 'ENTER YOUR NAME') {
    updateProfile();
    $(".contact.active").click();
  }
});

