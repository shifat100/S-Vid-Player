if (localStorage.getItem("islocked") == "yes") {
    var pass = prompt("Enter PassWord: ");
    var spass = localStorage.getItem("lockedpass");
    if (pass == spass) {
        navigator.mozSetMessageHandler("activity", function (activityRequest) {
            var option = activityRequest.source.data;
            playVid(option.blobs[0]);
        });
    } else {
        document.body.innerHTML = "Wrong Access. Hold End Key To Exit.";
    }
} else {
    navigator.mozSetMessageHandler("activity", function (activityRequest) {
        var option = activityRequest.source.data;
        playVid(option.blobs[0]);
    });
}

