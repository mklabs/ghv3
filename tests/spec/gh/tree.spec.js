describe('Gh.tree', function() {
  
  var t = new Gh.Tree({user: 'mklabs', repo: 'backnode', ref: 'heads/master'}),
  fn = function(err, results) {
    expect(err).toBeNull();
    expect(results).toBeDefined();
    expect(results.sha).toBeDefined();
    expect(results.tree).toBeDefined();
    expect(results.tree.length).toBeTruthy();
    expect(results.url).toBeDefined();
  };
  
  it('should be cached by now', function() {
    var done = false;
    t.tree(function() {
      fn.apply(this, arguments);
      t.tree(fn);
      t.tree(fn);
      t.tree(fn);
      t.tree(fn);
      t.tree(fn);
      
      done = true;
    });
    
    
    waitsFor(function() {
      return done;
    }, "github api request timeout", 10000);
  });
  
  it('should re-request if uri changes', function() {
    var done = false;
    new Gh.Tree({user: 'mklabs', repo: 'backnode', ref: 'foo/bar'})
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
    
    new Gh.Tree({user: 'github', repo: 'developer.github.com', ref: 'heads/master'})
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