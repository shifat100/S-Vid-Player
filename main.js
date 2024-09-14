if (localStorage.getItem('islocked') == 'yes' && gup('act', window.location.href) == '') {
    var pass = prompt('Enter PassWord: ');
    var spass = localStorage.getItem('lockedpass');
    if (pass == spass) {
        document.body.addEventListener('keydown', keydownpick);

        function keydownpick(e) {
            if (e.key == 'Enter') { window.location.href = 'files.html?ref=filelist'; }
            if (e.key == 'SoftLeft' || e.key == 'F1') { settings(); }
            if (e.key == 'SoftRight' || e.key == 'F2') { if (confirm('Are You Sure?')) { window.close(); } }
        }

        if (localStorage.getItem('opened_page') == 'videos') {
            window.location.href = 'files.html?ref=filelist';
        }
    } else {
        document.body.innerHTML = 'Wrong Access. Hold End Key To Exit.';
    }
} else {
    document.body.addEventListener('keydown', keydownpick);

    function keydownpick(e) {
        if (e.key == 'Enter') { window.location.href = 'files.html?ref=filelist'; }
        if (e.key == 'SoftLeft' || e.key == 'F1') { settings(); }
        if (e.key == 'SoftRight' || e.key == 'F2') { if (confirm('Are You Sure?')) { window.close(); } }
    }

    if (localStorage.getItem('opened_page') == 'videos') {
        window.location.href = 'files.html?ref=filelist';
    }
}


function settings() {
    var e = document.createElement('div');
    e.id = 'settings';
    e.style = 'display: flex;position: fixed; top: 0px; left: 0px; width: 100%; height: 100%;background: rgba(0,0,0,0.5); justify-content: center; align-items: center;z-index: 55';
    e.innerHTML = '<div style="width: 100%;height:auto; background: white; border-radius: 10px; display: block; padding:10px 5px 5px 7px"><div class="header">Setting</div><div class="content" style="background: white; bottom: 29px;display: block; padding: 20px">Extentions For Scan:<br><input type="text" value="mp4, 3gp, mkv" class="focusable" tabindex="0" id="extentions"><br>Play In Background: <input type="checkbox" id="bgplaybtn" class="focusable" tabindex="1" style="display: inline-block; width: auto;"><br>Lock: <input type="checkbox" id="lockbtn" class="focusable" tabindex="2" style="display: inline-block; width: auto;"><br><input type="text" id="inputpass" disabled="disable" placeholder="pass"><br><button id="resetbtn" class="focusable" tabindex="3">Reset</button></div><div class="footer"><div class="footerelement">Save</div><div class="footerelement">OK</div><div class="footerelement">Back</div></div></div>';
    document.body.appendChild(e);

    var lockbtn = document.querySelector('#lockbtn');
    lockbtn.addEventListener('change', function () {
        if (lockbtn.checked == true) {
            document.querySelector('#inputpass').removeAttribute('disabled');
            document.querySelector('#inputpass').setAttribute('class', 'focusable');
            document.querySelector('#inputpass').setAttribute('tabindex', '3');
            document.querySelectorAll('#resetbtn')[0].setAttribute('tabindex', '4')
        } else if (lockbtn.checked == false) {
            document.querySelector('#inputpass').setAttribute('disabled', 'disable');
            document.querySelector('#inputpass').removeAttribute('class');
            document.querySelector('#inputpass').removeAttribute('tabindex');
            document.querySelectorAll('#resetbtn')[0].setAttribute('tabindex', '3');
        }
    });
    var bgplaybtn = document.querySelector('#bgplaybtn');
    bgplaybtn.addEventListener('change', function () {
        if (bgplaybtn.checked == true) {
            localStorage.setItem('bgplay', 'yes');
        } else {
            localStorage.removeItem('bgplay');

        }
    });

    if (localStorage.getItem('bgplay') == 'yes') {
        bgplaybtn.setAttribute('checked', 'check');
    }

    if (localStorage.getItem('islocked') == 'yes') { lockbtn.setAttribute('checked', 'check'); document.querySelector('#inputpass').placeholder = '******'; }
    if (localStorage.getItem('filetypes') !== null) { document.querySelector('#extentions').value = localStorage.getItem('filetypes'); }


    document.querySelectorAll('#resetbtn')[0].addEventListener('click', function () {
        if (confirm('Restart Required. Are You Sure ?')) { window.localStorage.clear(); window.close(); }
    });

    document.querySelectorAll('.focusable')[0].focus();
    document.body.removeEventListener('keydown', keydownpick);
    document.body.addEventListener('keydown', keydownsetting);
}

function keydownsetting(e) {
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
        case 'SoftLeft': localStorage.setItem('filetypes', document.querySelectorAll('#extentions')[0].value);
            if (document.querySelector('#lockbtn').checked == true && document.querySelector('#inputpass').value != '') { localStorage.setItem('islocked', 'yes'); localStorage.setItem('lockedpass', document.querySelector('#inputpass').value); } else if (document.querySelector('#lockbtn').checked == false) { localStorage.setItem('islocked', 'no'); localStorage.removeItem('lockedpass'); }
            document.body.removeChild(document.querySelector('#settings'));
            document.body.removeEventListener('keydown', keydownsetting); document.body.addEventListener('keydown', keydownpick);
            break;
        case 'F1': localStorage.setItem('filetypes', document.querySelectorAll('#extentions')[0].value);
            if (document.querySelector('#lockbtn').checked == true && document.querySelector('#inputpass').value != '') { localStorage.setItem('islocked', 'yes'); localStorage.setItem('lockedpass', document.querySelector('#inputpass').value); } else if (document.querySelector('#lockbtn').checked == false) { localStorage.setItem('islocked', 'no'); localStorage.removeItem('lockedpass'); }
            document.body.removeChild(document.querySelector('#settings'));
            document.body.removeEventListener('keydown', keydownsetting); document.body.addEventListener('keydown', keydownpick);
            break;
        case 'SoftRight':
            document.body.removeChild(document.querySelector('#settings'));
            document.body.removeEventListener('keydown', keydownsetting);
            document.body.addEventListener('keydown', keydownpick);
            break;
    }
    function focus(move) {
        var currentIndex = document.activeElement.tabIndex;
        var next = currentIndex + move;
        if (next > document.querySelectorAll('.focusable').length - 1) { next = 0; } else if (next < 0) { next = document.querySelectorAll('.focusable').length - 1; }
        var items = document.querySelectorAll('.focusable');
        var targetElement = items[next];
        targetElement.focus();
        targetElement.scrollIntoView({ block: 'center' });
    }
}