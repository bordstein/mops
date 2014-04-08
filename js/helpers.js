Mops.millisecondsToTime = function(milli){
    var seconds = parseInt((milli / 1000) % 60);
    var minutes = parseInt((milli / (60 * 1000)) % 60);
    if (seconds.toString().length == 1)
        seconds = '0' + seconds;
    return minutes + ":" + seconds;
}
