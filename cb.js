var focusFlag = 1;
var lastTime = '';
var newTime = '';
var intervalId=null;
var editableBoxes = {'#username':20, '#message':300};

// var debug=true;
var debug=false;

function log() {
  if (debug) console.log(arguments);
}

function send() {
$.ajax({
  type: "POST",
  url: "ajax.php",
  data: {
    // username: $('#username').val(),    // input
    username: $('#username').html(),      // div contenteditable
    message: $('#message').val()
  },
  dataType: "json",
  success: function(data) {
    if (debug) console.log(data);
    var chatContent = '';
    for (var i in data) {
      chatContent += "<b class='text-primary'>" + data[i].username + ": </b><span class='text-muted'>[" + data[i].timestamp + "]</span> " + data[i].message + "<br>";
    }
    $('#chatResults').html(chatContent);
    if (focusFlag == 0) {
      document.title = "Update!";
    }
    $('#chatResults').prop('scrollTop', $('#chatResults').prop('scrollHeight'));
  }
});
}

function reload() {
  $.ajax({
    type: "POST",
    url: "ajax.php",
    dataType: "json",
    // [{"username":"aa","message":"sdsdf sd asd ","timestamp":"20:22:21","size":0}, ..]
    success: function(data){
      if (debug) console.log(data);
      var chatContent = '';
      for (var i in data) {
        chatContent += "<b class='text-primary'>" + data[i].username + ": </b><span class='text-muted'>[" + data[i].timestamp + "]</span> " + data[i].message + "<br>";
        }
        $('#chatResults').html(chatContent);
    newTime = data[0].timestamp;
    if ((focusFlag == 0) && (lastTime != newTime)) {
      document.title = data[0].username + " spoke!";
      lastTime = newTime = data[0].timestamp;
      
      $('#chatResults').prop('scrollTop', $('#chatResults').prop('scrollHeight'));	
    }
   }
 });
}


$(window).bind("blur", function() {
  focusFlag = 0;
}).bind("focus", function() {
  focusFlag = 1;
  document.title = "Chatty!";
});

// $('#submitter').click(function() {
  // send();
  // $('#message').val('');
// });

$("#message").keyup(function(e) {
  if(e.keyCode == 13) {
    send();
    if (debug) console.log($('#username').html());
    $('#message').val('');
    reload();
  }
});

$('#toggleRefresh').click(function() {
  if (intervalId) {
    $(this).val('refresh OFF');
    this.className='btn btn-warning';
    clearInterval(intervalId);
    intervalId=null;
  } else {
    $(this).val('refresh ON');
    this.className='btn btn-success';
    intervalId = setInterval(function() {
      if (debug) console.log('reload');
      reload();
    }, 2000);
  }
});

$("#username").keyup(function(e) {
  if ($(this).html() != 'username' && $(this).html().length > 2) {
    $(this).removeClass('alert-light');
    $('#message').prop("disabled", false);
  } else {
    $(this).addClass('alert-light');
    $('#message').prop("disabled", true);
  }
});

// https://stackoverflow.com/questions/34913675/how-to-iterate-keys-values-in-javascript
// had to wait until 2017 to iterate over key,value... that's so modern...
for (const [content_id, maxChars] of Object.entries(editableBoxes)) {
  $(content_id).keydown(function(e){ check_charcount(content_id, maxChars, e); }).keyup(function(e){ check_charcount(content_id, maxChars, e); });
}

function check_charcount(content_id, maxChars, e) {
  if(e.which != 8 && $(content_id).text().length > maxChars) {
    // $(content_id).text($(content_id).text().substring(0, maxChars));
    e.preventDefault();
  }
}

// $(window).load(function() {
$(document).ready(function() {
  // $('#chatResults').css("height", $('footer').height() - 120);
  // $('#chatResults').css("height", $('footer').height());
  reload();
});
