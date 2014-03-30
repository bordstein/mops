Mops = Ember.Application.create();

Mops.model = {
    "currentTrack": {
        "artist": "",
        "title": ""
    },
    "tracklist": [],
    "playlists": []
}

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
            Mops.model.tracklist.addObject({
                "artist": track.artists[0].name,
                "title": track.name,
                "album": track.album.name,
                "duration": millisecondsToTime(track.length)
            });
        });
    });
});
