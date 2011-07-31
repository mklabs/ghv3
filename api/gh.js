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
  
  // Require nothing, if we're on the server, assume either Prototype, jQuery or Zepto if already present.
  // The $ local variable is the delegated selector engine, mainly used to select head and scripts to
  // ouptut jsonp request.
  var $ = root.$$ || root.$;
  if (!$ && (typeof require === 'undefined')) {
    // use jquery/zepto, or fall back to custom based on `querySelectorAll` if it's not already present.
    $ = $ || function qsa(sel, context) { 
      context = context || document;
      return Array.prototype.slice.call(context.querySelectorAll(sel)); 
    };
  }
  
  // TODO: deal with node for jsonp/httprequest adapater.
  
  // The uid for our jsonp callbacks
  var uid = 0,
  
  // GitHub API v3 endpoint
  api = 'https://api.github.com/',
  
  // template helper, used maily to do string concat
  tmpl = function tmpl(s, d) {
    return s.replace(/:([a-z]+)/g, function(w, m) {
      if(!d[m]) throw Error('Missing ' + m + ' property > ' + s);
      return d[m];
    });
  },
  
  // The in-memory cache holder
  _cache = {},
  
  // **cache**: implement caching stategy, based on sha. Designed to wrap calls to request.
  cache = function cache(fn) {
    return function(url, params, callback) {
      var ckey;
      
      // clean trailing slash url
      url = url.replace(/^\//, '');
      ckey = tmpl(url, params);
      
      console.log('ckey: ', ckey);
      
      // prehandle arguments for the request method
      if(!callback) {
        callback = params;
        params = {};
      }
      
      
      if(_cache[ckey]) { return callback(null, _cache[ckey]); }
      
      return fn(url, params, function(err, results) {
        if(err) { return callback(err); }
        // update cache holder
        _cache[ckey] = results;
        
        // update latest sha
        _cache.latest = ckey;
        return callback(err, results);
      });
    };
  },
  
  // reference to head element, so that we not query the dom on each request.
  _head;
  
  // Gh.request
  // -----------------

  // A module that can be mixed in to *any object* in order to provide it with
  // request and caching ability. You may `request` a github uri endpoint.
  //
  // TODO: provide EventEmitter interface and response/error custom event.
  //
  //      var object = {};
  //      _.extend(object, Gh.Request);
  //      object.request('/users/:user', {user: 'username'}, callback);
  //      object.request('/users/:user', {user: 'username'})
  //        .on('response', _.bind(console.log, console))
  //        .on('error', _.bind(console.log, console))
  //
  Gh.request = {
    
    // **request**: Load JSON from a server in a different domain (JSONP).
    // *Arguments:*
    //
    // * url — with placeholder in the form of :placeholder
    // * params — hash of parameters value, the property name is used to match placeholder to replace url with proper value.
    // * callback - gets called with an error object (null if success) and data. 
    //
    // *Example:*
    //
    //     request('/repos/:user/:repo/git/trees/:sha?recursive=1')
    //
    request: cache(function(url, params, callback) {
      console.log('Request > ', url, params);
      var jsonpString = 'jsonp' + (++uid),
      script = document.createElement('script'),
      delim = /\?/.test(url) ? '&' : '?',
      head = _head ? _head : (_head = $('head')[0]);

      root[jsonpString] = function(response) {
        var data = response.data,
        meta = response.meta;

        if(meta.status !== 200) {
          return callback({error: data.message, status: meta.status});
        }

        callback(null, data);
        delete window[jsonpString];
      };
      
      url = url.replace(/^\//, '');

      params.callback = jsonpString;
      script.src = tmpl(api + url + delim + 'callback=:callback', params);
      head.appendChild(script);
    }),

    // **cache**: expose built-in request cache.
    cache : _cache
  };
  
  
  // Gh.Request
  // -----------------
  
  // Provides a standard request class for our sets of api components, which should extend
  // the request class to gain `request`-ing and `emit`-ing abilities.
  Gh.Request = function(options) {
    options = options || {};
    this.cid = _.uniqueId('request');
    this._configure(options);
    if(this.validate) this._performValidation(options);
    this.initialize.apply(this, arguments);
  };
  
  _.extend(Gh.Request.prototype, EventEmitter2.prototype, Gh.request, {
    
    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize : function(){},
    
    // Run validation against a set of incoming attributes, returning `true`
    // if all is well. If a specific `error` callback has been passed,
    // call that instead of firing the general `"error"` event.
    _performValidation: function(attrs) {
      var error = this.validate(attrs);
      if (error) {
        if(!this.emit('error', this, error)) {
          // if there is no registered handler for the error event, just throw
          throw (error instanceof Error ? error : new Error(error));
        }
        return false;
      }
      return true;
    },
    
    // Performs the initial configuration of a Request object with a set of options.
    // Keys with special meaning *(user, repo, sha)*, are
    // attached directly to the tree.
    _configure : function(options, props) {
      if (this.options) options = _.extend({}, this.options, options);
      props = props || [];
      for (var i = 0, l = props.length; i < l; i++) {
        var attr = props[i];
        if (options[attr]) this[attr] = options[attr];
      }
      this.options = options;
    }
  });
  
  
  // Helpers
  // -------
  // borrowed by the way of backbone

  // The self-propagating extend function that Backbone classes use.
  Gh.extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  };

  // Shared empty constructor function to aid in prototype-chain creation.
  var ctor = function(){};

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var inherits = function(parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call `super()`.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ 
        return parent.apply(this, arguments); 
      };
    }

    // Inherit class (static) properties from parent.
    _.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Add static properties to the constructor function, if supplied.
    if (staticProps) _.extend(child, staticProps);

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
  };
  
  // Set up inheritance for the Request object.
  Gh.Request.extend = Gh.extend;
  
  

})(this);