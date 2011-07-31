(function(root) {
  // Initial Setup
  // -------------
  
  // The top-level namespace. Exported for both ComomnJS and the browser.
  var Gh;
  if(typeof exports !== 'undefined') {
    Gh = exports;
  } else {
    Gh = root.Gh = {};
  }

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore')._;
  
  // Require Backbone, if we're on the server, and it's not already present.
  var Backbone = root.Backbone;
  if (!Backbone && (typeof require !== 'undefined')) Backbone = require('backbone');
  
  // template helper, used maily to do string concat
  var tmpl = function tmpl(s,d){return s.replace(/:([a-z]+)/g, function(w,m){return d[m];});};
  
  
  // Gh.Gists
  // --------------
  
  //
  // ### List gists
  // * List a user’s gists: 
  //    * `GET /users/:user/gists`
  // * List the authenticated user’s gists (or public):
  //    * `GET /gists`
  // * List all public gists:
  //    * `GET /gists/public`
  // * List the authenticated user’s starred gists:
  //    * `GET /gists/starred`
  //
  
  // Gist Model.
  //      
  //      new Gh.Gist({user: 'user'});
  var Gist = Gh.Gist = Backbone.Model.extend({
    initialize: function initialize(attr) {
      console.log('Gist.initialize ', this, arguments);
    },
    
    validate: function validate() {
      console.log('validate', this, arguments);
      
      return 'foo';
    },
    
    parse: function(resp, xhr) {
      console.log('parse model', this, arguments);
      return resp;
    }
  });
  
  
  // Gists Collection.
  var Gists = Gh.Gists = Backbone.Collection.extend({
    model: Gist,
    
    url: function url() {
      var page = this.params.get('page') ? '?page=' + this.params.get('page') : '';
      
      if(!this.params.get('user')) {
        // if no user provided, get all public list
        return tmpl('/gists' + page);
      }
      
      return tmpl('/users/:user/gists' + page, {user: this.params.get('user')});
    },
    
    initialize: function initialize(models, options) {
      console.log('Gists.initialize ', this, arguments);
      options = options || {};
      this.params = new Backbone.Model(options);
    },
    
    // ### List gists
    // * List a user’s gists: 
    //    * `GET /users/:user/gists`
    list: function list(callback) {
      
      var wrapper = function(collection, response) {
        var m = response.meta,
        d = response.data;
        console.log(collection, response);        
        if(m.status !== 200) {
          if(callback) return callback.call(collection, new Error(d.message));
          return collection.trigger('list:error', new Error(d.message));
        }
        
        if(callback) return callback.call(collection, null, d);
        return collection.trigger('list:success', null, d);
      };
      
      this.fetch({
        success: wrapper,
        error: wrapper
      });
    },
    
    page: function page(p) {
      if(p) this.params.set({page: p});
      
      this.fetch({
        success: _.bind(console.log, console),
        error: _.bind(console.error, console),
        add: true
      });
    },
    
    parse: function parse(resp, xhr) {
      console.log('parse col', this, arguments);
      return resp.data;
    }
  });

  
  
  // proxy over sync method to prefix request with github api endpoint.
  var sync = Backbone.sync;
  Backbone.sync = function(method, model, options) {
    // Ensure that we have a URL and prefix with github api endpoint.
    if (!options.url) {
      options.url = ('https://api.github.com' + getUrl(model));
    }
    
    options.dataType = 'jsonp';
    return sync.apply(this, arguments);
  };
  
  
  // Helper function to get a URL from a Model or Collection as a property
  // or as a function.
  var getUrl = function(object) {
    if (!(object && object.url)) return null;
    return _.isFunction(object.url) ? object.url() : object.url;
  };
  
  
  
})(this);