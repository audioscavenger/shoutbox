/*
https://bootsnipp.com/snippets/exR5v
https://codepen.io/emilcarlsson/pen/ZOQZaV

TODO:
- [ ] make sure $("#username") is actually an input so its value is kept on page reload
- [ ] store gravatars in new user db + create new ajax.user.php or smth like so
- [ ] store generated gravatars locally in new css base64 elements
*/

// var debug = true;
var debug = false;

// var currentFullname = '';
var currentUsername = '';
var currentGravatar = 'https://www.gravatar.com/avatar?d=mp&s=';
var profileSize = 40;
var chatSize = 22;
var messageFormat = '<li class="{0}" data-username="{1}" data-timestamp:"{2}"><img src="{3} alt="" /><p>{4}</p></li>';
var cannotClose = false;

$(".messages").animate({ scrollTop: $(document).height() }, "fast");

$("#profile-img").click(function() {
  $("#status-options").toggleClass("active");
});

$(".expand-button").click(function() {
  if (cannotClose) return false;
  $("#profile").toggleClass("expanded");
  $("#contacts").toggleClass("expanded");
  // console.log($("#profile.expanded").length);
  // update things on close:
  if ($("#profile.expanded").length == 1) {
    $("#username").attr('contenteditable', 'true');
  } else {
    $("#username").attr('contenteditable', 'false');
    updateProfile();
  }
});

function generateGravatar(name=null) {
  return url = (name) ? 'https://www.gravatar.com/avatar/'+MD5(name)+'?d=wavatar&s=' : 'https://www.gravatar.com/avatar?d=mp&s=';
}

function updateProfile() {
  // currentUsername = $("input[name='username']").val();
  // currentFullname = $("#fullname").text();
  currentUsername = $("#username").text();
  currentGravatar = generateGravatar(currentUsername);
  $('#profile-img').attr("src", currentGravatar+profileSize);
  send();
}

$("#username").click(function(e) {
  if ($(this).text() == 'ENTER YOUR NAME') {
    $(this).empty();
    cannotClose = true;
  }
});

$("#username").keyup(function(e) {
  if ($(this).text() != 'ENTER YOUR NAME' && $(this).text().length > 2) {
    $(this).removeClass('pulse');
    $(".message-input input").prop("disabled", false);
    cannotClose = false;
  } else {
    $(this).addClass('pulse');
    $(".message-input input").prop("disabled", true);
    cannotClose = true;
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
// <li class="sent" data-username="lolo" data-timestamp:"20:22:21">
  // <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
  // <p>How the hell am I supposed to get a jury to believe you when I am not even sure that I do?!</p>
// </li>
// <li class="replies">
  // <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
  // <p>When you're backed against the wall, break the god damn thing down.</p>
// </li>
// data = [{"username":"The Great Khan","message":"blah blah","timestamp":"20:22:21","size":0}, ..]
function updateChatbox(data=[]) {
  // if (data.length != $('.messages ul').children().length) {   // cannot use that as we limit the number of messages !!!
    $('.messages ul').empty();
    for (var i in data) {
      if (currentUsername == data[i].username) {
        var senderClass = 'sent';
        var gravatar = currentGravatar+chatSize;
      } else {
        var senderClass = 'replies';
        var gravatar = generateGravatar(data[i].username)+chatSize;
      }
      var message = messageFormat.format(senderClass, data[i].username, data[i].timestamp, gravatar, data[i].message)
      $(message).appendTo($('.messages ul'));
    }
    $(".messages").animate({ scrollTop: $(document).height() }, "fast");
  // }
}

// messageDict = {"username":"The Great Khan","message":"sdsdf sd asd "}
function send(messageDict={}) {
$.ajax({
  type: "POST",
  url: "ajax.php",
  data: messageDict,
  dataType: "json",
  success: function(data) {
    if (debug) console.log(data);
    updateChatbox(data);
    // if it's not just a refresh, update your last message in sidepanel:
    if (messageDict.hasOwnProperty('message')) $('.contact.active .preview').html('<span>You: </span>' + messageDict.message);
  }
});
}


function newMessage() {
  message = $(".message-input input").val();
  if($.trim(message) == '') {
    // why not use this button to force update?
    send();
    return false;
  }
  var messageDict = { username: currentUsername, message: message };
  if (debug) console.log(messageDict);
  send(messageDict);
  $('.message-input input').val(null);
};

$('.submit').click(function() {
  newMessage();
});

$(window).on('keydown', function(e) {
  if (e.which == 13) {
    newMessage();
    return false;
  }
});