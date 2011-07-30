describe("cdnjs", function() {
  
  it("should be able to get latest sha", function() {
    var done = false;
    cdnjs.sha(function(err, sha) {
      runs(function() {
        expect(err).toBeNull();
        expect(sha).toBeDefined();
      });
      
      done = true;
    });
    
    waitsFor(function() {
      return done;
    }, "github api request timeout", 10000);
  });
  
  it("should be able to get the whole list", function() {
    var done = false;
    cdnjs(function(err, scripts) {
      runs(function() {
        expect(err).toBeNull();
        expect(scripts).toBeDefined();
        expect(scripts.length).toBeTruthy();
        
        scripts.forEach(function(s) {
          expect(s.file).toBeDefined();  
          expect(s.lib).toBeDefined();  
          expect(s.path).toBeDefined();  
          expect(s.version).toBeDefined();  
        });        
      });

      done = true;
    });
    
    waitsFor(function() {
      return done;
    }, "github api request timeout", 10000);
    
  });
  
  it('should be able to has() something', function() {
    cdnjs.has('fancy.lib.unexisting.js', function(err, results) {
      var done = false;
      runs(function() {
        expect(err).toBeTruthy();
        expect(results).toBeFalsy();
        expect(err.message).toBeDefined(); 
      });

      done = true;

      waitsFor(function() {
        return done;
      }, "github api request timeout", 10000);
    });
    
    
    cdnjs.has('backbone.js', function(err, results) {
      var done = false;
      runs(function() {
        expect(err).toBeFalsy();
        expect(results).toEqual(true);
      });

      done = true;

      waitsFor(function() {
        return done;
      }, "github api request timeout", 10000);
    });
  });
  
  it("should cache results based on sha", function() {
    var done = false;
    expect(cdnjs.cache).toBeDefined();
    expect(cdnjs.cache.latest).toBeTruthy();
  });
  
});