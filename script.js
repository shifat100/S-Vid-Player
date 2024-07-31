try {
    function playVid(blob) {
        var path = URL.createObjectURL(blob);
        var blobtype = blob.type; if (blobtype == '') { blobtype = 'video/mp4'; blob.type = 'video/mp4'; }
        var header = document.getElementsByClassName('header')[0];
        var f1 = document.querySelectorAll('.footerelement')[0];
        var f2 = document.querySelectorAll('.footerelement')[1];
        var f3 = document.querySelectorAll('.footerelement')[2];
        var app = document.getElementsByClassName('content')[0];
        var scale = 1;
        var rotate = 0;
        var fscreen = 'no';
        var volume = navigator.volumeManager;
        var filename = baseFileName(blob.name);
        var issub = false;
        var subon = true;

        header.innerHTML = baseFileName(blob.name);
        app.style = 'background-color: black;';
        app.innerHTML = `<video id="player" type="${blobtype}" autoplay>
<source id="vidsrc" src="${path}" type="${blobtype}">
</source>
</video><div id="subtitle" style="background: rgba(255,255,255,0.2);padding: 0px;position: fixed;bottom: 50px;width: 100%;left: 0px;color: white; text-align: center;"></div><div id="pp"></div>
<div id="details"></div>`;
        f1.innerHTML = 'Fullscreen';
        f2.innerHTML = 'Pause';
        f3.innerHTML = 'Mute';
        var vp = document.querySelector('#player');
        var subtitleBar = document.getElementById('subtitle');

        if (localStorage.getItem(filename) != null) {
            vp.pause();
            if (window.confirm('Resume Previous Playback ?')) {
                vp.currentTime = localStorage.getItem(filename);
                vp.play();
            } else { vp.currentTime = 0; vp.play(); }
        }



        function addZero(n) { return n < 10 ? '0' + n : n }
        function zoomIn() { scale += 0.1; vp.style = 'transform: scale(' + scale + ') rotate(' + rotate + 'deg);'; }
        function zoomOut() { scale -= 0.1; vp.style = 'transform: scale(' + scale + ') rotate(' + rotate + 'deg);'; }
        function rotateVid(n) { rotate += n; if (rotate > 360) { rotate = 0; } if (rotate < -360) { rotate = 0; } vp.style = 'transform: scale(' + scale + ') rotate(' + rotate + 'deg);'; }
        function defaultScreen() { scale = 1; rotate = 0; vp.style = 'transform: scale(' + scale + ') rotate(' + rotate + 'deg);'; vp.playbackRate = 1; if (subon === true) { subtitleBar.style = 'background: rgba(255,255,255,0.2);padding: 0px;position: fixed;bottom: 20px;width: 100%;left: 0px;color: white; text-align: center;display:block;z-index: 1'; } }
        function openFullScreen() { fscreen = 'yes'; app.style = 'top: 0px; bottom:0px;z-index: 50;display: flex;justify-content: center;align-items: center;'; rotate = 90; scale = 1.36; vp.style = 'transform: scale(' + scale + ') rotate(' + rotate + 'deg);'; document.querySelectorAll('#details')[0].style = 'display: none;'; if (subon === true) { subtitleBar.style = 'background: rgba(255,255,255,0.2);padding: 0px;position: fixed;top: auto;width: 100%;left: -99px;color: white;text-align: center;transform: rotate(90deg);display:block;z-index: 51'; } else { subtitleBar.style = 'display: none'; } }
        function exitFullScreen() { fscreen = 'no'; app.style = 'top: 25px; bottom:50px; z-index: 0;'; rotate = 0; scale = 1; vp.style = 'transform: scale(' + scale + ') rotate(' + rotate + 'deg);'; document.querySelectorAll('#details')[0].style = 'display: block;'; if (subon === true) { subtitleBar.style = 'background: rgba(255,255,255,0.2);padding: 0px;position: fixed;bottom: 55px;width: 100%;left: 0px;color: white; text-align: center;display:block;z-index: 1'; } else { subtitleBar.style = 'display: none'; } }

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
            var request = sdcard.get(blob.name.replace('.mp4', '.vtt').replace('.3gp', '.vtt'));

            request.onsuccess = function () {
                var fileReader = new FileReader();
                fileReader.onload = function () {
                    subon = true;
                    issub = true;
                    var data = fileReader.result;
                    subtitleBar.style = 'background: rgba(255,255,255,0.2);padding: 0px;position: fixed;bottom: 55px;width: 100%;left: 0px;color: white; text-align: center;display:block;z-index: 1';
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
                var request1 = sdcard.get(blob.name.replace('.mp4', '.srt').replace('.3gp', '.srt'));

                request1.onsuccess = function () {
                    var fileReader = new FileReader();
                    fileReader.onload = function () {
                        subon = true;
                        issub = true;
                        var data = fileReader.result;
                        subtitleBar.style = 'background: rgba(255,255,255,0.2);padding: 0px;position: fixed;bottom: 55px;width: 100%;left: 0px;color: white; text-align: center;display:block;z-index: 1';
                        var subtitles = parseVTT(data);
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

        document.body.addEventListener('keydown', keydownmain);

        function keydownmain(e) {
            if (e.key == 'Enter') { if (vp.paused) { vp.play(); f2.innerHTML = 'Pause'; showToast('Playback Resumed'); } else { vp.pause(); f2.innerHTML = 'Play'; showToast('Playback Paused'); } }
            if (e.key == 'ArrowLeft') { vp.currentTime -= 10; }
            if (e.key == 'ArrowRight') { vp.currentTime += 10; }
            if (e.key == 'ArrowUp') { volume.requestUp(); }
            if (e.key == 'ArrowDown') { volume.requestDown(); }
            if (e.key == '1') { vp.playbackRate -= 0.1; showToast('Playback Speed `' + vp.playbackRate.toFixed(1) + 'x`'); }
            if (e.key == '2') { vp.playbackRate = 1; showToast('Playback Speed `' + vp.playbackRate.toFixed(1) + 'x`'); }
            if (e.key == '3') { vp.playbackRate += 0.1; showToast('Playback Speed `' + vp.playbackRate.toFixed(1) + 'x`'); }
            if (e.key == '4') { rotateVid(-10); }
            if (e.key == '5') { defaultScreen(); showToast('Default Playback'); }
            if (e.key == '6') { rotateVid(+10); }
            if (e.key == '7') { window.location.href = 'files.html'; }
            if (e.key == '8') {
                if (issub) {
                    if (subon == true) { subon = false; subtitleBar.style.display = 'none'; showToast('Subtitle Off'); } else {
                        subon = true;
                        if (rotate == 90) { subtitleBar.style = 'background: rgba(255,255,255,0.2);padding: 0px;position: fixed;top: auto;width: 100%;left: -99px;color: white;text-align: center;transform: rotate(90deg);display:block;z-index: 51'; } else { subtitleBar.style = 'background: rgba(255,255,255,0.2);padding: 0px;position: fixed;bottom: 55px;width: 100%;left: 0px;color: white; text-align: center;display:block;z-index: 1'; }
                        showToast('Subtitle On');
                    }
                } else { showToast('No Subtitle Found'); }
            }
            if (e.key == '9') { var des = window.prompt('Destination (00:00:00)', '00:00:00'); var regexp = /[0-9]\d:[0-9]\d:[0-9]\d/; if (regexp.test(des)) { var h = new Number(des.split(':')[0]); var m = new Number(des.split(':')[1]); var s = new Number(des.split(':')[2]); var cal = (h * 60 * 60) + (m * 60) + s; if (cal < vp.duration) { vp.currentTime = cal; showToast('Video Forwarded To: <b>' + des + '</b>'); } else { showToast('Invalid Destination'); } } else { showToast('Invalid Input Format'); } }
            if (e.key == '*') { zoomOut(); showToast('Playback Zoom `' + scale.toFixed(1) + 'x`'); }
            if (e.key == '#' || e.key == '/') { zoomIn(); showToast('Playback Zoom `' + scale.toFixed(1) + 'x`'); }


            if (e.key == '0') {
                var s = 5;
                var e = document.createElement('div');
                e.style = 'display: flex;position: fixed; top: 0px; left: 0px; width: 100%; height: 100%;background: rgba(0,0,0,0.5); justify-content: center; align-items: center;z-index: 5';
                e.innerHTML = '<div style="width: 80%;height:auto; background: white; border-radius: 10px; display: block; padding:10px 5px 5px 7px"><p><b>Name:</b> ' + baseFileName(blob.name) + '</p><p><b>Size:</b> ' + showSize(blob.size) + '</p><p><b>Type:</b> ' + blob.type + '</p><p><b>Resolution:</b> ' + vp.videoWidth + 'x' + vp.videoHeight + '</p><p><b>Last Modified:</b> ' + blob.lastModifiedDate + '</p><p><b>Path:</b> ' + blob.name.replace('sdcard/', 'Internal/').replace('sdcard1/', 'SD Card/') + '</p><br><center><div style="position: relative; padding: 5px; width: auto; display: block; bottom: 0px; left: 0px; background: black; color: white;border-radius:10px">Wait <x id="stc">5</x>s To Close</div></center></div>';
                var k = setInterval(function () { if (s > 0) { s -= 1; document.getElementById('stc').innerHTML = s; } }, 1000);
                document.body.appendChild(e);
                setTimeout(function () { document.body.removeChild(e); s = 5; clearInterval(k); }, 5000);
            }


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
                a.download = baseFileName(blob.name).replace('.mp4', '').replace('.3gp', '') + '_' + new Date().getTime().toString() + '.jpg';
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                document.body.removeChild(canvas);
            }
        }

        setInterval(function () {
            var rand = Math.floor(Math.random() * 255) + 100;
            rand = 33;
            document.querySelector('#details').innerHTML = '<table width="100%" style="color: white"><tr><td style="width: 50%;text-align: center">' + (addZero(new Date(vp.currentTime * 1000).getHours() - 6) + ':' + addZero(new Date(vp.currentTime * 1000).getMinutes()) + ':' + addZero(new Date(vp.currentTime * 1000).getSeconds()) + '/' + addZero(new Date(vp.duration * 1000).getHours() - 6) + ':' + addZero(new Date(vp.duration * 1000).getMinutes()) + ':' + addZero(new Date(vp.duration * 1000).getSeconds()) + '</td><td style="width: 50%;text-align: center">' + vp.playbackRate.toFixed(1)) + ' X</td></tr></table>';
            if (fscreen == 'yes') { document.querySelector('#pp').style = 'display:none'; } else { document.querySelector('#pp').style = 'width:' + ((vp.currentTime / vp.duration) * 100 + '%;display: block; padding: 1px 0px;background: rgb(' + (((vp.currentTime / vp.duration) * 100).toFixed(0) * 2.5).toFixed(0) + ',' + (255 - (((vp.currentTime / vp.duration) * 100).toFixed(0) * 2.5).toFixed(0)) + ',' + rand + ');position:fixed; bottom: 49px; left: 0px;z-index: 5;border-right: 5px groove white;'); }
            if (((vp.currentTime / vp.duration) * 100) == 100) {
                localStorage.removeItem(filename);
                vp.pause();
                f2.innerHTML = 'Play';
            } else {
                localStorage.setItem(filename, vp.currentTime);
            }
        }, 300);
    }


    function machine(blob) {

        document.body.removeEventListener('keydown', keydownvideolist);
        document.querySelector('#fdet').style.display = 'none';
        app.innerHTML = '';
        playVid(blob);
        showToast('Press 7 To File List');
    }


    document.addEventListener('DOMContentLoaded', () => { getKaiAd({ publisher: '080b82ab-b33a-4763-a498-50f464567e49', app: 's-vid_player', slot: 's-vid_player', onerror: err => console.error('Custom catch:', err), onready: ad => { ad.call('display'); } }); });

    document.body.addEventListener('keyup', () => { getKaiAd({ publisher: '080b82ab-b33a-4763-a498-50f464567e49', app: 's-vid_player', slot: 's-vid_player', onerror: err => console.error('Custom catch:', err), onready: ad => { ad.call('display'); } }); });

    document.body.addEventListener('click', function () {
        console.info('Width: ' + window.innerWidth + '\nHeight: ' + window.innerHeight);
    });
} catch (e) {
    showToast('<b>error:</b> ' + e.message);
}