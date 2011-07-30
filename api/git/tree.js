(function(gh, $) {
  
  var request = gh.request,
  extend = $ && $.extend ? $.extend : function (a,c){for(var b in c)a[b]=c[b];return a;};
  // # Trees API
  //
  // http://developer.github.com/v3/git/trees/

  var Tree = gh.Tree = function Tree(attr, options) {
    this.attr = (attr || {});
    this.validate();
  };
  
  // **sha**: grab latest sha version
  //    GET /repos/:user/:repo/git/refs/:ref
  Tree.prototype.sha = function sha(cb) {
    var self = this;
    request('/repos/:user/:repo/git/refs/:ref', this.attr, function(err, data) {
      if(err) { return cb(err); }
      cb.call(self, null, data.object.sha);
    });
    
    return this;
  };
  
  // **tree**: recursive read of the whole tree
  //
  // *Arguments:*
  //
  // * sha — sha version (optionnal, use latest if not provided)
  // * cb — callback called with error, or null + data on success
  //
  // Calls to `.tree` are cached, based on the sha provided.
  Tree.prototype.tree = function tree(sha, cb) {
    var uri = '/repos/:user/:repo/git/trees/:sha?recursive=1',
    self = this,
    callback = function(err, data) {
      if(err) { return cb.call(self, err); }
      cb.call(self, null, data);
    };
    
    if(!cb) { 
      cb = sha;
      return this.sha(function(err, sha) {
        if(err) { return callback(err); }
        request(uri, extend({sha: sha}, this.attr), callback);
      });
    }
    
    request('/repos/:user/:repo/git/trees/:sha?recursive=1', extend({sha: sha}, this.attr), callback);
    
    return this;
  };
  
  // **validate**: Validate attributes against schema.
  Tree.prototype.validate = function validate() {
    var schema = this.schema,
    attr = this.attr;
    
    for(var prop in schema) {
      if(!attr[prop]) {
        throw Error('Missing ' + prop);
      }
      
      if(attr[prop].constructor !== schema[prop]) {
        throw Error(prop + ' must be a ' + schema[prop].name);
      }
    }
    
    return this;
  };
  
  Tree.prototype.schema = {user: String, repo: String, ref: String};
  
  
  
})(this.gh, (this.jQuery || this.Zepto));