(function(Gh) {
  
  // # User API
  //
  // > [http://developer.github.com/v3/users/](http://developer.github.com/v3/users/)
  
  // Gh.User
  // -----------------
  
  // Creating a Gh.User creates a new User instance.
  var User = Gh.User = function User(options) {
    this.cid = _.uniqueId('User');
    this._configure(options || {});
    this.validate();
    this.initialize.apply(this, arguments);
  };
  
  // List of User options to be merged as properties.
  var userOptions = ['user'];

  // List of required options to be merged as properties.  
  var userSchema = {user: String};
  
  _.extend(User.prototype, Gh.Request, EventEmitter2.prototype, {
    
    // **initialize**: is an empty function by default. 
    //Override it with your own initialization logic.
    initialize : function(){},
    
    // **get**: Fetch user info.
    //
    //      GET /users/:user
    get: function(cb) {
      return this.request('/users/:user', this.options, cb);
    },
    
    // **followers**: List a user’s followers.
    //
    //      GET /users/:user/followers
    followers: function(cb) {
      return this.request('/users/:user/followers', this.options, cb);
    },
    
    // **following**: List who a user is following.
    //
    //      GET /users/:user/following
    following: function(cb) {
      return this.request('/users/:user/following', this.options, cb);
    },
    
    // **validate**: Validate attributes against schema.
    validate: function() {
      var attr = this.options;
      _.each(userSchema, function(type, prop) {
        if(!attr[prop]) {
          throw Error('Missing ' + prop);
        }
        
        if(attr[prop].constructor !== type) {
          throw Error(prop + ' must be a ' + type.name);
        }       
      });
      
      return this;
    },
    
    // Performs the initial configuration of a User with a set of options.
    // Keys with special meaning *(user)*, are
    // attached directly to the User.
    _configure : function(options) {
      if (this.options) options = _.extend({}, this.options, options);
      for (var i = 0, l = userOptions.length; i < l; i++) {
        var attr = userOptions[i];
        if (options[attr]) this[attr] = options[attr];
      }
      this.options = options;
    }
  });
  
  // Set up inheritance for the User object.
  User.extend = Gh.extend;
  
  
  
})(this.Gh);