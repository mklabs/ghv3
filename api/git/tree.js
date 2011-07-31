// > [http://developer.github.com/v3/git/trees/](http://developer.github.com/v3/git/trees/)
(function(Gh) {
  
  // Gh.Tree
  // -----------------
  
  // List of tree options to be merged as properties.
  var treeOptions = ['user', 'repo', 'sha', 'recursive'];

  // List of required options to be merged as properties.  
  var treeSchema = {user: String, repo: String, ref: String};
  
  // Creating a Gh.Tree creates an new Tree instance.
  Gh.Tree = Gh.Request.extend({
    // **sha**: grab latest sha version
    //    GET /repos/:user/:repo/git/refs/:ref
    sha: function(cb) {
      var self = this;
      return this.request('/repos/:user/:repo/git/refs/:ref', this.options, function(err, data) {
        if(err) { return cb.call(self, err); }
        cb.call(self, null, data.object.sha);
      });
    },

    // **tree**: recursive read of the whole tree
    //
    // *Arguments:*
    //
    // Calls to `.tree` are cached, based on the sha provided.
    tree: function(sha, cb) {
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
          self.request(uri, _.extend({}, this.options, {sha: sha}), callback);
        });
      }

      return this.request(uri, _.extend({}, this.options, {sha: sha}), callback);
    },

    // **validate**: Validate attributes against schema.
    validate: function() {
      var attr = this.options;
      result = _(treeSchema).chain()
        .map(function(type, prop) {
          if(!attr[prop]) {
            throw Error('Missing ' + prop);
          }

          if(attr[prop].constructor !== type) {
            throw Error(prop + ' must be a ' + type.name);
          }       
        }).filter(function(it){ return it; })
        .value();
        
      return result.length ? result : undefined;
    }
  });
  
  
})(this.Gh);