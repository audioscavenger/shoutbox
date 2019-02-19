// common.js - set of functions developed by AudioScavengeR@Github
var version = 3.1
var browser = new Browser();
var debug = false;

// https://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
// String.format usage: "{0} is dead, but {1} is alive! {0} {2}".format("ASP", "ASP.NET")
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

// return last item (or at -position) of array
// aa=[1,2,3];aa.last() // 3
if (!Array.prototype.last){
  Array.prototype.last = function(position=1){
    return this.slice(-position)[0]
  };
};

// concat arrays
Array.prototype.pushArray = function(array) {
  this.push.apply(this, array);
};

/*
// return last item (or at -position) of array
// oo={0:{"a":"aa"},1:{"b":"bb"}};oo.last() // {1:{"b":"bb"}}
// UPDATE: this prototype will cause lots of trouble to jQuery
if (!Object.prototype.last){
  Object.prototype.last = function(position=1){
    const key = Object.keys(this).last(position);
    return {[key]:this[key]};
  };
};
*/

function last(object, position=1) {
  const key = Object.keys(object).last(position);
  return {[key]:object[key]};
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

function log(e) { console.log(e); }

function formatCrHtml(str) {
  // return str.replace(/(?:\r\n|\r|\n|$)/mg, '<br />');
  // return str.replace(/$/mg, '<br />');
  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ '<br />' +'$2');
}

function purgeElement(id) {
  ID = id.replace(/\#/g,'');
  var node = document.getElementById(ID);
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function changeFavicon2Link(strLink) {
  var strLink = document.createElement('link');
  strLink.type = 'image/x-icon';
  strLink.rel = 'shortcut icon';
  strLink.href = strLink;
  document.getElementsByTagName('head')[0].appendChild(strLink);
}

// basenameNoExt
function basenameNoExt(strPpath) {
  return strPpath.substr(0, strPpath.lastIndexOf('.')) || strPpath;
}

// extension
function extension(strPpath) {
  // var arrExt = /^.+\.([^.]+)$/.exec(strPpath);
  // return arrExt == null ? "" : arrExt[1];
  return strPpath.split('.').pop();
}

// basename
function basename(strPpath) {
  // return strPpath.split('/').pop();
  // this covers also Windows paths:
  return strPpath.replace(/\\/g,'/').replace( /.*\//, '' );
}

// dirname
function dirname(strPpath) {
  return strPpath.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');
}

function filename(strPpath) {
  return strPpath.substring(strPpath.lastIndexOf("/") + 1, strPpath.lastIndexOf("."));
}

function is_inArray(value,array) {
  return (array.indexOf(value) === -1) ? false : true;
}

function is_array(object) {
  return (Array.isArray(object)) ? true : false;
}

// https://stackoverflow.com/questions/24403732/check-if-array-is-empty-or-does-not-exist-js
function is_empty(array) {
  // return (!Array.isArray(array) || !array.length) ? true : false;
  return (!array || !array.length) ? true : false;
}

// getCSSvalue: element can be idName, className, or element
// getCSSvalue('divId', 'width') {
// getCSSvalue('className', 'width') {
function getCSSvalue(element, propertyName) {
  var cssValue = null;
  var elem = element;
  // try to get element by idName
  if (elem.nodeType != 1) {elem = document.getElementById(element); }
  // try to get element by className
  if (!elem) { elem = document.getElementsByClassName(element)[0]; }
  if (!elem) return null;
  
  if (window.getComputedStyle) {
    // if style is applyied somewhere on the page:
    cssValue = document.defaultView.getComputedStyle(elem, null).getPropertyValue(propertyName);
  } else if(elem.currentStyle) {
    // else get style from css directly:
    cssValue = elem.currentStyle[propertyName];
  }
  return cssValue;
}

function isUrlValid(strUrl) {
  // alert(document.URL);
  var RegexUrl = new RegExp( '(http|ftp|https)://[\\w-]+(\\.[\\w-]+)+([\\w-.,@?^=%&:/~+#-]*[\\w@?^=%&;/~+#-])?' );
  var RegexRelative = new RegExp( '(\.\.)/+([\\w-.,@?^=%&:/~+#-]*[\\w@?^=%&;/~+#-])?' );
  // alert('strUrl='+strUrl);
  // alert(RegexUrl.test(strUrl));
  if (RegexUrl.test(strUrl) === true) return true;
  if (RegexRelative.test(strUrl) === true) return true;
  // return RegexUrl.test(strUrl);
}

// getParent: element can be idName, or element
function getParent(element, pTagName=null) {
  if (element == null) return null;
  var elem = element;
  // http://www.javascriptkit.com/domref/nodetype.shtml
  // nodeType Returned integer	Node type Constant
  // 1	ELEMENT_NODE
  // 2	ATTRIBUTE_NODE
  // 3	TEXT_NODE
  // 4	CDATA_SECTION_NODE
  // 5	ENTITY_REFERENCE_NODE
  // 6	ENTITY_NODE
  // 7	PROCESSING_INSTRUCTION_NODE
  // 8	COMMENT_NODE
  // 9	DOCUMENT_NODE
  // 10	DOCUMENT_TYPE_NODE
  // 11	DOCUMENT_FRAGMENT_NODE
  // 12`	NOTATION_NODE
  if (elem.nodeType != 1) {elem = document.getElementById(element); }
  var parentElement = elem.parentNode;
  if (pTagName != null)
    if (parentElement.nodeType == 1 && parentElement.tagName.toLowerCase() == pTagName.toLowerCase())	// Gecko bug, supposed to be uppercase
      return parentElement;
    else return getParent(parentElement, pTagName);
  else return parentElement;
}


// https://stackoverflow.com/questions/15164655/generate-html-table-from-2d-javascript-array
// example: createTable(values = [["tr 1, td 1", "tr 1, td 2"], ["tr 2, td 1", "tr 2, td 2"]]);
// columns = array        = [0:id,   1:timestamp,2:ClassNumber,.. x nbColumns]
// values  = array[array] = [0:[1512,1510867045, 2792,         .. x nbColumns],.. x nbRows]
function createTableNode(values, columns=null) {
  var table = document.createElement('table');
  var tbody = document.createElement('tbody');

  // table head
  if (columns) {
    var thead = document.createElement('thead');
    var tr = document.createElement('tr');
    
    columns.forEach(function(cellTitle) {
      var th = document.createElement('th');
      th.appendChild(document.createTextNode(cellTitle));
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.appendChild(thead);
  }

  // table body
  values.forEach(function(rowData) {
    var tr = document.createElement('tr');
    var colNum = 0;

    rowData.forEach(function(cellData) {
      var td = document.createElement('td');
      td.appendChild(document.createTextNode(cellData));
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  return table;
}

// http://stackoverflow.com/questions/841553/jquery-this-child-selector
function getNextOfClassName(className) {
  return this.next('.'+className);
  // return this.parent().children('.'+className);
}

function getPrevOfClassName(className) {
  return this.prev('.'+className);
}

function getParentChildOfClassName(className) {
  return this.parent().children('.'+className);
}

// Browser: Determine browser and version.
function Browser() {
// blah, browser detect, but mouse-position stuff doesn't work any other way
  var ua, s, i;
  ua = navigator.userAgent;

  this.isIE    = false;
  this.isNS    = false;
  this.agent = ua;
  this.version = null;
  this.isMobile = false;
  
  // isMobile detection: https://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-mobile-device-in-jquery
  if (window.matchMedia("only screen and (max-width: 760px)").matches) {
  this.isMobile = true;
}

  s = "MSIE";
  if ((i = ua.indexOf(s)) >= 0) {
    this.isIE = true;
    this.version = parseFloat(ua.substr(i + s.length));
    return;
  }

  s = "Netscape6/";
  if ((i = ua.indexOf(s)) >= 0) {
    this.isNS = true;
    this.version = parseFloat(ua.substr(i + s.length));
    return;
  }

  // Treat any other "Gecko" browser as NS 6.1.

  s = "Gecko";
  if ((i = ua.indexOf(s)) >= 0) {
    this.isNS = true;
    this.version = 6.1;
    return;
  }
}

function isMobile() {
  return window.matchMedia("only screen and (max-width: 760px)").matches;
}

function getMousePosition(event) {
  if (browser.isIE) {
    x = window.event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
    y = window.event.clientY + document.documentElement.scrollTop  + document.body.scrollTop;
  }
  if (browser.isNS) {
    x = event.clientX + window.scrollX;
    y = event.clientY + window.scrollY;
  }
  return [x,y];
}


// https://api.jquery.com/jQuery.get/
function ajaxGetFromUrl(url, callback, useProxy=false) {
  // https://ourcodeworld.com/articles/read/73/how-to-bypass-access-control-allow-origin-error-with-xmlhttprequest-jquery-ajax-
  var proxy = 'https://cors-anywhere.herokuapp.com/';
  url = (useProxy) ? proxy + url : url;
  $.ajax({
    url: url,
    // data: { name: "John", location: "Boston" },
    type: 'GET',
    dataType: "html",
    success: function (data, text) {
      alert(data);                  // <html...
      alert(text);                  // success
      callback(whatever);
    },
    error: function (request, status, error) {
      alert(request.status);        // 404
      alert(request.responseText);  // <html><head><title>404 Not Found...
      alert(error);                 // Not Found
    }
  });
}

// https://api.jquery.com/jQuery.get/
// getJsonFromUrlAsync callback a function with 1st arg=json and any subsequent arguments passed after useProxy
function getJsonFromUrlAsync(url, callback, useProxy=false) {
  // https://ourcodeworld.com/articles/read/73/how-to-bypass-access-control-allow-origin-error-with-xmlhttprequest-jquery-ajax-
  var proxy = 'https://cors-anywhere.herokuapp.com/';
  url = (useProxy) ? proxy + url : url;
  // arguments are those passed to 'this' function: ["url", ƒ, true, "tooltip-Towson_University"]
  // var optArgs = arguments.slice(3, arguments.length);
  var optArgs = Array.prototype.slice.call(arguments, 3, arguments.length);

  // $.getJSON(url, callback);
  $.getJSON(url, function( json ) { callback(json, ...optArgs); });
}
/*
function tryMe (param1, param2) {
  alert(param1 + " and " + param2);
}
function callbackTester (callback) {
  callback (arguments[1], arguments[2]);
}
callbackTester (tryMe, "hello", "goodbye");
*/


// https://api.jquery.com/jQuery.get/
// https://stackoverflow.com/questions/24118961/how-to-store-the-output-of-an-xmlhttprequest-in-a-global-variable
function getJsonAsync(url, callback, useProxy=false) {
  // https://ourcodeworld.com/articles/read/73/how-to-bypass-access-control-allow-origin-error-with-xmlhttprequest-jquery-ajax-
  var proxy = 'https://cors-anywhere.herokuapp.com/';
  url = (useProxy) ? proxy + url : url;
  
  // https://www.w3schools.com/js/tryit.asp?filename=tryjson_http
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      // console.log(unescape(this.responseText));
      // https://jsonlint.com/
      // https://stackoverflow.com/questions/42068/how-do-i-handle-newlines-in-json
      if (typeof callback == 'function') {
        callback(JSON.parse(unescape(this.responseText)));
      } else if (typeof callback == 'string') {
        window[callback] = JSON.parse(unescape(this.responseText));
      } else {
        throw new TypeError();
      }
    }
  };
  xhr.open("GET", url, true);
  xhr.send();
}

// https://api.jquery.com/jQuery.get/
function getFromUrl(url, callback, useProxy=false) {
  // https://ourcodeworld.com/articles/read/73/how-to-bypass-access-control-allow-origin-error-with-xmlhttprequest-jquery-ajax-
  var proxy = 'https://cors-anywhere.herokuapp.com/';
  url = (useProxy) ? proxy + url : url;
  
  $.get(url, function( data ) {
    // console.log(data.responseText);
    callback(data);
  });
}

// createTag always return DOM element
// without Parent, createTag does not attach the element to the document.body
// Parent and content can be a String, DOM element, or jquery wrapper
// todo: see if it's best practice to elm.appendChild(document.createTextNode(content)) instead of elm.textContent = content
// TODO: try to process optArgs such as: elm.title = "my title text";
// todo: decide if it's ok to overwrite existing objects' content with null or if null actually is different from blank
function createTag(tag, id=null, className=null, content=null, Parent=null) {
  elm  = (id && document.getElementById(id)) ? document.getElementById(id) : document.createElement(tag);
  // elm  = document.createDocumentFragment(tag);  // See the use of document fragments for performance
  if (id) elm.id = id;
  if (className) elm.className = className;
  if (content) {
    if (typeof content === 'object') {
      if (content[0]) { elm.appendChild(content[0]); } else { elm.appendChild(content); }
    } else { elm.textContent = content; }
  }
  if (Parent) {
    if (typeof Parent === 'object') {
      if (Parent[0]) { Parent.append(elm); } else { Parent.appendChild(elm); }
    } else {
      if (document.getElementById(Parent)) document.getElementById(Parent).appendChild(elm);
    }
  }
  
  if (arguments.length > 5) {
    var optArgs = Array.prototype.slice.call(arguments, 3, arguments.length);
    if (debug) console.log(optArgs);
  }
  
  // console.log('createTag: '+elm.id);
  return elm;
}

MD5 = function(e) {
  function h(a, b) {
      var c, d, e, f, g;
      e = a & 2147483648;
      f = b & 2147483648;
      c = a & 1073741824;
      d = b & 1073741824;
      g = (a & 1073741823) + (b & 1073741823);
      return c & d ? g ^ 2147483648 ^ e ^ f : c | d ? g & 1073741824 ? g ^ 3221225472 ^ e ^ f : g ^ 1073741824 ^ e ^ f : g ^ e ^ f
  }

  function k(a, b, c, d, e, f, g) {
      a = h(a, h(h(b & c | ~b & d, e), g));
      return h(a << f | a >>> 32 - f, b)
  }

  function l(a, b, c, d, e, f, g) {
      a = h(a, h(h(b & d | c & ~d, e), g));
      return h(a << f | a >>> 32 - f, b)
  }

  function m(a, b, d, c, e, f, g) {
      a = h(a, h(h(b ^ d ^ c, e), g));
      return h(a << f | a >>> 32 - f, b)
  }

  function n(a, b, d, c, e, f, g) {
      a = h(a, h(h(d ^ (b | ~c), e), g));
      return h(a << f | a >>> 32 - f, b)
  }

  function p(a) {
      var b = "",
          d = "",
          c;
      for (c = 0; 3 >= c; c++) d = a >>> 8 * c & 255, d = "0" + d.toString(16), b += d.substr(d.length - 2, 2);
      return b
  }
  var f = [],
      q, r, s, t, a, b, c, d;
  e = function(a) {
      a = a.replace(/\r\n/g, "\n");
      for (var b = "", d = 0; d < a.length; d++) {
          var c = a.charCodeAt(d);
          128 > c ? b += String.fromCharCode(c) : (127 < c && 2048 > c ? b += String.fromCharCode(c >> 6 | 192) : (b += String.fromCharCode(c >> 12 | 224), b += String.fromCharCode(c >> 6 & 63 | 128)), b += String.fromCharCode(c & 63 | 128))
      }
      return b
  }(e);
  f = function(b) {
      var a, c = b.length;
      a = c + 8;
      for (var d = 16 * ((a - a % 64) / 64 + 1), e = Array(d - 1), f = 0, g = 0; g < c;) a = (g - g % 4) / 4, f = g % 4 * 8, e[a] |= b.charCodeAt(g) << f, g++;
      a = (g - g % 4) / 4;
      e[a] |= 128 << g % 4 * 8;
      e[d - 2] = c << 3;
      e[d - 1] = c >>> 29;
      return e
  }(e);
  a = 1732584193;
  b = 4023233417;
  c = 2562383102;
  d = 271733878;
  for (e = 0; e < f.length; e += 16) q = a, r = b, s = c, t = d, a = k(a, b, c, d, f[e + 0], 7, 3614090360), d = k(d, a, b, c, f[e + 1], 12, 3905402710), c = k(c, d, a, b, f[e + 2], 17, 606105819), b = k(b, c, d, a, f[e + 3], 22, 3250441966), a = k(a, b, c, d, f[e + 4], 7, 4118548399), d = k(d, a, b, c, f[e + 5], 12, 1200080426), c = k(c, d, a, b, f[e + 6], 17, 2821735955), b = k(b, c, d, a, f[e + 7], 22, 4249261313), a = k(a, b, c, d, f[e + 8], 7, 1770035416), d = k(d, a, b, c, f[e + 9], 12, 2336552879), c = k(c, d, a, b, f[e + 10], 17, 4294925233), b = k(b, c, d, a, f[e + 11], 22, 2304563134), a = k(a, b, c, d, f[e + 12], 7, 1804603682), d = k(d, a, b, c, f[e + 13], 12, 4254626195), c = k(c, d, a, b, f[e + 14], 17, 2792965006), b = k(b, c, d, a, f[e + 15], 22, 1236535329), a = l(a, b, c, d, f[e + 1], 5, 4129170786), d = l(d, a, b, c, f[e + 6], 9, 3225465664), c = l(c, d, a, b, f[e + 11], 14, 643717713), b = l(b, c, d, a, f[e + 0], 20, 3921069994), a = l(a, b, c, d, f[e + 5], 5, 3593408605), d = l(d, a, b, c, f[e + 10], 9, 38016083), c = l(c, d, a, b, f[e + 15], 14, 3634488961), b = l(b, c, d, a, f[e + 4], 20, 3889429448), a = l(a, b, c, d, f[e + 9], 5, 568446438), d = l(d, a, b, c, f[e + 14], 9, 3275163606), c = l(c, d, a, b, f[e + 3], 14, 4107603335), b = l(b, c, d, a, f[e + 8], 20, 1163531501), a = l(a, b, c, d, f[e + 13], 5, 2850285829), d = l(d, a, b, c, f[e + 2], 9, 4243563512), c = l(c, d, a, b, f[e + 7], 14, 1735328473), b = l(b, c, d, a, f[e + 12], 20, 2368359562), a = m(a, b, c, d, f[e + 5], 4, 4294588738), d = m(d, a, b, c, f[e + 8], 11, 2272392833), c = m(c, d, a, b, f[e + 11], 16, 1839030562), b = m(b, c, d, a, f[e + 14], 23, 4259657740), a = m(a, b, c, d, f[e + 1], 4, 2763975236), d = m(d, a, b, c, f[e + 4], 11, 1272893353), c = m(c, d, a, b, f[e + 7], 16, 4139469664), b = m(b, c, d, a, f[e + 10], 23, 3200236656), a = m(a, b, c, d, f[e + 13], 4, 681279174), d = m(d, a, b, c, f[e + 0], 11, 3936430074), c = m(c, d, a, b, f[e + 3], 16, 3572445317), b = m(b, c, d, a, f[e + 6], 23, 76029189), a = m(a, b, c, d, f[e + 9], 4, 3654602809), d = m(d, a, b, c, f[e + 12], 11, 3873151461), c = m(c, d, a, b, f[e + 15], 16, 530742520), b = m(b, c, d, a, f[e + 2], 23, 3299628645), a = n(a, b, c, d, f[e + 0], 6, 4096336452), d = n(d, a, b, c, f[e + 7], 10, 1126891415), c = n(c, d, a, b, f[e + 14], 15, 2878612391), b = n(b, c, d, a, f[e + 5], 21, 4237533241), a = n(a, b, c, d, f[e + 12], 6, 1700485571), d = n(d, a, b, c, f[e + 3], 10, 2399980690), c = n(c, d, a, b, f[e + 10], 15, 4293915773), b = n(b, c, d, a, f[e + 1], 21, 2240044497), a = n(a, b, c, d, f[e + 8], 6, 1873313359), d = n(d, a, b, c, f[e + 15], 10, 4264355552), c = n(c, d, a, b, f[e + 6], 15, 2734768916), b = n(b, c, d, a, f[e + 13], 21, 1309151649), a = n(a, b, c, d, f[e + 4], 6, 4149444226), d = n(d, a, b, c, f[e + 11], 10, 3174756917), c = n(c, d, a, b, f[e + 2], 15, 718787259), b = n(b, c, d, a, f[e + 9], 21, 3951481745), a = h(a, q), b = h(b, r), c = h(c, s), d = h(d, t);
  return (p(a) + p(b) + p(c) + p(d)).toLowerCase()
};

// generate "uniq" md5 value out of 2 or more md5 values, MD% of string otherwise
// c1="d6581d542c7eaf801284f084478b5fcc"; c2="61bab24e6a40f9830de0557a2afb8dd8";
function md5Sum(string) {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
  var sum = (arguments.length > 1) ? Array.from(arguments).reduce((x, y) => x + parseInt(y, 16), 0) : string;
  return MD5(sum.toString(16));
}

// generate "uniq" md5 value out of 2 md5 values
// function md5Sum(c1, c2) {
  // var hexStr = (parseInt(c1, 16) + parseInt(c2, 16)).toString(16);
  // return MD5(hexStr);
// }
