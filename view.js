if (localStorage.getItem("islocked") == "yes") {
    var pass = prompt("Enter PassWord: ");
    var spass = localStorage.getItem("lockedpass");
    if (pass == spass) {
        navigator.mozSetMessageHandler("activity", function (activityRequest) {
            var option = activityRequest.source.data;
            var activity_path = option.blob.name;
            playVid(option.blob);
        });
    } else {
        document.body.innerHTML = "Wrong Access. Hold End Key To Exit.";
    }
} else {
    navigator.mozSetMessageHandler("activity", function (activityRequest) {
        var option = activityRequest.source.data;
        var activity_path = option.blob.name;
        playVid(option.blob);
    });
}

