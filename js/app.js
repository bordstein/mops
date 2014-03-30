Mops = Ember.Application.create();

Mops.model = {
  "currentTrack": {"artist": "Hans Tester"}
}

Mops.Router.map(function() {
  this.resource('index', { path: '/' });
});

Mops.IndexRoute = Ember.Route.extend({
  model: function(){ return Mops.model }
});
