
navigator.mozSetMessageHandler('activity', function (activityRequest) {
    var option = activityRequest.source.data;
    var activity_path = option.blob.name;
    playVid(option.blob);
});