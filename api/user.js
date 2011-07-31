// > [http://developer.github.com/v3/users/](http://developer.github.com/v3/users/)
(function(Gh) {
  
  // Gh.User
  // -----------------
  
  // List of User options to be merged as properties.
  var userOptions = ['user'];

  // List of required options to be merged as properties.  
  var userSchema = {user: String};
  
  // Creating a Gh.User creates a new User instance.
  Gh.User = Gh.Request.extend({
    
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
      var attr = this.options,
      result = _(userSchema).chain()
        .map(function(type, prop) {
          if(!attr[prop]) {
            return 'Missing ' + prop;
          }
        
          if(attr[prop].constructor !== type) {
            return prop + ' must be a ' + type.name;
          }       
        })
        .filter(function(r) {
          return r;
        }).value();
      
      return result.length ? result : undefined;
    }
  });
  
})(this.Gh);