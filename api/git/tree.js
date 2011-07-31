(function(Gh) {
  
  // # Trees API
  //
  // > [http://developer.github.com/v3/git/trees/](http://developer.github.com/v3/git/trees/)
  
  // Gh.Tree
  // -----------------
  
  // Creating a Gh.Tree creates an new Tree instance.
  var Tree = Gh.Tree = function Tree(options) {
    this.cid = _.uniqueId('tree');
    this._configure(options || {});
    this.validate();
    this.initialize.apply(this, arguments);
  };
  
  // List of tree options to be merged as properties.
  var treeOptions = ['user', 'repo', 'sha', 'recursive'];

  // List of required options to be merged as properties.  
  var treeSchema = {user: String, repo: String, ref: String};
  
  _.extend(Tree.prototype, Gh.Request, EventEmitter2.prototype, {
    
    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize : function(){},
    
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
      _.each(treeSchema, function(type, prop) {
        if(!attr[prop]) {
          throw Error('Missing ' + prop);
        }
        
        if(attr[prop].constructor !== type) {
          throw Error(prop + ' must be a ' + type.name);
        }       
      });
      
      return this;
    },
    
    // Performs the initial configuration of a Tree with a set of options.
    // Keys with special meaning *(user, repo, sha)*, are
    // attached directly to the tree.
    _configure : function(options) {
      if (this.options) options = _.extend({}, this.options, options);
      for (var i = 0, l = treeOptions.length; i < l; i++) {
        var attr = treeOptions[i];
        if (options[attr]) this[attr] = options[attr];
      }
      this.options = options;
    }
  });
  
  // Set up inheritance for the tree object.
  Tree.extend = Gh.extend;
  
  
  
})(this.Gh);