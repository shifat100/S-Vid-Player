try {
    // --- Polyfills & Utilities ---
    String.prototype.includes = function (str) {
        return this.indexOf(str) !== -1;
    }

    function fileExtention(filename) {
        return filename.split(".").pop() || "";
    }
    function gup(name, loc = window.location.href) { name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]"); var regexS = "[\\?&]" + name + "=([^&#]*)"; var regex = new RegExp(regexS); var results = regex.exec(loc); if (results == null) return ""; else return results[1]; }

    function insertUrlParam(key, value) {
        if (history.pushState) {
            var searchParams = new URLSearchParams(window.location.search);
            searchParams.set(key, value);
            var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + searchParams.toString();
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

    // --- Custom MPA File Decoder ---
    function decodeMPAFile(file) {
        const SEPARATOR_STRING = '[shifat100]';

        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const arrayBuffer = event.target.result;
                    const fileBytes = new Uint8Array(arrayBuffer);
                    const separatorBytes = new TextEncoder().encode(SEPARATOR_STRING);
                    var separatorIndex = -1;

                    // Efficiently find the separator index
                    for (var i = 0; i <= fileBytes.length - separatorBytes.length; i++) {
                        var found = true;
                        for (var j = 0; j < separatorBytes.length; j++) {
                            if (fileBytes[i + j] !== separatorBytes[j]) {
                                found = false;
                                break;
                            }
                        }
                        if (found) {
                            separatorIndex = i;
                            break;
                        }
                    }

                    if (separatorIndex !== -1) {
                        // Separator found: It's a video file with custom audio
                        const audioData = arrayBuffer.slice(0, separatorIndex);
                        const videoData = arrayBuffer.slice(separatorIndex + separatorBytes.length);
                        const audioBlob = new Blob([audioData], { type: 'audio/mp4' });
                        const videoBlob = new Blob([videoData], { type: 'video/mp4' });
                        const audioUrl = URL.createObjectURL(audioBlob);
                        const videoUrl = URL.createObjectURL(videoBlob);
                        resolve({ audioUrl, videoUrl, isAudioOnly: false });
                    } else {
                        // No separator: It's a pure audio file
                        const audioBlob = new Blob([arrayBuffer], { type: 'audio/mp4' });
                        const audioUrl = URL.createObjectURL(audioBlob);
                        resolve({ audioUrl, videoUrl: null, isAudioOnly: true });
                    }
                } catch (err) {
                    reject(err);
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read the file.'));
            };

            reader.readAsArrayBuffer(file);
        });
    }

    // --- Global State ---
    var filename, filesize, filetype, filelastmodifieddate, filepath, playingindex;
    var activeKeydownHandler = null;
    var activeKeyupHandler = null;

    // =========================================================================
    // DEDICATED MPA PLAYER FUNCTION
    // This is the core function, now exclusively handling .mpa files.
    // =========================================================================
    function playVid(originalBlob) {
        // --- Cleanup Previous Player State ---
        if (activeKeydownHandler) {
            document.body.removeEventListener('keydown', activeKeydownHandler);
        }
        if (activeKeyupHandler) {
            document.body.removeEventListener('keyup', activeKeyupHandler);
        }

        // --- Setup DOM Elements ---
        var header = document.getElementsByClassName('header')[0];
        var f1 = document.querySelectorAll('.footerelement')[0];
        var f2 = document.querySelectorAll('.footerelement')[1];
        var f3 = document.querySelectorAll('.footerelement')[2];
        var app = document.getElementById('playerscreen');

        app.innerHTML = '';
        app.style = 'background-color: black;';
        app.innerHTML = `<video id="player" autoplay></video>
                         <audio id="player1" mozaudiochannel="content"></audio>
                         <div id="pp"></div>
                         <div id="details"></div>`;

        var vp = document.querySelector('#player');
        var ap = document.querySelector('#player1');

        // --- Player State Variables ---
        var scale = 1, rotate = 0, fscreen = 'no';
        var volume = navigator.volumeManager;
        filename = baseFileName(originalBlob.name);
        filesize = showSize(originalBlob.size);
        filetype = originalBlob.type;
        filelastmodifieddate = originalBlob.lastModifiedDate;
        filepath = originalBlob.name.replace('sdcard/', 'Internal/').replace('sdcard1/', 'SD Card/');
        playingindex = filenamearray.indexOf(baseFileName(originalBlob.name));
        var ispaused = false, isrepeat = false, isrestored = false;
        var tstime = 0;
        var checkbgplaycommand = 'false';

        header.innerHTML = filename;
        f1.innerHTML = 'Fullscreen';
        f2.innerHTML = 'Pause';
        f3.innerHTML = 'Mute';

        // --- Core MPA Decoding and Playback Logic ---
        decodeMPAFile(originalBlob)
            .then(({ audioUrl, videoUrl, isAudioOnly }) => {
                if (!isAudioOnly) {
                    // CASE 1: MPA file WITH separator (audio + video)
                    header.innerHTML = filename;
                    vp.src = videoUrl;
                    ap.src = audioUrl;
                    vp.muted = true; // Video is muted; sound comes from the audio element.

                    // Sync audio and video playback
                    vp.onplay = () => ap.play();
                    vp.onpause = () => ap.pause();
                    vp.onseeking = () => {
                        if (Math.abs(vp.currentTime - ap.currentTime) > 0.5) {
                            ap.currentTime = vp.currentTime;
                        }
                    };
                } else {
                    // CASE 2: MPA file WITHOUT separator (audio only)
                    header.innerHTML = filename + " (Audio)";
                    // Play audio through the <video> tag to use its visual controls and fullscreen capability
                    vp.src = audioUrl;
                    ap.src = ''; // Ensure the dedicated audio element is not used.
                    vp.muted = false; // Unmute the video element to hear the audio.
                }

                // Resume from last position if available
                var savedTime = localStorage.getItem(filename);
                if (savedTime) {
                    vp.currentTime = parseFloat(savedTime);
                }
                vp.play();
            })
            .catch(err => {
                showToast('Error playing MPA: ' + err.message);
                console.error(err);
            });

        // --- Helper functions and Event Handlers ---
        function addZero(n) { return n < 10 ? '0' + n : n }
        function zoomIn() { scale += 0.1; vp.style.transform = `scale(${scale}) rotate(${rotate}deg)`; }
        function zoomOut() { scale -= 0.1; vp.style.transform = `scale(${scale}) rotate(${rotate}deg)`; }
        function rotateVid(n) { rotate = (rotate + n) % 360; vp.style.transform = `scale(${scale}) rotate(${rotate}deg)`; }
        function defaultScreen() { scale = 1; rotate = 0; vp.style.transform = `scale(${scale}) rotate(${rotate}deg)`; vp.playbackRate = 1; }
        function openFullScreen() { fscreen = 'yes'; app.style = 'top: 0px; bottom:0px;z-index: 50;display: flex;justify-content: center;align-items: center;'; rotate = 90; scale = 1.36; vp.style.transform = `scale(${scale}) rotate(${rotate}deg)`; vp.style.zIndex = 998; document.querySelector('#details').style.display = 'none'; }
        function exitFullScreen() { fscreen = 'no'; app.style = 'top: 25px; bottom:50px; z-index: 0;'; rotate = 0; scale = 1; vp.style.transform = `scale(${scale}) rotate(${rotate}deg)`; document.querySelector('#details').style.display = 'block'; }

        function zero() {
            var e = document.createElement('div');
            e.id = 'zerobar';
            e.style = 'display: flex;position: fixed; top: 0px; left: 0px; width: 100%; height: 100%;background: rgba(0,0,0,0.5); justify-content: center; align-items: center;z-index: 54';
            e.innerHTML = '<div style="background: white; padding: 5px 15px 5px 10px; border-radius: 10px; width: 80%"><a class="zerolist" tabindex="0">Mute</a><a class="zerolist" tabindex="1">Details</a><a class="zerolist" tabindex="2">Settings</a><a class="zerolist" tabindex="3">Hide</a>';
            document.body.appendChild(e);

            if (vp.muted) { document.querySelectorAll('.zerolist')[0].innerHTML = 'Unmute'; } else { document.querySelectorAll('.zerolist')[0].innerHTML = 'Mute'; }

            document.querySelectorAll('.zerolist')[0].addEventListener('click', function () {
                if (vp.muted) { vp.muted = false; showToast('Video Unmuted'); } else { vp.muted = true; showToast('Video Muted'); }
                document.body.removeEventListener('keydown', keydownzero);
                document.body.addEventListener('keydown', keydownmain);
                document.body.addEventListener('keyup', keyupmain);
                document.body.removeChild(document.querySelector('#zerobar'));
            });
            document.querySelectorAll('.zerolist')[1].addEventListener('click', function () { videoDetails(); });
            document.querySelectorAll('.zerolist')[2].addEventListener('click', function () { settings(); });
            document.querySelectorAll('.zerolist')[3].addEventListener('click', function () {
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
            e.innerHTML = `<div style="width: 80%;height:auto; background: white; border-radius: 10px; display: block; padding:10px 5px 5px 7px"><p><b>Name:</b> ${filename}</p><p><b>Size:</b> ${filesize}</p><p><b>Type:</b> ${filetype}</p><p><b>Resolution:</b> ${vp.videoWidth}x${vp.videoHeight}</p><p><b>Last Modified:</b> ${filelastmodifieddate}</p><p><b>Path:</b> ${filepath}</p><br><center><div style="position: relative; padding: 5px; width: auto; display: block; bottom: 0px; left: 0px; background: black; color: white;border-radius:10px">Wait <x id="stc">5</x>s To Close</div></center></div>`;
            var k = setInterval(function () { if (s > 0) { s -= 1; document.getElementById('stc').innerHTML = s; } }, 1000);
            document.body.appendChild(e);
            setTimeout(function () { document.body.removeChild(e); s = 5; clearInterval(k); }, 5000);

            document.body.removeEventListener('keydown', keydownzero);
            document.body.addEventListener('keydown', keydownmain);
            document.body.addEventListener('keyup', keyupmain);
        }

        function settings() {
            // This function remains the same as it controls app-wide settings.
            document.body.removeChild(document.querySelector('#zerobar'));
            var e = document.createElement('div');
            e.id = 'settings';
            e.style = 'display: flex;position: fixed; top: 0px; left: 0px; width: 100%; height: 100%;background: rgba(0,0,0,0.5); justify-content: center; align-items: center;z-index: 55';
            e.innerHTML = '<div style="width: 100%;height:auto; background: white; border-radius: 10px; display: block; padding:10px 5px 5px 7px"><div class="header">Setting</div><div class="content" style="background: white; bottom: 29px;display: block; padding: 20px">Extentions For Scan:<br><input type="text" value="mp4, 3gp, mkv" class="focusable" tabindex="0" id="extentions"><br>Play In Background: <input type="checkbox" id="bgplaybtn" class="focusable" tabindex="1" style="display: inline-block; width: auto;"><br>Auto Scale: <input type="checkbox" id="autoscalebtn" class="focusable" tabindex="2" style="display: inline-block; width: auto;"><br>Lock: <input type="checkbox" id="lockbtn" class="focusable" tabindex="3" style="display: inline-block; width: auto;"><br><input type="text" id="inputpass" disabled="disable" placeholder="pass"><br><button id="resetbtn" class="focusable" tabindex="4">Reset</button></div><div class="footer"><div class="footerelement">Save</div><div class="footerelement">OK</div><div class="footerelement">Back</div></div></div>';
            document.body.appendChild(e);

            var lockbtn = document.querySelector('#lockbtn');
            lockbtn.addEventListener('change', function () {
                if (lockbtn.checked == true) {
                    document.querySelector('#inputpass').removeAttribute('disabled');
                    document.querySelector('#inputpass').setAttribute('class', 'focusable');
                    document.querySelector('#inputpass').setAttribute('tabindex', '4');
                    document.querySelectorAll('#resetbtn')[0].setAttribute('tabindex', '5')
                } else if (lockbtn.checked == false) {
                    document.querySelector('#inputpass').setAttribute('disabled', 'disable');
                    document.querySelector('#inputpass').removeAttribute('class');
                    document.querySelector('#inputpass').removeAttribute('tabindex');
                    document.querySelectorAll('#resetbtn')[0].setAttribute('tabindex', '4');
                }
            });

            var autoscalebtn = document.querySelector('#autoscalebtn');
            autoscalebtn.addEventListener('change', function () {
                if (autoscalebtn.checked == true) {
                    localStorage.setItem('autoscale', 'yes');
                } else {
                    localStorage.removeItem('autoscale');
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

        function keydownmain(e) {
            if (e.key == 'Enter') { if (vp.paused) { vp.play(); f2.innerHTML = 'Pause'; showToast('Playback Resumed'); ispaused = false; } else { vp.pause(); f2.innerHTML = 'Play'; showToast('Playback Paused'); ispaused = true; } }
            if (e.key == 'ArrowLeft') { vp.currentTime -= 10; }
            if (e.key == 'ArrowRight') { vp.currentTime += 10; }
            if (e.key == 'ArrowUp') { volume.requestUp(); }
            if (e.key == 'ArrowDown') { volume.requestDown(); }
            if (e.key == '6') { tstime = new Date().getTime(); }
            if (e.key == '2') { vp.playbackRate = 1; showToast('Playback Speed `' + vp.playbackRate.toFixed(1) + 'x`'); }
            if (e.key == '4') { tstime = new Date().getTime(); }
            if (e.key == '3') { rotateVid(+10); }
            if (e.key == '5') { tstime = new Date().getTime(); }
            if (e.key == '1') { rotateVid(-10); }
            if (e.key == '7') {
                clearInterval(timebar);
                document.body.removeEventListener('keydown', keydownmain);
                document.body.removeEventListener('keyup', keyupmain);
                document.body.addEventListener('keydown', keydownvideolist);
                document.querySelector('#fdet').style.display = 'block';
                ispaused = true;
                ap.pause();
                vp.pause();
                ap.src = '';
                vp.src = '';
                header.innerHTML = 'Videos';
                f1.innerHTML = 'Search';
                f2.innerHTML = 'Open';
                f3.innerHTML = 'Back';
                document.body.removeChild(app);
            }
            // Key '8' for subtitles is removed.
            if (e.key == '9') { tstime = new Date().getTime(); }
            if (e.key == '*') { zoomOut(); showToast('Playback Zoom `' + scale.toFixed(1) + 'x`'); }
            if (e.key == '#' || e.key == '/') { zoomIn(); showToast('Playback Zoom `' + scale.toFixed(1) + 'x`'); }
            if (e.key == '0') { zero(); }
            if (e.key == 'SoftLeft' || e.key == 'F1') { if (fscreen == 'yes') { exitFullScreen(); showToast('Closed FullScreen'); } else { openFullScreen(); } }

            if (e.key == 'SoftRight' || e.key == 'F2') {
                if (ap.muted == true) { ap.muted = false; f3.innerHTML = 'Mute'; } else {
                    ap.muted = true; f3.innerHTML = 'Unmute';
                }
            }
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
            if (e.key == '4') { if ((new Date().getTime() - tstime) < 1000) { vp.playbackRate -= 0.1; showToast('Playback Speed `' + vp.playbackRate.toFixed(1) + 'x`'); } else { vp.currentTime -= 200; } }
            if (e.key == '2') { vp.playbackRate = 1; showToast('Playback Speed `' + vp.playbackRate.toFixed(1) + 'x`'); }
            if (e.key == '6') { if ((new Date().getTime() - tstime) < 1000) { vp.playbackRate += 0.1; showToast('Playback Speed `' + vp.playbackRate.toFixed(1) + 'x`'); } else { vp.currentTime += 200; } }



            if (e.key == '5') {
                if ((new Date().getTime() - tstime) < 1000) {
                    defaultScreen(); showToast('Default Playback');
                } else {
                    isrepeat = !isrepeat; // Toggle repeat status
                    vp.loop = isrepeat;
                    ap.loop = isrepeat;
                    showToast(isrepeat ? 'Repeat Playback On' : 'Repeat Playback Off');
                }
            }



            if (e.key == '9') {
                if ((new Date().getTime() - tstime) < 1000) {
                    var des = window.prompt('Destination (00:00:00)', '00:00:00'); var regexp = /[0-9]\d:[0-9]\d:[0-9]\d/; if (regexp.test(des)) { var h = new Number(des.split(':')[0]); var m = new Number(des.split(':')[1]); var s = new Number(des.split(':')[2]); var cal = (h * 3600) + (m * 60) + s; if (cal < vp.duration) { vp.currentTime = cal; showToast('Video Forwarded To: <b>' + des + '</b>'); } else { showToast('Invalid Destination'); } } else { showToast('Invalid Input Format'); }
                } else { vp.pause(); vp.currentTime = 0; vp.play(); }
            }
        }

        document.body.addEventListener('keydown', keydownmain);
        document.body.addEventListener('keyup', keyupmain);
        activeKeydownHandler = keydownmain;
        activeKeyupHandler = keyupmain;

        // --- Other key handlers (keydownzero, keydownsetting, etc.) remain unchanged ---
        // These are included here for completeness...
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
        function keydownvideolist1(e) {
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
                case 'F2':
                    isrestored = false;
                    app.classList = 'content';
                    vp.style = 'background: black';
                    document.querySelector('#fdet').style.display = 'none';
                    if (issub && subon) { document.querySelectorAll('#subtitle')[0].style = 'display: block;'; } else {
                        document.querySelectorAll('#subtitle')[0].style = 'display: none;';
                    }
                    header.innerHTML = filename;
                    f1.innerHTML = 'Fullscreen';
                    f2.innerHTML = 'Pause';
                    f3.innerHTML = 'Restore';
                    document.body.addEventListener('keydown', keydownmain);
                    document.body.addEventListener('keyup', keyupmain);
                    document.body.removeEventListener('keydown', keydownvideolist1);
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

        var timebar = setInterval(function () {
            if (!document.getElementById('playerscreen')) {
                clearInterval(timebar);
                return;
            }
            var rand = Math.floor(Math.random() * 255) + 100;
            rand = 33;
            if (isrestored === false) {
                document.querySelector('#details').innerHTML = `<table width="100%" style="color: white"><tr><td style="width: 50%;text-align: center">${(addZero(new Date(vp.currentTime * 1000).getUTCHours()) + ':' + addZero(new Date(vp.currentTime * 1000).getMinutes()) + ':' + addZero(new Date(vp.currentTime * 1000).getSeconds()))}/${(addZero(new Date(vp.duration * 1000).getUTCHours()) + ':' + addZero(new Date(vp.duration * 1000).getMinutes()) + ':' + addZero(new Date(vp.duration * 1000).getSeconds()))}</td><td style="width: 50%;text-align: center">${vp.playbackRate.toFixed(1)} X</td></tr></table>`;
            } else { document.querySelector('#details').innerHTML = ''; }


            if (fscreen == 'yes' || isrestored === true) { document.querySelector('#pp').style.display = 'none'; } else { document.querySelector('#pp').style = `width:${((vp.currentTime / vp.duration) * 100)}%;display: block; padding: 1px 0px;background: rgb(${(((vp.currentTime / vp.duration) * 100).toFixed(0) * 2.5).toFixed(0)},${(255 - (((vp.currentTime / vp.duration) * 100).toFixed(0) * 2.5).toFixed(0))},${rand});position:fixed; bottom: 49px; left: 0px;z-index: 5;border-right: 5px groove white;`; }

            if (vp.ended) {
                localStorage.removeItem(filename);
                vp.pause();
                ispaused = true;
                f2.innerHTML = 'Play';
            } else {
                localStorage.setItem(filename, vp.currentTime);
            }

        }, 300);

        checkbgplaycommand = localStorage.getItem('bgplay');
        if (checkbgplaycommand == 'yes') {
            document.addEventListener('visibilitychange', function () {

                if (document.hidden) {
                    if (ispaused === false) {
                        ap.currentTime = localStorage.getItem(filename);
                        ap.play();
                        console.log('app hided');
                        vp.pause();
                        ap.addEventListener('timeupdate', function () {
                            localStorage.setItem(filename, ap.currentTime);
                        });
                    }
                } else {
                    if (ispaused === true) { ap.pause(); vp.pause(); } else {
                        ap.play();
                        vp.currentTime = localStorage.getItem(filename);
                        vp.play();
                        console.log('app showed');
                    }
                }
            });
        }
    }

    // --- Media Orchestration (Simplified for MPA only) ---
    function plaympa(blob) {
        if (!document.querySelector('#playerscreen')) {
            document.body.removeEventListener('keydown', keydownvideolist);
            document.querySelector('#fdet').style.display = 'none';
            var el = document.createElement('div');
            el.id = 'playerscreen';
            el.className = 'content';
            document.body.appendChild(el);
            showToast('Press 7 To File List');
        }
        playVid(blob);
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

    document.addEventListener('DOMContentLoaded', () => {
        getKaiAd({ publisher: '080b82ab-b33a-4763-a498-50f464567e49', app: 's-vid_player', slot: 's-vid_player', onerror: err => console.error('Custom catch:', err), onready: ad => { ad.call('display'); } });
    });

    document.body.addEventListener('click', function () {
        console.info('Width: ' + window.innerWidth + '\nHeight: ' + window.innerHeight);
    });

} catch (e) {
    showToast('<b>error:</b> ' + e.message);
}