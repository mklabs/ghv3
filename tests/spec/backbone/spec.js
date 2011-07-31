(function(exports, root) {
  // Initial Setup
  // -------------

  // Require Gh, if we're on the server, and it's not already present.
  var Gh = root.Gh;
  if (!Gh && (typeof require !== 'undefined')) Gh = require('../../../backbone/gh.backbone');
  
  describe("gh api", function() {

    it("should be here", function() {
      expect(Gh).toBeDefined();
    });

    it("should have Gists api", function() {
      expect(Gh.Gist).toBeDefined();
      expect(Gh.Gists).toBeDefined();
    });

  });
  
  describe('Gists', function() {
    
    it("should be able to list public users' gist", function() {
      
      var gists = new Gh.Gists(),
      done = false;
      
      gists.list(function(err, results) {
        runs(function() {
          console.log('r: ', results);
          expect(err).toBeNull();
          expect(results).toBeDefined();
          expect(results.length).toBeTruthy();
        });
        
        done = true;
      });
      
      expect(Gh.Gist).toBeDefined();
      expect(Gh.Gists).toBeDefined();
      
      waitsFor(function() {
        return done;
      }, "github api request timeout", 10000);
      
    });
    
  });
  
  
  
  
})(this.exports, this);