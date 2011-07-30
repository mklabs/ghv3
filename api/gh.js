(function(exports, document, $) {
  
  var tmpl = function tmpl(s,d){return s.replace(/:([a-z]+)/g, function(w,m){return d[m];});},
  uid = 0,
  api = 'https://api.github.com/',
  _cache = {},
  
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
    console.log('Request > ', url, params);
    var jsonpString = 'jsonp' + (++uid),
    script = document.createElement('script'),
    delim = /\?/.test(url) ? '&' : '?',
    head = request.head ? request.head : (request.head = $('head')[0]);
    
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
  // The cache holder is `_cache`
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
  };
  
  /* * /
  cache = function cache(fn, context) {
    return function(sha, cb) {
      if(_cache[sha]) { return cb(null, _cache[sha]); }
      context = context || {};
      return fn.call(context, sha, function(err, results) {
        if(err) { return console.error(err); }
        // update cache holder
        _cache[sha] = results;
        
        // update latest sha
        cdnjs.cache.latest = sha;
        return cb(err, results);
      });
    };
  };
  
  /* */
  
  // use jquery/zepto, or fall back to custom based on `querySelectorAll`
  $ = $ || function qsa(sel, context) { 
    context = context || document;
    return Array.prototype.slice.call(context.querySelectorAll(sel)); 
  };
  
  // exports request as `gh.request`. parts of the api should augment this.
  // methods based on sha should be wrapped by `gh.cache()`
  exports.gh = {
    request: cache(request),
    cache: _cache
  };

})( (this.exports || this), this.document, (this.jQuery || this.Zepto) );