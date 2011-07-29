(function(exports, document, $) {
  
  var tmpl = function tmpl(s,d){return s.replace(/:([a-z]+)/g, function(w,m){return d[m];});},
  uid = 0,
  $ = $ || function qsa(sel, context) { 
    context = context || document;
    return Array.prototype.slice.call(context.querySelectorAll(sel)); 
  },
  api = 'https://api.github.com/',
  
  // ## request
  // Load JSON from a server in a different domain (JSONP)
  //
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
  request = function request(url, params, callback) {
    var jsonpString = 'jsonp' + (++uid),
    script = document.createElement('script'),
    delim = /\?/.test(url) ? '&' : '?',
    head = request.head ? request.head : (request.head = $('head')[0]);
    
    if(!callback) {
      callback = params;
      params = {};
    }
    
    exports[jsonpString] = function(response) {
      var data = response.data,
      meta = response.meta;
      
      if(meta.status !== 200) {
        return callback({error: data.message, status: meta.status});
      }
      
      callback(null, data);
      delete window[jsonpString];
    };
    
    // clean trailing slash url
    url = url.replace(/^\//, '');
    
    params.callback = jsonpString;
    script.src = tmpl(api + url + delim + 'callback=:callback', params);
    head.appendChild(script);
  },
  
  // **cache**: implement caching stategy, based on sha.
  // The cache holder is `cdnjs.cache`
  cache = function cache(fn) {
    return function(sha, cb) {
      if(cdnjs.cache[sha]) { return cb(null, cdnjs.cache[sha]); }
      
      return fn(sha, function(err, results) {
        if(err) { return console.error(err); }
        // update cache holder
        cdnjs.cache[sha] = results;
        
        // update latest sha
        cdnjs.cache.latest = sha;
        return cb(err, results);
      });
    };
  }
  
  request.callbacks = [];
  
  
  exports.request = request;
  exports.$ = $;

  // ## cdnsjs
  //
  // **example:** get the list of cdnjs hosted scripts (http://developer.github.com/v3/git/trees/ & http://developer.github.com/v3/git/refs/)
  // Get the whole tree as recursive array if a sha is provided, otherwise, it gets latest sha before requesting the repo (http://developer.github.com/v3/git/refs/).
  //
  //      GET /repos/:user/:repo/git/trees/:sha
  //      GET /repos/:user/:repo/git/refs/:ref
  //
  // **usage**:
  //      
  //      cdnjs(function(err, data) { if(err) {return console.error(err);} console.log(data);  });
  //
  //      cdnjs(sha, function(err, data) { if(err) {return console.error(err);} console.log(data);  });
  // 
  //      [{
  //        file: "backbone-min.js"
  //        lib: "backbone.js"
  //        path: "ajax/libs/backbone.js/0.3.3/backbone-min.js"
  //        version: "0.3.3"
  //      }, ...]
  //
  //
  var cdnjs = exports.cdnjs = function cdnjs(sha, callback) {

    var cb = function cb(err, data) {
      if(err) { return console.error(err); }
      callback(null, cdnjs.parse(data));
    };

    if(!callback) {
      callback = sha;
      sha = null;
    }

    if(sha) {
      return cdnjs.tree(sha, cb);
    }
    
    if(!sha && cdnjs.cache.latest) {
      return cdnjs.tree(cdnjs.cache.latest, cb);
    }

    cdnjs.sha(function(err, sha) {
      if(err) { return callback(err); }
      cdnjs.tree(sha, cb);
    });
  };
  
  cdnjs.cache = {};

  // **sha**: grab latest sha version
  cdnjs.sha = function sha(cb) {
    return request('/repos/:user/:repo/git/refs/:ref', {
      user: 'cdnjs',
      repo: 'cdnjs',
      ref: 'heads/master'
    }, function(err, data) {
      if(err) { return cb(err); }
      cb(null, data.object.sha);
    });
  };

  // **tree**: recursive read of the whole tree
  //
  // *Arguments:*
  //
  // * sha — required sha version
  // * cb — callback called with error, or null + data on success
  //
  cdnjs.tree = cache(function tree(sha, cb) {
    return request('/repos/:user/:repo/git/trees/:sha?recursive=1', {
      user: 'cdnjs',
      repo: 'cdnjs',
      sha: sha
    }, function(err, data) {
      if(err) { return cb(err); }
      cb(null, data);
    });
  });
  
  
  // **has**: text existence of a given lib
  cdnjs.has = function has(lib, callback) {
    var cb = function cb(err, data) {
      if(err) { return console.error(err); }
      
      var libs = cdnjs.parse(data).filter(function(it) {
        return lib === it.lib;
      });
      
      if(!libs.length) {
        return callback(new Error('no ' + lib + 'matching.'));
      }
       
      callback(null, !!libs);
    };
    
    return cdnjs.sha(function(err, sha) {
      if(err) { return cb(err); }
      cdnjs.tree(sha, cb);
    });
  };

  // **parse**: default may be noop, just returning data. here,
  //  we return an array of object via underscore's filter, pluck, map methods.
  cdnjs.parse = function parse(data) {
    return data.tree
      .filter(function(item){ 
        return item.type == "blob" && /\.js$/.test(item.path);
      })
      .map(function(p) {
        var desc = p.path.match(/ajax\/libs\/([^\/]+)\/([^\/]+)\/(.+)$/);
        
        return {
          path: p.path,
          lib: desc[1],
          version: desc[2],
          file: desc[3]
        };
      });
  };  

})(this, this.document);