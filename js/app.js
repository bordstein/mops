Ember.Handlebars.helper('get_playicon', function(state) {
    console.log(state);
    if(state == "playing")
        return new Handlebars.SafeString('<span class="glyphicon glyphicon-play"/>');
    else if(state == "paused")
        return new Handlebars.SafeString('<span class="glyphicon glyphicon-pause"/>');
    else
        return "";
});

Mops = Ember.Application.create();

Mops.model = {
    "currentTrack": {
        "artist": "",
        "title": ""
    },
    "tracklist": [],
    "playlists": []
}

Mops.Track = Ember.Object.extend({
});

Mops.Router.map(function() {
  this.resource('index', { path: '/' }, function(){
    this.resource('tracklist');
  });
});

Mops.TracklistRoute = Ember.Route.extend({
  model: function(){ return Mops.model },
});

Mops.IndexRoute = Ember.Route.extend({
  model: function(){ return Mops.model },
  beforeModel: function() {
    // redirect / to tracklist route
    this.transitionTo('tracklist');
  }
});

Mops.IndexController = Ember.ObjectController.extend({
  actions: {
    toggleOffcanvas: function() {
        $('.row-offcanvas').toggleClass('active')
    }
  }
});

Mops.mopidy = new Mopidy();

Mops.mopidy.on("state:online", function() {
    Mops.mopidy.playback.getCurrentTrack().then(function(track) {
        Mops.set('model.currentTrack.artist', track.artists[0].name);
        Mops.set('model.currentTrack.title', track.name);
    });
    Mops.mopidy.playlists.getPlaylists().then(function(playlists) {
        playlists.map(function(playlist) {
            Mops.model.playlists.addObject(playlist.name);
        });
    });
    Mops.mopidy.tracklist.getTracks().then(function(tracklist) {
        Mops.tracklist_orig = tracklist;
        tracklist.map(function(track) {
          Mops.model.tracklist.addObject(
            Mops.Track.create({
              "artist": track.artists[0].name,
              "title": track.name,
              "album": track.album.name,
              "state": "-",
              "duration": millisecondsToTime(track.length)
          }));
        });
        Mops.mopidy.playback.getState().then(function(state) {
          Mops.mopidy.playback.getCurrentTlTrack().then(function(track) {
            Mops.model.tracklist[track.tlid].set("state", state);
          });
        });
    });
});
