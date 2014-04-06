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
              "state": '',
              "duration": millisecondsToTime(mopidyTrack.length),
              "album_mbid": mopidyTrack.album.musicbrainz_id
  });
}
