describe('gh.tree', function() {
  
  var t = new gh.Tree({user: 'mklabs', repo: 'backnode', ref: 'heads/master'}),
  fn = function(err, results) {
    expect(err).toBeNull();
    expect(results).toBeDefined();
    expect(results.sha).toBeDefined();
    expect(results.tree).toBeDefined();
    expect(results.tree.length).toBeTruthy();
    expect(results.url).toBeDefined();
  };
  
  it('should be cached by now', function() {
    t.tree(fn);
    t.tree(fn);
    t.tree(fn);
    t.tree(fn);
    t.tree(fn);
  });
  
  it('should re-request if uri changes', function() {
    var done = false;
    new gh.Tree({user: 'mklabs', repo: 'backnode', ref: 'foo/bar'})
      .tree(function(err, results) {
        runs(function(){
          expect(err).toBeTruthy();
          done = false;
        });
        done = true;
      });
      
    waitsFor(function() {
      return done;
    }, "github api request timeout", 10000);
    
    new gh.Tree({user: 'github', repo: 'developer.github.com', ref: 'heads/master'})
      .tree(function(err, results) {
        runs(function(){
          fn(err, results);
        });
        done = true;
      });
    
    waitsFor(function() {
      return done;
    }, "github api request timeout", 10000);
    
  });
});