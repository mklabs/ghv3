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
    
    it("should have Gists api", function() {
      expect(Gh.Gist).toBeDefined();
      expect(Gh.Gists).toBeDefined();
    });
    
  });
  
  
  
  
})(this.exports, this);