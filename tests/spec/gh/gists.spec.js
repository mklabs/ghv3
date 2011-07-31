describe("Gh.Gist", function() {
  
  var gist = new Gh.Gist({id: 1}),
  assertUser = function(user) {
    expect(user).toBeDefined();
    expect(user.login).toBeDefined();
    expect(user.avatar_url).toBeDefined();
    expect(user.url).toBeDefined();
    expect(_.isNumber(user.id)).toEqual(true);
  };
  
  it("should have Gists API", function() {
    expect(Gh).toBeDefined();
    expect(Gh.Gist).toBeDefined();
  });

  
  it("should warn and throw when missing or mistyped required options", function() {
    var gist = function(attr) {
      attr = attr || {};
      return function() {
        return new Gh.Gist(attr); 
      };
    };
    expect(gist()).toThrow('Either a user, an id or a commentId prop is required');
    expect(gist({user: true})).toThrow('user must be a String');
    expect(gist({user: 2})).toThrow('user must be a String');
    
    expect(gist({id: '2'})).toThrow('id must be a Number');
    expect(gist({id: true})).toThrow('id must be a Number');
    
    expect(gist({commentId: '2'})).toThrow('commentId must be a Number');
    expect(gist({commentId: true})).toThrow('commentId must be a Number');
  });
  
  it('should be able to list a user public gists', function() {
    // tree is based on sha need to get latest
    var gist = new Gh.Gist({user: 'mklabs'});
    var done = false;
    
    gist.list(function(err, result) {
      runs(function() {
        expect(err).toBeNull();
        expect(result).toBeDefined();
        expect(_.isArray(result)).toEqual(true);
        
        _.each(result, function(it) {

          expect(it.url).toBeDefined();
          expect(it.description).toBeDefined();
          expect(_.isBoolean(it.public)).toEqual(true);
          
          assertUser(it.user);
                    
          expect(it.files).toBeDefined();
          
          _(it.files).each(function(file) {
            expect(file.filename).toBeDefined();
            expect(file.raw_url).toBeDefined();
            expect(_.isNumber(file.size)).toEqual(true);
          });
          
          expect(_.isNumber(it.comments)).toEqual(true);
          expect(it.html_url).toBeDefined();
          expect(it.git_pull_url).toBeDefined();
          expect(it.git_push_url).toBeDefined();
          expect(it.created_at).toBeDefined();
        });
      });
        
      done = true;
    });
    
    waitsFor(function() {
      return done;
    }, "github api request timeout", 10000);
        
  });
  
  it('should be able to get a single gists', function() {
    // tree is based on sha need to get latest
    var done = false;
    
    gist.get(function(err, result) {
      runs(function() {
        expect(err).toBeNull();
        expect(result).toBeDefined();

        expect(result.url).toBeDefined();
        expect(result.description).toBeDefined();
        expect(_.isBoolean(result.public)).toEqual(true);
        
        assertUser(result.user);
        
        expect(result.files).toBeDefined();

        _(result.files).each(function(file) {
          expect(file.filename).toBeDefined();
          expect(file.raw_url).toBeDefined();
          expect(_.isNumber(file.size)).toEqual(true);
        });
        
        expect(_.isNumber(result.comments)).toEqual(true);
        expect(result.html_url).toBeDefined();
        expect(result.git_pull_url).toBeDefined();
        expect(result.git_push_url).toBeDefined();
        expect(result.created_at).toBeDefined();
        
        expect(_.isArray(result.forks)).toEqual(true);
        
        _.each(result.forks, function(fork) {
          expect(fork.url).toBeDefined();
          expect(fork.created_at).toBeDefined();
          assertUser(fork.user);
        });
      });
        
      done = true;
    });
    
    waitsFor(function() {
      return done;
    }, "github api request timeout", 10000);
        
  });
  
  it('should be able to list gists comments', function(){
    var done = false;
    
    gist.comments(function(err, result) {
      runs(function() {
        expect(err).toBeNull();
        expect(result).toBeDefined();
        
        _.each(result, function(comment) {
          expect(comment.url).toBeDefined();
          expect(comment.body).toBeDefined();
          expect(comment.id).toBeDefined();
          expect(comment.updated_at).toBeDefined();
          expect(comment.created_at).toBeDefined();
          assertUser(comment.user);
        });
      });
      
      done = true;
    });
    
    waitsFor(function() {
      return done;
    }, "github api request timeout", 10000);

  });
  
  it('should be able to get a single gist comment', function(){
    gist.comments(function(err, comments) {
      _.each(comments, function(comment) {
        var done = false;
        new Gh.Gist({commentId: comment.id}).comment(function(err, result) {
          runs(function() {
            expect(err).toBeNull();
            expect(result).toBeDefined();
            
            expect(result.url).toBeDefined();
            expect(result.body).toBeDefined();
            expect(result.id).toBeDefined();
            expect(result.updated_at).toBeDefined();
            expect(result.created_at).toBeDefined();
            assertUser(result.user);  
          });
          
          done = true;
        });
        
        waitsFor(function() {
          return done;
        }, "github api request timeout", 10000);
      });
    });
  });
  
});