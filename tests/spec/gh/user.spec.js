describe("Gh.User", function() {
  
  it("should have User API", function() {
    expect(Gh).toBeDefined();
    expect(Gh.User).toBeDefined();
  });

  
  it("should warn and throw when missing or mistyped required options", function() {
    var user = function(attr) {
      attr = attr || {};
      return function() {
        return new Gh.User(attr); 
      };
    };
    expect(user()).toThrow('Missing user');
    expect(user({user: true})).toThrow('user must be a String');
    expect(user({user: 2})).toThrow('user must be a String');
  });
  
  it('should be able to get user info', function() {
    // tree is based on sha need to get latest
    var user = new Gh.User({user: 'mklabs'});
    var done = false;
    
    user.get(function(err, result) {
      runs(function() {
        expect(err).toBeNull();
        expect(result).toBeDefined();
        expect(result.login).toEqual('mklabs');
        expect(result.blog).toEqual('http://blog.mklog.fr');
        expect(result.type).toEqual('User');
      });
        
      done = true;
    });
    
    waitsFor(function() {
      return done;
    }, "github api request timeout", 10000);
        
  });
  
  it('should be able to get followers', function() {
    // tree is based on sha need to get latest
    var user = new Gh.User({user: 'mklabs'});
    var done = false;
    
    user.followers(function(err, result) {
      runs(function() {
        expect(err).toBeNull();
        expect(result).toBeDefined();
        expect(_.isArray(result)).toEqual(true);
        
        _.each(result, function(it) {
          expect(it.url).toBeDefined();
          expect(it.login).toBeDefined();
          expect(it.avatar_url).toBeDefined();
          expect(_.isNumber(it.id)).toEqual(true);
        });
      });
        
      done = true;
    });
    
    waitsFor(function() {
      return done;
    }, "github api request timeout", 10000);
        
  });
  
  it('should be able to get following', function() {
    // tree is based on sha need to get latest
    var user = new Gh.User({user: 'mklabs'});
    var done = false;
    
    user.following(function(err, result) {
      runs(function() {
        expect(err).toBeNull();
        expect(result).toBeDefined();
        expect(_.isArray(result)).toEqual(true);
        
        _.each(result, function(it) {
          expect(it.url).toBeDefined();
          expect(it.login).toBeDefined();
          expect(it.avatar_url).toBeDefined();
          expect(_.isNumber(it.id)).toEqual(true);
        });
      });
        
      done = true;
    });
    
    waitsFor(function() {
      return done;
    }, "github api request timeout", 10000);
        
  });

  
});