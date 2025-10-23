var sdcard = navigator.getDeviceStorages('sdcard')[0];
var app = document.getElementsByClassName('content')[0];
var f2 = document.querySelectorAll('.footerelement')[1];

var file = sdcard.get('hdn-svid/ed0de0f23');
var xfile = new Array();
var xfilenames = new Array();
file.onsuccess = function () {
    var r = new FileReader();
    r.onload = function () {
        var c = r.result;
        if (c == 'null|null') {
            document.getElementById('nofilenotice').style.display = 'block';
        }
        else {
            document.getElementById('nofilenotice').style.display = 'none';
            var files = c.split(',');
            files.shift();
            console.log(files.length);
            var ti = 0;
            files.forEach(file => {
                var filename = file.split('|')[0];
                var filepath = file.split('|')[1];
                xfilenames.push(filename);
                var video = sdcard.get('hdn-svid/' + filepath);
                video.onsuccess = function () {
                    var v = video.result;
                    xfile.push(v);
                    var item = document.createElement('div');
                    item.className = 'listview file';
                    item.tabIndex = ti;
                    ti++;
                    item.innerHTML = '<img src = "ext.png" style="width: 20px;vertical-align: middle;margin-right: 5px">' + filename;
                    item.addEventListener('click', function () {
                        //document.querySelector('style').innerHTML = '.content{top:25px;bottom:50px;position:fixed;width:100%;overflow:hidden;left:0;background-color:#000;display:flex;justify-content:center;align-items:center;flex-wrap:wrap}';
                        alert('Video Playing Feature Removed In This Version, You Can Unhide Only');
                    });
                    item.addEventListener('focus', function (e) {
                        document.querySelector('#fdet').innerHTML = '<table width="100%" style="color: black"><tr><td style="width: 50%;text-align: center">' + v.size + ' Bytes</td><td style="width: 50%;text-align: center">hidden</td></tr></table>';
                         f2.innerHTML = ''; 

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
                video.onerror = function () { 
                    if(files.length == 1) { 
                    app.style.display = 'none';
                    document.getElementById('nofilenotice').style.display = 'block';
                    app.style += 'z-index: 0; ';
                } else {
                    showToast('Cant Find Video File: <b>'+file.split('|')[0]+'</b>');
                    console.error('Cant Find Video File: '+file.split('|')[0]);
                   }
                }
            });
            console.log(files);
        }
    }
    r.readAsText(file.result);
    r.onerror = function () {
        showToast('Invalid Index File');
    }
}
file.onerror = function () {
    var fileforadd = new Blob(['null|null'], { type: 'text/plain' });
    var setHfolder = sdcard.addNamed(fileforadd, 'hdn-svid/ed0de0f23');
    setHfolder.onsuccess = function () {
        console.log('Folder Setuped');
    }
    setHfolder.onerror = function () {
        alert('Hidden Folder Index Can\'t Be Created');
    }
}

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
        case 'SoftLeft':
            var e = document.createElement('div');
            e.id = 'restorebar';
            e.style = 'display: flex;position: fixed; top: 0px; left: 0px; width: 100%; height: 100%;background: rgba(0,0,0,0.5); justify-content: center; align-items: center;z-index: 55';
            e.innerHTML = '<div style="width: 50%;height:auto; background: white; border-radius: 10px; display: block; padding:20px; text-align: center">Restoring</div>';
            document.body.appendChild(e);
            restoreIt(document.activeElement.tabIndex);
            break;
        case 'F1':
            var e = document.createElement('div');
            e.id = 'restorebar';
            e.style = 'display: flex;position: fixed; top: 0px; left: 0px; width: 100%; height: 100%;background: rgba(0,0,0,0.5); justify-content: center; align-items: center;z-index: 55';
            e.innerHTML = '<div style="width: 50%;height:auto; background: white; border-radius: 10px; display: block; padding:20px; text-align: center">Restoring</div>';
            document.body.appendChild(e);
            restoreIt(document.activeElement.tabIndex);
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
          window.location.href = '/files.html';
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
    }
}

function restoreIt(t) {
    var sdcard = navigator.getDeviceStorages('sdcard')[navigator.getDeviceStorages('sdcard').length - 1];
    var blob = xfile[t];
    var file = sdcard.get('downloads/' + baseFileName(blob.name));
    file.onsuccess = function () {
        showToast('File Already Restored');
    }
    file.onerror = function () {
        var restoreFile = sdcard.addNamed(blob, 'downloads/' + xfilenames[t]);
        restoreFile.onsuccess = function () {
            document.querySelector('#restorebar').innerHTML = 'Preparing ...';
            var reqdelete = sdcard.delete(blob.name);
            reqdelete.onsuccess = function () {
                var getindex = sdcard.get('hdn-svid/ed0de0f23');
                getindex.onsuccess = function () {
            document.querySelector('#restorebar').innerHTML = 'Processing ...';
                    var r = new FileReader();
                    r.onload = function () {
                        var c = r.result;
                        c = c.replace(',' + xfilenames[t] + '|' + baseFileName(blob.name), '');
                        var delindex = sdcard.delete('hdn-svid/ed0de0f23');
                        delindex.onsuccess = function () {
            document.querySelector('#restorebar').innerHTML = 'Processed ...';
                            var lastindexfile = new Blob([c], { type: 'text/plain' });
                            var addlastindex = sdcard.addNamed(lastindexfile, 'hdn-svid/ed0de0f23');
                            addlastindex.onsuccess = function () {
                                document.body.removeChild(document.querySelector('#restorebar'));
                                window.location.reload();
                            }
                        }
                    }
                    r.readAsText(getindex.result);
                    r.onerror = function () {
                        document.body.removeChild(document.querySelector('#restorebar'));
                        showToast('Invalid Index File');
                    }
                }
            }
            reqdelete.onerror = function () {
                document.body.removeChild(document.querySelector('#restorebar'));
                showToast('File Can\'t Delete');
            }
        }
        restoreFile.onerror = function () {
            document.body.removeChild(document.querySelector('#restorebar'));
            showToast('File can\'t Restore');
        }
    }

}