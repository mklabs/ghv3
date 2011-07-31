// > [http://developer.github.com/v3/users/](http://developer.github.com/v3/users/)
(function(Gh) {
  
  // Gh.Gist
  // -----------------
  // Creating a Gh.Gist creates a new Gist instance.
  Gh.Gist = Gh.Request.extend({
    
    // **list**: List a user's gists.
    // *may move to User api**
    //
    //      GET /users/:user
    list: function(cb) {
      return this.request('/users/:user/gists', this.options, cb);
    },
    
    // **list**: List a user's gists.
    //
    //      GET /users/:user
    get: function(cb) {
      return this.request('/gists/:id', this.options, cb);
    },
    
    // **comments**: List comments on a gist.
    //
    //      GET /gists/:id/comments
    comments: function(cb) {
      return this.request('/gists/:id/comments', this.options, cb);
    },
    
    // **comments**: List comments on a gist.
    //
    //      GET /gists/:id/comments
    comment: function(cb) {
      return this.request('/gists/comments/:commentId', this.options, cb);
    },

    // **validate**: Validate attributes against schema.
    validate: function() {
      var attr = this.options;      
      if(!attr.user && !attr.id && !attr.commentId) {
        return 'Either a user, an id or a commentId prop is required';
      }
      
      if(attr.user && !_.isString(attr.user)) {
        return 'user must be a String';
      }
      
      if(attr.id && !_.isNumber(attr.id)) {
        return 'id must be a Number';
      }
      
      if(attr.commentId && !_.isNumber(attr.commentId)) {
        return 'commentId must be a Number';
      }
      
      return result.length ? result : undefined;
    }
  });
  
})(this.Gh);