Mops = Ember.Application.create();

Mops.model = {
  "currentTrack": {"artist": "Hans Tester", "title": "Once in a lifetime"},
  "tracklist": [{"track": 1, "artist": "Hans Tester", "title": "Once in a lifetime", "album": "Best of Kasnockn", "duration": "03:20"},
 {"track": 2, "artist": "Hans Tester", "title": "Ooooh baby", "album": "Best of Kasnockn", "duration": "02:50"} ],
  "playlists": [{"name": "Rock'n'Roll"},
    {"name": "Best of 60s"},{"name": "happy, happy"}]
}

Mops.Router.map(function() {
  this.resource('index', { path: '/' });
});

Mops.IndexRoute = Ember.Route.extend({
  model: function(){ return Mops.model }
});
