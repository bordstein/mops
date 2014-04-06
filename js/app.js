Ember.Handlebars.helper('get_playicon', function(state) {
    if(state == "playing")
        return new Handlebars.SafeString('<span class="glyphicon glyphicon-play"/>');
    else if(state == "paused")
        return new Handlebars.SafeString('<span class="glyphicon glyphicon-pause"/>');
    else
        return "";
});

Mops = Ember.Application.create();
Mops.debounceContext = {name: 'debounce'};

Mops.model = {
    'playing':false,
    "tracklist": [],
    "playlists": [],
    tlid_links: {},
    latest_tlid: -1,
    currentTrack: null
}

Mops.Track = Ember.Object.extend({
  getActive: function(){
      var state = this.get("state");
      if (state == "playing" || state == "paused"){
        return "active";
      } else {
        return "";
      }
  }.property("state"),
  coverUrl: function(){
      var albumMbid = this.get("album_mbid");
      return "http://coverartarchive.org/release/" + albumMbid + "/front"
  }.property("album_mbid")
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

Mops.updatePlaylists = function(){
    Mops.mopidy.playlists.getPlaylists().then(function(playlists) {
        playlists.map(function(playlist) {
            Mops.model.playlists.addObject(playlist.name);
        });
    });
}

Mops.updateCurrentSongInfo = function(state){
  Mops.mopidy.playback.getCurrentTlTrack().then(function(track) {
    if (track == null){
      Mops.set('model.currentTrack', null);
    } else {
      var currentTrack = Mops.model.tlid_links[track.tlid];
      currentTrack.set("state", state);
      Mops.set('model.currentTrack', currentTrack);
    }
  });
}

Mops.updateTracks = function(){
    Mops.mopidy.tracklist.getTlTracks().then(function(tracklist) {
        Mops.model.tlid_links = {}
        // update items in-place to avoid browser reflow
        // and loosing scroll position
        for (var i=0; i<tracklist.length; i++) { 
          var track = tracklist[i].track;
          var tlid = tracklist[i].tlid;
          var tmp = Mops.trackify(track);
          if (i < Mops.model.tracklist.length){
            var flip = Mops.model.tracklist.objectAt(i);
            flip.set("artist", tmp.artist);
            flip.set("title", tmp.title);
            flip.set("album", tmp.album);
            flip.set("state", tmp.state);
            flip.set("duration", tmp.duration);
            flip.set("album_mbid", tmp.album_mbid);
            Mops.model.tlid_links[tlid] = flip;
          } else {
            Mops.model.tracklist.addObject(tmp);
            Mops.model.tlid_links[tlid] = tmp;
          }
          // clear superfluous items at the end if the new tracklist
          // is shorter than the old one
          if (Mops.model.tracklist.length > tracklist.length){
            Mops.model.tracklist.removeAt(tracklist.length,
              Mops.model.tracklist.length - tracklist.length);
          }
        }
        Mops.mopidy.playback.getState().then(function(state) {
          if(state == 'playing')
              Ember.set(Mops.model, 'playing', true);
          else
              Ember.set(Mops.model, 'playing', false);
          Mops.updateCurrentSongInfo(state);
        });
    });
};

Mops.mopidy.on("state:online", function() {
  Mops.updateTracks();
  Mops.updatePlaylists();
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
  Mops.updateCurrentSongInfo("paused");
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
  Mops.updateCurrentSongInfo("playing");
});

Mops.mopidy.on("event:trackPlaybackEnded", function(data){
  var track = Mops.model.tlid_links[data.tl_track.tlid];
  if (track != undefined){
    track.set('state','stopped');
  }
});

Mops.mopidy.on("event:tracklistChanged", function(){
  Ember.run.debounce(Mops.debounceContext, Mops.updateTracks, 1000);
});
