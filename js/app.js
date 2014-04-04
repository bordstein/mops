Ember.Handlebars.helper('get_playicon', function(state) {
    if(state == "playing")
        return new Handlebars.SafeString('<span class="glyphicon glyphicon-play"/>');
    else if(state == "paused")
        return new Handlebars.SafeString('<span class="glyphicon glyphicon-pause"/>');
    else
        return "";
});

Mops = Ember.Application.create();

Mops.model = {
    'playing':false,
    "currentTrack": {
        "artist": "",
        "title": ""
    },
    "tracklist": [],
    "playlists": [],
    tlid_links: {},
    latest_tlid: -1
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
    },
    playPause: function() {
        if(Mops.model.playing)
            Mops.mopidy.playback.pause()
        else
            Mops.mopidy.playback.play()
    },
    forward: function() {
        Mops.mopidy.playback.next()
    },
    backward: function() {
        Mops.mopidy.playback.previous()
    }
  }
});

Mops.mopidy = new Mopidy();

Mops.updateTracks = function(){
    Mops.mopidy.playback.getCurrentTrack().then(function(track) {
        Mops.set('model.currentTrack.artist', track.artists[0].name);
        Mops.set('model.currentTrack.title', track.name);
    });
    Mops.mopidy.playlists.getPlaylists().then(function(playlists) {
        playlists.map(function(playlist) {
            Mops.model.playlists.addObject(playlist.name);
        });
    });
    Mops.mopidy.tracklist.getTlTracks().then(function(tracklist) {
        Mops.model.tracklist.clear();
        tracklist.map(function(track) {
          tmp = trackify(track.track);
          Mops.model.tracklist.addObject(tmp);
          Mops.model.tlid_links[track.tlid] = tmp;
        });
        Mops.mopidy.playback.getState().then(function(state) {
          if(state == 'playing')
              Ember.set(Mops.model, 'playing', true);
          else
              Ember.set(Mops.model, 'playing', false);
          Mops.mopidy.playback.getCurrentTlTrack().then(function(track) {
            Mops.model.tlid_links[track.tlid].set("state", state);
          });
        });
    });
};

Mops.mopidy.on("state:online", function() {
  Mops.updateTracks();
});

Mops.mopidy.on("event:playbackStateChanged", function(state) {
    if(state.new_state == 'playing')
        Ember.set(Mops.model, 'playing', true);
    else
        Ember.set(Mops.model, 'playing', false);
})

// Mops.mopidy.on(console.log.bind(console)); 

Mops.mopidy.on("event:trackPlaybackPaused", function(data){
  Mops.model.tlid_links[data.tl_track.tlid].set('state','paused')
});

Mops.mopidy.on("event:trackPlaybackResumed", function(data){
  Mops.model.tlid_links[data.tl_track.tlid].set('state','playing')
});

Mops.mopidy.on("event:trackPlaybackStarted", function(data){
  var latest_tlid = Mops.model.latest_tlid;
  if (latest_tlid != -1 && latest_tlid in Mops.model.tlid_links){
    Mops.model.tlid_links[latest_tlid].set('state','stopped');
  }
  latest_tlid = data.tl_track.tlid;
  Mops.model.latest_tlid = latest_tlid;
  Mops.model.tlid_links[latest_tlid].set('state','playing');
});

Mops.mopidy.on("event:trackPlaybackEnded", function(data){
  Mops.model.tlid_links[data.tl_track.tlid].set('state','stopped');
});

Mops.mopidy.on("event:tracklistChanged", function(){
  Mops.updateTracks();
});
