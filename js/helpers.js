function millisecondsToTime(milli) {
    var seconds = parseInt((milli / 1000) % 60);
    var minutes = parseInt((milli / (60 * 1000)) % 60);
    if (seconds.toString().length == 1)
        seconds = '0' + seconds;
    return minutes + ":" + seconds;
}

function trackify(mopidyTrack) {
  return Mops.Track.create({
              "artist": mopidyTrack.artists[0].name,
              "title": mopidyTrack.name,
              "album": mopidyTrack.album.name,
              "state": mopidyTrack.state,
              "duration": millisecondsToTime(mopidyTrack.length)
  });
}

function replaceTrackWithState(data, state) {
  var tlid = data.tl_track.tlid;
  var track = trackify(data.tl_track.track);
  track.set("state", state);
  console.log("started>>");
  Mops.model.tracklist.replace(tlid, 1, [track]);
}
