(function(exports, document) {
  
  var tmpl = function tmpl(s,d){return s.replace(/:([a-z]+)/g, function(w,m){return d[m];});},
  uid = 0,
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
    head = request.head ? request.head : (request.head = $('head'));
    
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
    head.append(script);
  };
  
  request.callbacks = [];
  
  
  exports.request = request;

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

    cdnjs.sha(function(err, sha) {
      if(err) { return callback(err); }
      cdnjs.tree(sha, cb);
    });
  };

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
  cdnjs.tree = function tree(sha, cb) {
    return request('/repos/:user/:repo/git/trees/:sha?recursive=1', {
      user: 'cdnjs',
      repo: 'cdnjs',
      sha: sha
    }, function(err, data) {
      if(err) { return cb(err); }
      cb(null, data);
    });
  };

  // **parse**: default may be noop, just returning data. here,
  //  we return an array of object via underscore's filter, pluck, map methods.
  cdnjs.parse = function parse(data) {
    return _(data.tree).chain()
      .filter(function(item){ 
        return item.type == "blob" && /\.js$/.test(item.path);
      })
      .pluck('path')
      .map(function(p) {
        var desc = p.match(/ajax\/libs\/([^\/]+)\/([^\/]+)\/(.+)$/);
        return {
          path: p,
          lib: desc[1],
          version: desc[2],
          file: desc[3]
        };
      })
      .value();
  };  

})(this, this.document);