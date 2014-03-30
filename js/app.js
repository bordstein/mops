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
  this.resource('index', { path: '/' });
});

Mops.IndexRoute = Ember.Route.extend({
  model: function(){ return Mops.model },
  
});

Mops.IndexController = Ember.ObjectController.extend({
  actions: {
    toggleOffcanvas: function() {
        $('.row-offcanvas').toggleClass('active')
    }
  }
});
