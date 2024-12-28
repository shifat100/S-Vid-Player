try {
    String.prototype.includes = function (str) {
        return this.indexOf(str) !== -1;
    }
    function fileExtention(filename) {
        var fsplit = filename.split(".");
        var extention = fsplit[fsplit.length - 1];
        return extention;
    }

    function gup(name, loc = window.location.href) { name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]"); var regexS = "[\\?&]" + name + "=([^&#]*)"; var regex = new RegExp(regexS); var results = regex.exec(loc); if (results == null) return ""; else return results[1]; }


    function insertUrlParam(key, value) {
        if (history.pushState) {
            let searchParams = new URLSearchParams(window.location.search);
            searchParams.set(key, value);
            let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + searchParams.toString();
            window.history.pushState({ path: newurl }, '', newurl);
        }
    }

    function removeUrlParameter(paramKey) {
        const url = window.location.href;
        var r = new URL(url);
        r.searchParams.delete(paramKey);
        const newUrl = r.href;
        window.history.pushState({ path: newUrl }, '', newUrl);
    }

    function playVid(originalBlob) {
        var blob = new Blob([originalBlob], { type: 'video/mp4' });
        var blobtype = blob.type;
        var path = URL.createObjectURL(blob);
        var header = document.getElementsByClassName('header')[0];
        var f1 = document.querySelectorAll('.footerelement')[0];
        var f2 = document.querySelectorAll('.footerelement')[1];
        var f3 = document.querySelectorAll('.footerelement')[2];
        var app = document.getElementsByClassName('content')[0];
        var scale = 1;
        var rotate = 0;
        var fscreen = 'no';
        var volume = navigator.volumeManager;
        var filename = baseFileName(originalBlob.name);
        var issub = false;
        var subon = true;
        var ispaused = false;
        // var playingindex = filenamearray.indexOf(baseFileName(originalBlob.name));
        var tstime = 0;
        var checkbgplaycommand = 'false';

        header.innerHTML = baseFileName(originalBlob.name);
        app.style = 'background-color: black;';
        app.innerHTML = `<video id="player" type="${blobtype}" autoplay>
        <source id="vidsrc" src="${path}" type="${blobtype}">
        </source>
        </video><audio id="player1" src="${path}" mozaudiochannel="content" ></audio>
        <div id="subtitle" style="background: rgba(0,0,0,1);padding: 0px;position: absolute;bottom: 20px;width: 100%;left: 0px;color: white; text-align: center;"></div><div id="pp"></div>
        <div id="details"></div>`;
        f1.innerHTML = 'Fullscreen';
        f2.innerHTML = 'Pause';
        f3.innerHTML = 'Mute';
        var vp = document.querySelector('#player');
        var ap = document.querySelector('#player1');

        /*vp.mozAudioChannelType = 'content'; mozAudioChannelType="alarm"*/
        var subtitleBar = document.getElementById('subtitle');

        if (gup("ref") == "filelist") {
            if (localStorage.getItem(filename) != null) {
                vp.pause();
                if (window.confirm("Resume Previous Playback ?")) {
                    vp.currentTime = localStorage.getItem(filename);
                    vp.play();
                } else {
                    vp.currentTime = 0;
                    vp.play();
                }
            }
        } else {
            if (localStorage.getItem(filename) != null) {
                vp.pause();
                vp.currentTime = localStorage.getItem(filename);
                vp.play();
            } else {
                vp.currentTime = 0;
                vp.play();
            }
        }




        function addZero(n) { return n < 10 ? '0' + n : n }
        function zoomIn() { scale += 0.1; vp.style = 'transform: scale(' + scale + ') rotate(' + rotate + 'deg);'; }
        function zoomOut() { scale -= 0.1; vp.style = 'transform: scale(' + scale + ') rotate(' + rotate + 'deg);'; }
        function rotateVid(n) { rotate += n; if (rotate > 360) { rotate = 0; } if (rotate < -360) { rotate = 0; } vp.style = 'transform: scale(' + scale + ') rotate(' + rotate + 'deg);'; }
        function defaultScreen() { scale = 1; rotate = 0; vp.style = 'transform: scale(' + scale + ') rotate(' + rotate + 'deg);'; vp.playbackRate = 1; if (subon === true) { subtitleBar.style = 'background: rgba(0,0,0,1);padding: 0px;position: absolute;bottom: 20px;width: 100%;left: 0px;color: white; text-align: center;display:block;z-index: 1'; } }
        function openFullScreen() { fscreen = 'yes'; app.style = 'top: 0px; bottom:0px;z-index: 50;display: flex;justify-content: center;align-items: center;'; rotate = 90; scale = 1.36; vp.style = 'transform: scale(' + scale + ') rotate(' + rotate + 'deg);z-index: 998'; document.querySelectorAll('#details')[0].style = 'display: none;'; if (subon === true) { subtitleBar.style = 'background: rgba(0,0,0,1);padding: 0px;position: absolute;top: auto;width: 100%;left: -99px;color: white;text-align: center;transform: rotate(90deg);display:block;z-index: 999'; } else { subtitleBar.style = 'display: none'; } }
        function exitFullScreen() { fscreen = 'no'; app.style = 'top: 25px; bottom:50px; z-index: 0;'; rotate = 0; scale = 1; vp.style = 'transform: scale(' + scale + ') rotate(' + rotate + 'deg);'; document.querySelectorAll('#details')[0].style = 'display: block;'; if (subon === true) { subtitleBar.style = 'background: rgba(0,0,0,1);padding: 0px;position: absolute;bottom: 20px;width: 100%;left: 0px;color: white; text-align: center;display:block;z-index: 1'; } else { subtitleBar.style = 'display: none'; } }

        function parseVTT(vttText) {
            var subtitles = [];
            var lines = vttText.split('\n');
            var currentSubtitle = null;

            lines.forEach(line => {
                if (line.includes('-->')) {
                    var times = line.split(' --> ');
                    currentSubtitle = {
                        start: parseTime(times[0]),
                        end: parseTime(times[1]),
                        text: ''
                    };
                } else if (currentSubtitle && line.trim() !== '') {
                    currentSubtitle.text += line.trim() + ' ';
                } else if (line.trim() === '') {
                    if (currentSubtitle) {
                        subtitles.push(currentSubtitle);
                        currentSubtitle = null;
                    }
                }
            });

            if (currentSubtitle) {
                subtitles.push(currentSubtitle);
            }

            return subtitles;
        }


        function parseSRT(srtText) {
            var subtitles = [];
            var lines = srtText.split('\n');
            var currentSubtitle = null;

            lines.forEach(line => {
                if (/^\d+$/.test(line.trim())) {
                    if (currentSubtitle) {
                        subtitles.push(currentSubtitle);
                    }
                    currentSubtitle = { start: 0, end: 0, text: '' };
                } else if (line.includes('-->')) {
                    var times = line.split(' --> ');
                    currentSubtitle.start = parseTime(times[0]);
                    currentSubtitle.end = parseTime(times[1]);
                } else if (currentSubtitle && line.trim() !== '') {
                    currentSubtitle.text += line.trim() + ' ';
                }
            });

            if (currentSubtitle) {
                subtitles.push(currentSubtitle);
            }

            return subtitles;
        }

        function parseTime(timeString) {
            var parts = timeString.split(':');
            var secondsParts = parts[2].split('.');
            var hours = parseInt(parts[0], 10);
            var minutes = parseInt(parts[1], 10);
            var seconds = parseInt(secondsParts[0], 10);
            var milliseconds = parseInt(secondsParts[1] || '0', 10);

            return (hours * 3600) + (minutes * 60) + seconds + (milliseconds / 1000);
        }

        function getSubtitleForTime(subtitles, time) {
            for (var i = 0; i < subtitles.length; i++) {
                if (time >= subtitles[i].start && time <= subtitles[i].end) {
                    return subtitles[i];
                }
            }
            return null;
        }

        navigator.getDeviceStorages('sdcard').forEach(sdcard => {
            var request = sdcard.get(originalBlob.name.replace(fileExtention(originalBlob.name), 'vtt'));

            request.onsuccess = function () {
                var fileReader = new FileReader();
                fileReader.onload = function () {
                    subon = true;
                    issub = true;
                    var data = fileReader.result;
                    subtitleBar.style = 'background: rgba(0,0,0,1);padding: 0px;position: absolute;bottom: 20px;width: 100%;left: 0px;color: white; text-align: center;display:block;z-index: 1';
                    var subtitles = parseVTT(data);
                    vp.addEventListener('timeupdate', () => {
                        var currentTime = vp.currentTime;
                        var currentSubtitle = getSubtitleForTime(subtitles, currentTime);
                        subtitleBar.textContent = currentSubtitle ? currentSubtitle.text : '';
                    });
                }
                fileReader.readAsText(request.result);
            }
            request.onerror = function () {
                var request1 = sdcard.get(originalBlob.name.replace(fileExtention(originalBlob.name), 'srt'));

                request1.onsuccess = function () {
                    var fileReader = new FileReader();
                    fileReader.onload = function () {
                        subon = true;
                        issub = true;
                        var data = fileReader.result;
                        subtitleBar.style = 'background: rgba(0,0,0,1);padding: 0px;position: absolute;bottom: 20px;width: 100%;left: 0px;color: white; text-align: center;display:block;z-index: 1';
                        var subtitles = parseSRT(data);
                        vp.addEventListener('timeupdate', () => {
                            var currentTime = vp.currentTime;
                            var currentSubtitle = getSubtitleForTime(subtitles, currentTime);
                            subtitleBar.textContent = currentSubtitle ? currentSubtitle.text : '';
                        });
                    }

                    fileReader.readAsText(request1.result);
                }
                request1.onerror = function () {
                    subon = false;
                    issub = false;
                    subtitleBar.style.display = 'none';
                };
            };
        });

        function zero() {
            var e = document.createElement('div');
            e.id = 'zerobar';
            e.style = 'display: flex;position: fixed; top: 0px; left: 0px; width: 100%; height: 100%;background: rgba(0,0,0,0.5); justify-content: center; align-items: center;z-index: 54';
            e.innerHTML = '<div style="background: white; padding: 5px 15px 5px 10px; border-radius: 10px; width: 80%"><a class="zerolist" tabindex="0">Details</a><a class="zerolist" tabindex="1">Settings</a><a class="zerolist" tabindex="2">Hide</a>';
            document.body.appendChild(e);

            document.querySelectorAll('.zerolist')[0].addEventListener('click', function () { videoDetails(); });
            document.querySelectorAll('.zerolist')[1].addEventListener('click', function () { settings(); });
            document.querySelectorAll('.zerolist')[2].addEventListener('click', function () {
                hideFile(originalBlob);
                document.body.removeEventListener('keydown', keydownzero);
                document.body.addEventListener('keydown', keydownmain);
                document.body.addEventListener('keyup', keyupmain);
            });


            document.querySelectorAll('.zerolist')[0].focus();
            document.body.removeEventListener('keydown', keydownmain);
            document.body.removeEventListener('keyup', keyupmain);
            document.body.addEventListener('keydown', keydownzero);
        }

        function videoDetails() {
            document.body.removeChild(document.querySelector('#zerobar'));
            var s = 5;
            var e = document.createElement('div');
            e.style = 'display: flex;position: fixed; top: 0px; left: 0px; width: 100%; height: 100%;background: rgba(0,0,0,0.5); justify-content: center; align-items: center;z-index: 55';
            e.innerHTML = '<div style="width: 80%;height:auto; background: white; border-radius: 10px; display: block; padding:10px 5px 5px 7px"><p><b>Name:</b> ' + baseFileName(originalBlob.name) + '</p><p><b>Size:</b> ' + showSize(originalBlob.size) + '</p><p><b>Type:</b> ' + originalBlob.type + '</p><p><b>Resolution:</b> ' + vp.videoWidth + 'x' + vp.videoHeight + '</p><p><b>Last Modified:</b> ' + originalBlob.lastModifiedDate + '</p><p><b>Path:</b> ' + originalBlob.name.replace('sdcard/', 'Internal/').replace('sdcard1/', 'SD Card/') + '</p><br><center><div style="position: relative; padding: 5px; width: auto; display: block; bottom: 0px; left: 0px; background: black; color: white;border-radius:10px">Wait <x id="stc">5</x>s To Close</div></center></div>';
            var k = setInterval(function () { if (s > 0) { s -= 1; document.getElementById('stc').innerHTML = s; } }, 1000);
            document.body.appendChild(e);
            setTimeout(function () { document.body.removeChild(e); s = 5; clearInterval(k); }, 5000);

            document.body.removeEventListener('keydown', keydownzero);
            document.body.addEventListener('keydown', keydownmain);
            document.body.addEventListener('keyup', keyupmain);
        }

        function settings() {
            document.body.removeChild(document.querySelector('#zerobar'));
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
            document.body.removeEventListener('keydown', keydownzero);
            document.body.addEventListener('keydown', keydownsetting);
        }

        document.body.addEventListener('keydown', keydownmain);
        document.body.addEventListener('keyup', keyupmain);

        function keydownmain(e) {
            if (e.key == 'Enter') { if (vp.paused) { vp.play(); f2.innerHTML = 'Pause'; showToast('Playback Resumed'); ispaused = false; } else { vp.pause(); f2.innerHTML = 'Play'; showToast('Playback Paused'); ispaused = true; } }
            if (e.key == 'ArrowLeft') { vp.currentTime -= 10; }
            if (e.key == 'ArrowRight') { vp.currentTime += 10; }
            if (e.key == 'ArrowUp') { volume.requestUp(); }
            if (e.key == 'ArrowDown') { volume.requestDown(); }
            if (e.key == '1') { vp.playbackRate -= 0.1; showToast('Playback Speed `' + vp.playbackRate.toFixed(1) + 'x`'); }
            if (e.key == '2') { vp.playbackRate = 1; showToast('Playback Speed `' + vp.playbackRate.toFixed(1) + 'x`'); }
            if (e.key == '3') { vp.playbackRate += 0.1; showToast('Playback Speed `' + vp.playbackRate.toFixed(1) + 'x`'); }
            if (e.key == '4') { tstime = new Date().getTime(); }
            if (e.key == '5') { defaultScreen(); showToast('Default Playback'); }
            if (e.key == '6') { tstime = new Date().getTime(); }
            if (e.key == '7') {
                if (gup('act', window.location.href) == 'hidden') {
                    window.location.href = '/hidden.html';
                } else {
                    window.location.href = '/files.html?ref=filelist';
                }
            }
            if (e.key == '8') {
                if (issub) {
                    if (subon == true) { subon = false; subtitleBar.style.display = 'none'; showToast('Subtitle Off'); } else {
                        subon = true;
                        if (rotate == 90) { subtitleBar.style = 'background: rgba(0,0,0,1);padding: 0px;position: absolute;top: auto;width: 100%;left: -99px;color: white;text-align: center;transform: rotate(90deg);display:block;z-index: 51'; } else { subtitleBar.style = 'background: rgba(0,0,0,1);padding: 0px;position: absolute;bottom: 20px;width: 100%;left: 0px;color: white; text-align: center;display:block;z-index: 1'; }
                        showToast('Subtitle On');
                    }
                } else { showToast('No Subtitle Found'); }
            }
            if (e.key == '9') { tstime = new Date().getTime(); }
            if (e.key == '*') { zoomOut(); showToast('Playback Zoom `' + scale.toFixed(1) + 'x`'); }
            if (e.key == '#' || e.key == '/') { zoomIn(); showToast('Playback Zoom `' + scale.toFixed(1) + 'x`'); }
            if (e.key == '0') { zero(); }
            if (e.key == 'SoftLeft' || e.key == 'F1') { if (fscreen == 'yes') { exitFullScreen(); showToast('Closed FullScreen'); } else { openFullScreen(); } }
            if (e.key == 'SoftRight' || e.key == 'F2') { if (vp.muted) { vp.muted = false; f3.innerHTML = 'Mute'; showToast('Video Unmuted'); } else { vp.muted = true; f3.innerHTML = 'Unmute'; showToast('Video Muted'); } }
            if (e.key === 'Call' || e.key == 's') {
                var canvas = document.createElement('canvas');
                canvas.style.display = 'none';
                var context = canvas.getContext('2d');
                canvas.width = vp.videoWidth;
                canvas.height = vp.videoHeight;
                context.fillRect(0, 0, vp.videoWidth, vp.videoHeight);
                context.drawImage(vp, 0, 0, vp.videoWidth, vp.videoHeight);
                document.body.appendChild(canvas);
                var a = document.createElement('a');
                a.href = canvas.toDataURL('image/jpeg');
                a.download = baseFileName(originalBlob.name).replace('.mp4', '').replace('.3gp', '') + '_' + new Date().getTime().toString() + '.jpg';
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                document.body.removeChild(canvas);
            }
        }

        function keyupmain(e) {
            if (e.key == "4") {
                if ((new Date().getTime() - tstime) < 1000) {
                    rotateVid(-10);
                } else {
                    if ((playingindex - 1) > -1 && playingindex != -1) {
                        removeUrlParameter('ref');
                        playingindex = playingindex - 1;
                        document.body.removeEventListener('keydown', keydownmain);
                        document.body.removeEventListener('keyup', keyupmain);
                        playVid(files[playingindex]);
                    } else {
                        showToast("No Video Found");
                    }
                }
            }
            if (e.key == "6") {
                if ((new Date().getTime() - tstime) < 1000) {
                    rotateVid(+10);
                } else {
                    if ((playingindex + 1) < files.length && playingindex != -1) {
                        removeUrlParameter('ref');
                        playingindex = playingindex + 1;
                        document.body.removeEventListener('keydown', keydownmain);
                        document.body.removeEventListener('keyup', keyupmain);
                        playVid(files[playingindex]);
                    } else {
                        showToast("No Video Found");
                    }
                }
            }

            if (e.key == '9') {
                if ((new Date().getTime() - tstime) < 1000) {
                    var des = window.prompt('Destination (00:00:00)', '00:00:00'); var regexp = /[0-9]\d:[0-9]\d:[0-9]\d/; if (regexp.test(des)) { var h = new Number(des.split(':')[0]); var m = new Number(des.split(':')[1]); var s = new Number(des.split(':')[2]); var cal = (h * 60 * 60) + (m * 60) + s; if (cal < vp.duration) { vp.currentTime = cal; showToast('Video Forwarded To: <b>' + des + '</b>'); } else { showToast('Invalid Destination'); } } else { showToast('Invalid Input Format'); }
                } else { vp.pause(); vp.currentTime = 0; vp.play(); }
            }
        }

        function keydownzero(e) {
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
                case 'SoftRight':
                    document.body.removeChild(document.querySelector('#zerobar'));
                    document.body.removeEventListener('keydown', keydownzero);
                    document.body.addEventListener('keydown', keydownmain);
                    document.body.addEventListener('keyup', keyupmain);
                    break;
            }

            function focus(move) {
                var currentIndex = document.activeElement.tabIndex;
                var next = currentIndex + move;
                if (next > document.querySelectorAll('.zerolist').length - 1) { next = 0; } else if (next < 0) { next = document.querySelectorAll('.zerolist').length - 1; }
                var items = document.querySelectorAll('.zerolist');
                var targetElement = items[next];
                targetElement.focus();
                targetElement.scrollIntoView({ block: 'center' });
            }
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
                    document.body.removeEventListener('keydown', keydownsetting); document.body.addEventListener('keydown', keydownmain);
                    document.body.addEventListener('keyup', keyupmain);
                    break;
                case 'F1': localStorage.setItem('filetypes', document.querySelectorAll('#extentions')[0].value);
                    if (document.querySelector('#lockbtn').checked == true && document.querySelector('#inputpass').value != '') { localStorage.setItem('islocked', 'yes'); localStorage.setItem('lockedpass', document.querySelector('#inputpass').value); } else if (document.querySelector('#lockbtn').checked == false) { localStorage.setItem('islocked', 'no'); localStorage.removeItem('lockedpass'); }
                    document.body.removeChild(document.querySelector('#settings'));
                    document.body.removeEventListener('keydown', keydownsetting); document.body.addEventListener('keydown', keydownmain);
                    document.body.addEventListener('keyup', keyupmain);
                    break;
                case 'SoftRight':
                    document.body.removeChild(document.querySelector('#settings'));
                    document.body.removeEventListener('keydown', keydownsetting);
                    document.body.addEventListener('keydown', keydownmain);
                    document.body.addEventListener('keyup', keyupmain);
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

        vp.addEventListener('timeupdate', function () {
            var rand = Math.floor(Math.random() * 255) + 100;
            rand = 33;
            document.querySelector('#details').innerHTML = '<table width="100%" style="color: white"><tr><td style="width: 50%;text-align: center">' + (addZero(new Date(vp.currentTime * 1000).getHours() - 6) + ':' + addZero(new Date(vp.currentTime * 1000).getMinutes()) + ':' + addZero(new Date(vp.currentTime * 1000).getSeconds()) + '/' + addZero(new Date(vp.duration * 1000).getHours() - 6) + ':' + addZero(new Date(vp.duration * 1000).getMinutes()) + ':' + addZero(new Date(vp.duration * 1000).getSeconds()) + '</td><td style="width: 50%;text-align: center">' + vp.playbackRate.toFixed(1)) + ' X</td></tr></table>';
            if (fscreen == 'yes') { document.querySelector('#pp').style = 'display:none'; } else { document.querySelector('#pp').style = 'width:' + ((vp.currentTime / vp.duration) * 100 + '%;display: block; padding: 1px 0px;background: rgb(' + (((vp.currentTime / vp.duration) * 100).toFixed(0) * 2.5).toFixed(0) + ',' + (255 - (((vp.currentTime / vp.duration) * 100).toFixed(0) * 2.5).toFixed(0)) + ',' + rand + ');position:fixed; bottom: 49px; left: 0px;z-index: 5;border-right: 5px groove white;'); }
            if (((vp.currentTime / vp.duration) * 100) == 100) {
                localStorage.removeItem(filename);
                vp.pause();
                ispaused = true;
                f2.innerHTML = 'Play';
            } else {
                localStorage.setItem(filename, vp.currentTime);
            }
        });

        setTimeout(function () { checkbgplaycommand = localStorage.getItem('bgplay'); }, 1000);
        if (checkbgplaycommand == 'yes') {
            document.addEventListener('visibilitychange', function () {

                if (document.hidden) {
                    if (ispaused === false) {
                        vp.pause();
                        console.log('app hided');
                        ap.currentTime = localStorage.getItem(filename);
                        ap.play();
                        ap.addEventListener('timeupdate', function () {
                            localStorage.setItem(filename, ap.currentTime);
                        });
                    }
                } else {
                    if (ispaused === true) { ap.pause(); vp.pause(); } else {
                        ap.pause();
                        vp.currentTime = localStorage.getItem(filename);
                        vp.play();
                        console.log('app showed');
                    }
                }
            });
        }



        function scaleVideo() {
            var w = window.innerWidth;
            var h = window.innerHeight;

            if (w / 16 >= h / 9) {
                vp.setAttribute('width', w);
                vp.setAttribute('height', 'auto');
            } else {
                vp.setAttribute('width', 'auto');
                vp.setAttribute('height', h);
            }
        }

        // scaleVideo();

    }


    function machine(blob) {
        document.body.removeEventListener('keydown', keydownvideolist);
        document.querySelector('#fdet').style.display = 'none';
        app.innerHTML = '';
        playVid(blob);
        showToast('Press 7 To File List');
    }



    function hideFile(blob) {
        if (blob.name.includes('hdn-svid/')) {
            showToast('<b>' + baseFileName(blob.name) + '</b> Already Hided');
            document.body.removeChild(document.querySelector('#zerobar'));
        } else {
            var sdcard = navigator.getDeviceStorages('sdcard')[0];
            var file = sdcard.get('hdn-svid/ed0de0f23');
            file.onsuccess = function () {
                console.log('found hidden index');
            }
            file.onerror = function () {
                var fileforadd = new Blob(['null|null'], { type: 'text/plain' });
                var setHfolder = sdcard.addNamed(fileforadd, 'hdn-svid/ed0de0f23');
                setHfolder.onsuccess = function () {
                    console.log('folder setuped');
                }
                setHfolder.onerror = function () {
                    alert('hidden folder / index cant be created');
                }
            }

            var dateStr = new Date().getTime().toString();

            var freeSpace = sdcard.freeSpace();
            freeSpace.onsuccess = function () {
                if (this.result > blob.size) {
                    var addHfile = sdcard.addNamed(blob, 'hdn-svid/' + dateStr + '.hdn');
                    addHfile.onsuccess = function () {
                        var del = sdcard.delete(blob.name);
                        del.onsuccess = function () {
                            var file = sdcard.get('hdn-svid/ed0de0f23');
                            file.onsuccess = function () {
                                var r = new FileReader();
                                r.onload = function () {
                                    var c = r.result;
                                    c += ',' + baseFileName(blob.name) + '|' + dateStr + '.hdn';
                                    var deleteindex = sdcard.delete('hdn-svid/ed0de0f23');
                                    deleteindex.onsuccess = function () {
                                        var editedindex = new Blob([c], { type: 'text/plain' });
                                        var setEindex = sdcard.addNamed(editedindex, 'hdn-svid/ed0de0f23');
                                        setEindex.onsuccess = function () {
                                            document.body.removeChild(document.querySelector('#zerobar'));
                                            showToast('<b>' + baseFileName(blob.name) + '</b> Hided');
                                        }
                                    }
                                    deleteindex.onerror = function () { showToast('cant delete index file'); }
                                }
                                r.readAsText(file.result);
                                r.onerror = function () {
                                    showToast('Invalid Index File');
                                }
                            }
                            file.onerror = function () { showToast('Cant Read Index file'); }
                        }
                        del.onerror = function () {
                            showToast('File Can\'t Moved');
                        }
                    }
                    addHfile.onerror = function () {
                        showToast('File Can\'t Hide');
                    }
                }
                else {
                    showToast('Not Enough Space Available');
                }
            }
        }
    }


    document.addEventListener('DOMContentLoaded', () => { getKaiAd({ publisher: '080b82ab-b33a-4763-a498-50f464567e49', app: 's-vid_player', slot: 's-vid_player', onerror: err => console.error('Custom catch:', err), onready: ad => { ad.call('display'); } }); });

   setInterval(function() { getKaiAd({ publisher: '080b82ab-b33a-4763-a498-50f464567e49', app: 's-vid_player', slot: 's-vid_player', onerror: err => console.error('Custom catch:', err), onready: ad => { ad.call('display'); } }); }, 20000);

    document.body.addEventListener('click', function () {
        console.info('Width: ' + window.innerWidth + '\nHeight: ' + window.innerHeight);
    });






} catch (e) {
    showToast('<b>error:</b> ' + e.message);
}


