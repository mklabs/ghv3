describe("gh", function() {
  
  it("should have cache and request defined", function() {
    expect(gh.cache).toBeDefined();
    expect(gh.request).toBeDefined();
  });
  
  it("should have Tree api", function() {
    expect(gh.Tree).toBeDefined();
  });
  
  it("should warn and throw when missing required options", function() {
    var tree = function(attr) {
      attr = attr || {};
      return function() {
        return new gh.Tree(attr); 
      };
    };
    expect(tree()).toThrow('Missing user');
    expect(tree({user: 'mklabs'})).toThrow('Missing repo');
    expect(tree({user: 'mklabs', repo: 'backnode'})).toThrow('Missing ref');
    expect(tree({user: 'mklabs', repo: true})).toThrow('repo must be a String');
  });
  
  it('should be able to request trees', function() {
    // tree is based on sha need to get latest
    var tree = new gh.Tree({user: 'mklabs', repo: 'backnode', ref: 'heads/master'});
    var done = false;
    tree.sha(function(err, sha) {
      runs(function() {
        expect(err).toBeNull();
        expect(sha).toBeDefined();
      });
      
      tree.tree(sha, function(err, results) {
        runs(function() {
          expect(err).toBeNull();
          expect(results).toBeDefined();
          expect(results.sha).toBeDefined();
          expect(results.tree).toBeDefined();
          expect(results.tree.length).toBeTruthy();
          expect(results.url).toBeDefined();
        });
        
        done = true;
      });
    });
    
    
    waitsFor(function() {
      return done;
    }, "github api request timeout", 10000);
        
  });

  
});