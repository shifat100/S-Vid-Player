localStorage.setItem('opened_page', 'videos');

String.prototype.includes = function (str) {
  return this.indexOf(str) !== -1;
}

var types;
if (localStorage.getItem('filetypes') === null) {
  types = ['mp4', '3gp', 'mkv', '3gpp'];
} else {
  exts = localStorage.getItem('filetypes').replace(/ /gi, '');
  types = exts.split(',');
}



var app = document.getElementsByClassName('content')[0];
var f2 = document.querySelectorAll('.footerelement')[1];
var num = '';
var files = new Array();
var filenamearray = new Array();


var sdcards = navigator.getDeviceStorages('sdcard');

app.innerHTML = '<input type="text" placehoder="keyword" class="file" id="filter" tabindex="0">';



function internalCard() {
  var sd = navigator.getDeviceStorages('sdcard')[0];
  var ti = 1;
  var cursor = sd.enumerate();

  cursor.onsuccess = function () {
    types.forEach(type => {
      if (this.result.name.lastIndexOf(type) === this.result.name.length - type.length) {
        var file = this.result;
        files.push(file);
        var filename = file.name;
        filenamearray.push(baseFileName(filename));
        var filepath = filename.replace('/sdcard/', '');
        var item = document.createElement('div');
        item.className = 'listview file';
        item.tabIndex = ti;
        ti++;
        item.innerHTML = '<img src = "ext.png" style="width: 20px;vertical-align: middle;margin-right: 5px">' + baseFileName(file.name.substring(file.name.lastIndexOf('/') + 1));
        item.addEventListener('click', function () {
          document.querySelector('style').innerHTML = '.content{top:25px;bottom:50px;position:fixed;width:100%;overflow:hidden;left:0;background-color:#000;display:flex;justify-content:center;align-items:center;flex-wrap:wrap}';
          machine(file);

        });
        item.addEventListener('focus', function () {
          document.querySelector('#fdet').innerHTML = '<table width="100%" style="color: black"><tr><td style="width: 50%;text-align: center">' + showSize(file.size) + '</td><td style="width: 50%;text-align: center">' + file.type + '</td></tr></table>';
          if (localStorage.getItem(baseFileName(file.name)) === null) { f2.innerHTML = 'Play'; } else { f2.innerHTML = 'Resume'; }

        });
        if (app.appendChild(item)) {
          app.style.display = 'block';
          document.getElementById('nofilenotice').style.display = 'none';
          app.appendChild(item);
          app.style += 'z-index: 1; ';
        } else {
          app.style.display = 'none';
          document.getElementById('nofilenotice').style.display = 'block';
          app.style += 'z-index: 0; ';
        }
      }
    });
    if (!this.done) {
      this.continue();
    }
  }
  cursor.onerror = function () {
    console.warn('No file found: ' + this.error);
    app.innerHTML = 'No file found: ' + this.error;
  }
}


function externalCard() {
  var sd = navigator.getDeviceStorages('sdcard')[0];
  var ti = 0;
  var cursor = sd.enumerate();

  cursor.onsuccess = function () {
    types.forEach(type => {
      if (this.result.name.lastIndexOf(type) === this.result.name.length - type.length) {
        var file = this.result;
        files.push(file);
        var filename = file.name;
        filenamearray.push(baseFileName(filename));
        var filepath = filename.replace('/sdcard/', '');
        var item = document.createElement('div');
        item.className = 'listview file';
        item.tabIndex = ti;
        ti++;
        item.innerHTML = '<img src = "ext.png" style="width: 20px;vertical-align: middle;margin-right: 5px">' + baseFileName(file.name.substring(file.name.lastIndexOf('/') + 1));
        item.addEventListener('click', function () {
          document.querySelector('style').innerHTML = '.content{top:25px;bottom:50px;position:fixed;width:100%;overflow:hidden;left:0;background-color:#000;display:flex;justify-content:center;align-items:center;flex-wrap:wrap}';
          machine(file);

        });
        item.addEventListener('focus', function () {
          document.querySelector('#fdet').innerHTML = '<table width="100%" style="color: black"><tr><td style="width: 50%;text-align: center">' + showSize(file.size) + '</td><td style="width: 50%;text-align: center">' + file.type + '</td></tr></table>';
          if (localStorage.getItem(baseFileName(file.name)) === null) { f2.innerHTML = 'Play'; } else { f2.innerHTML = 'Resume'; }

        });
        if (app.appendChild(item)) {
          app.style.display = 'block';
          document.getElementById('nofilenotice').style.display = 'none';
          app.appendChild(item);
          app.style += 'z-index: 1; ';
        } else {
          app.style.display = 'none';
          document.getElementById('nofilenotice').style.display = 'block';
          app.style += 'z-index: 0; ';
        }
      }
    });
    if (!this.done) {
      this.continue();
    }
  }
  cursor.onerror = function () {
    console.warn('No file found: ' + this.error);
    app.innerHTML = 'No file found: ' + this.error;
  }

  sd = navigator.getDeviceStorages('sdcard')[1];
  var cursor = sd.enumerate();

  cursor.onsuccess = function () {
    types.forEach(type => {
      if (this.result.name.lastIndexOf(type) === this.result.name.length - type.length) {
        var file = this.result;
        files.push(file);
        var filename = file.name;
        filenamearray.push(baseFileName(filename));
        var filepath = filename.replace('/sdcard/', '');
        var item = document.createElement('div');
        item.className = 'listview file';
        item.tabIndex = ti;
        ti++;
        item.innerHTML = '<img src = "ext.png" style="width: 20px;vertical-align: middle;margin-right: 5px">' + baseFileName(file.name.substring(file.name.lastIndexOf('/') + 1));
        item.addEventListener('click', function () {
          document.querySelector('style').innerHTML = '.content{top:25px;bottom:50px;position:fixed;width:100%;overflow:hidden;left:0;background-color:#000;display:flex;justify-content:center;align-items:center;flex-wrap:wrap}';
          machine(file);

        });
        item.addEventListener('focus', function () {
          document.querySelector('#fdet').innerHTML = '<table width="100%" style="color: black"><tr><td style="width: 50%;text-align: center">' + showSize(file.size) + '</td><td style="width: 50%;text-align: center">' + file.type + '</td></tr></table>';
          if (localStorage.getItem(baseFileName(file.name)) === null) { f2.innerHTML = 'Play'; } else { f2.innerHTML = 'Resume'; }

        });
        if (app.appendChild(item)) {
          app.style.display = 'block';
          document.getElementById('nofilenotice').style.display = 'none';
          app.appendChild(item);
          app.style += 'z-index: 1; ';
        } else {
          app.style.display = 'none';
          document.getElementById('nofilenotice').style.display = 'block';
          app.style += 'z-index: 0; ';
        }
      }
    });
    if (!this.done) {
      this.continue();
    }
  }
  cursor.onerror = function () {
    console.warn('No file found: ' + this.error);
    app.innerHTML = 'No file found: ' + this.error;
  }
}

if (sdcards.length == 2) { externalCard(); } else { internalCard(); }


document.getElementById('filter').addEventListener('keyup', keydownfilter);
function keydownfilter(e) {
  if (e.key == 'Enter' || e.key == 'SoftLeft') {
    var inputvalue = document.getElementById('filter').value.toLowerCase();
    document.querySelector('#fdet').innerHTML = '<center> Searched For: "' + inputvalue + '"</center>';
    app.innerHTML = '<input type="text" placehoder="keyword" class="file" id="filter" tabindex="0">';
    var ti = 1;
    files.forEach(file => {
      if (file.name.toLowerCase().includes(inputvalue)) {
        var item = document.createElement('div');
        item.className = 'listview file';
        item.tabIndex = ti;
        ti++;
        item.innerHTML = '<img src="ext.png" style="width: 20px;vertical-align: middle;margin-right: 5px">' + baseFileName(file.name.substring(file.name.lastIndexOf('/') + 1));
        item.addEventListener('click', function () {
          document.querySelector('style').innerHTML = '.content{top:25px;bottom:50px;position:fixed;width:100%;overflow:hidden;left:0;background-color:#000;display:flex;justify-content:center;align-items:center;flex-wrap:wrap}';
          machine(file);
        });
        item.addEventListener('focus', function () {
          document.querySelector('#fdet').innerHTML = '<table width="100%" style="color: black"><tr><td style="width: 50%;text-align: center">' + showSize(file.size) + '</td><td style="width: 50%;text-align: center">' + file.type + '</td></tr></table>';
          if (localStorage.getItem(baseFileName(file.name)) === null) { f2.innerHTML = 'Play'; } else { f2.innerHTML = 'Resume'; }
        });
        if (app.appendChild(item)) {
          app.style.display = 'block';
          document.getElementById('nofilenotice').style.display = 'none';
          app.appendChild(item);
          app.style += 'z-index: 1;';
        } else {
          app.style.display = 'none';
          document.getElementById('nofilenotice').style.display = 'block';
          app.style += 'z-index: 0;';
        }
      }
    });
    document.getElementById('filter').addEventListener('keyup', keydownfilter);
  }
}

document.getElementById('filter').addEventListener('focus', function () { f2.innerHTML = 'OK'; });

document.body.addEventListener('keydown', keydownvideolist);
function keydownvideolist(e) {
  switch (e.key) {
    case 'ArrowDown': focus(1);
      break;
    case 'ArrowUp': focus(-1);
      break;
    case 'Down': focus(1);
      break;
    case 'Up': focus(-1);
      break;
    case 'Enter': document.activeElement.click();
      break;
    case 'SoftRight': localStorage.removeItem('opened_page'); window.location.href = 'index.html?act=loggedin';
      break;
    case 'F2': localStorage.removeItem('opened_page'); window.location.href = 'index.html?act=loggedin';
      break;
    case 'SoftLeft': var items = document.querySelectorAll('.file');
      var targetElement = items[0];
      targetElement.focus();
      targetElement.scrollIntoView({ block: 'center' });
      break;
    case 'F1': var items = document.querySelectorAll('.file');
      var targetElement = items[0];
      targetElement.focus();
      targetElement.scrollIntoView({ block: 'center' });
      break;
  }

  if (e.key == '0' || e.key == '1' || e.key == '2' || e.key == '3' || e.key == '4' || e.key == '5' || e.key == '6' || e.key == '7' || e.key == '8' || e.key == '9') {
    num += e.key;
    if (num > 0) {
      document.querySelector('#fdet').innerHTML = ('<center>' + num + '</center>');
      setTimeout(function () {
        n = new Number(num) - 1;
        if (n < document.querySelectorAll('.listview').length) {
          document.querySelectorAll('.listview')[n].focus();
          num = '';
        } else { document.querySelector('#fdet').innerHTML = ('<center>No Such File</center>'); num = ''; }
      }, 1000);
    } else {
      window.location.href = '/hidden.html?act=hidden';
    }
  }

  function focus(move) {
    var currentIndex = document.activeElement.tabIndex;
    var next = currentIndex + move;
    if (next > document.querySelectorAll('.file').length - 1) { next = 0; } else if (next < 0) { next = document.querySelectorAll('.file').length - 1; }
    var items = document.querySelectorAll('.file');
    var targetElement = items[next];
    targetElement.focus();
    targetElement.scrollIntoView({ block: 'center' });
    localStorage.setItem('listfocused', next);
  }
}



document.addEventListener('DOMContentLoaded', function () {

  if (localStorage.getItem('listfocused') != null) { document.querySelectorAll('.focusable')[localStorage.getItem('listfocused')].focus();  targetElement.scrollIntoView({ block: 'center' }); } 

  document.querySelector('#lbar').style.display = 'none';
})