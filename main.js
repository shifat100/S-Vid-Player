document.body.addEventListener('keydown', keydownpick);

function keydownpick(e) {
    if (e.key == 'Enter') { window.location.href = 'files.html'; }
}

if (localStorage.getItem('opened_page') == 'videos') {
    window.location.href = 'files.html';
}