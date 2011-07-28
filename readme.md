
aims to provide a way to list and aggregate cdnjs script/version through the use of github api v3.

## scenario

    cdnjs.list(function(err, data){});
    cdnjs.has('library', '0.0.1', function(err, bool){});
    cdnjs.has('library', function(err, bool){});
    cdnjs.get('library', '0.0.1', function(err, script){});
    cdnjs.get('library', function(err, script){});
    
    // chaining should be possible too
    cdnjs
      .list(function(err, data){})
      .has('library', '0.0.1', function(err, bool){})
      .get('library', '0.0.1', function(err, script){})
    
    // another way
    cdnjs('library')
      .list() // may return list of available version
      .get('0.0.1', function(err, script){}) // version optional, if ommited get latest
      
    
## callbacks

every api methods takes a callback as last parameter. This try to follow the node convention:

    function(err, values...){
      if(err) { return console.error(err); }
      // do something
    }
    
    
## use case

and main reason behind this repo. I very often use cdnjs script + google cdn's using this snippet from h5bp:

    <!-- Grab Google CDN's jQuery, with a protocol relative URL; fall back to local if offline -->
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
    <script>window.jQuery || document.write('<script src="js/libs/jquery-1.6.2.min.js"><\/script>')</script>
    
Each time I happen to need another lib, most likely hosted on cdnjs, I'll always do the same few steps:
    * check cdnjs.com for needed lib
    * copy the cdnjs url for this lib
    * get a local copy to fall back if offline
    * append the new `<script />` tags, both for cdnjs and the local version.

Using backbone
 
    <script src="//cdnjs.cloudflare.com/ajax/libs/backbone.js/0.5.1/backbone-min.js"></script>
    <script>window.Backbone || document.write('<script src="js/libs/backbone-min.js"><\/script>')</script>

Idea is to automate this process:
    * include a list of scripts coming from cdns, namely google + cdnsjs and use it with a custom builder like initializr. or initializr itsefl if johnatan is open to do so.
    * may write a little node cli tool to
      * list available scripts
      * grab a local copy + append of new `<script />` tags in an html file, or a set of files.
      

## workflow

**Get the last sha**

    curl -i https://api.github.com/repos/cdnjs/cdnjs/git/refs/heads/master

    {
      "url": "https://api.github.com/repos/cdnjs/cdnjs/git/refs/heads/master",
      "ref": "refs/heads/master",
      "object": {
        "url": "https://api.github.com/repos/cdnjs/cdnjs/git/commits/8f33c6e5730093ec22ca8b41c44043464b1990f4",
        "type": "commit",
        "sha": "8f33c6e5730093ec22ca8b41c44043464b1990f4"
      }
    }
    
**Get the whole tree**

    curl -i https://api.github.com/repos/cdnjs/cdnjs/git/trees/8f33c6e5730093ec22ca8b41c44043464b1990f4?recursive=1
    
    {
      "url": "https://api.github.com/repos/cdnjs/cdnjs/git/trees/8f33c6e5730093ec22ca8b41c44043464b1990f4",
      "sha": "8f33c6e5730093ec22ca8b41c44043464b1990f4",
      "tree": [
        {
          "url": "https://api.github.com/repos/cdnjs/cdnjs/git/blobs/1377554ebea6f98a2c748183bc5a96852af12ac2",
          "sha": "1377554ebea6f98a2c748183bc5a96852af12ac2",
          "type": "blob",
          "size": 6,
          "path": ".gitignore",
          "mode": "100644"
        },
        {
          "url": "https://api.github.com/repos/cdnjs/cdnjs/git/blobs/d166ddb161b997b4a41ac5e66d5b083b51b0e60b",
          "sha": "d166ddb161b997b4a41ac5e66d5b083b51b0e60b",
          "type": "blob",
          "size": 306,
          "path": "README.md",
          "mode": "100644"
        },
        {
          "url": "https://api.github.com/repos/cdnjs/cdnjs/git/trees/498cbe82c02c972649e7e88425d49c4b55bcd3eb",
          "sha": "498cbe82c02c972649e7e88425d49c4b55bcd3eb",
          "type": "tree",
          "path": "ajax",
          "mode": "040000"
        },
        {
          "url": "https://api.github.com/repos/cdnjs/cdnjs/git/trees/edbf814fc8964a84a4ae9975cab7df2bbd2e4316",
          "sha": "edbf814fc8964a84a4ae9975cab7df2bbd2e4316",
          "type": "tree",
          "path": "ajax/libs",
          "mode": "040000"
        },
        {
          "url": "https://api.github.com/repos/cdnjs/cdnjs/git/trees/09d1cf2a3d9df85bae6cbdef14d470fcc2c20961",
          "sha": "09d1cf2a3d9df85bae6cbdef14d470fcc2c20961",
          "type": "tree",
          "path": "ajax/libs/backbone.js",
          "mode": "040000"
        },
        {
          "url": "https://api.github.com/repos/cdnjs/cdnjs/git/trees/5d4ccaac25cc29961dc2fc4575f957a05bf080d7",
          "sha": "5d4ccaac25cc29961dc2fc4575f957a05bf080d7",
          "type": "tree",
          "path": "ajax/libs/backbone.js/0.3.3",
          "mode": "040000"
        },
        {
          "url": "https://api.github.com/repos/cdnjs/cdnjs/git/blobs/161b401e4076da4c020482aba5734f32cd9eb9eb",
          "sha": "161b401e4076da4c020482aba5734f32cd9eb9eb",
          "type": "blob",
          "size": 11550,
          "path": "ajax/libs/backbone.js/0.3.3/backbone-min.js",
          "mode": "100644"
        },
        {
          "url": "https://api.github.com/repos/cdnjs/cdnjs/git/trees/359c889d21a08de851ca293e7cf3ad147a3e0dcc",
          "sha": "359c889d21a08de851ca293e7cf3ad147a3e0dcc",
          "type": "tree",
          "path": "ajax/libs/backbone.js/0.5.0",
          "mode": "040000"
        },
        {
          "url": "https://api.github.com/repos/cdnjs/cdnjs/git/blobs/99bdc29056b99f693bd3cf41b5252864730cb299",
          "sha": "99bdc29056b99f693bd3cf41b5252864730cb299",
          "type": "blob",
          "size": 13945,
          "path": "ajax/libs/backbone.js/0.5.0/backbone-min.js",
          "mode": "100644"
        },
        {
          "url": "https://api.github.com/repos/cdnjs/cdnjs/git/trees/dbf9b0c91b5bde71768e1dcc0b9f738c74ba171b",
          "sha": "dbf9b0c91b5bde71768e1dcc0b9f738c74ba171b",
          "type": "tree",
          "path": "ajax/libs/backbone.js/0.5.1",
          "mode": "040000"
        },

Filter out the result