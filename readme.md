

Github api v3 library. ideally, it should work in node via http request, and in browsers using jsonp.

**basice idea**: A backbone set of Model and Collections mapping the github api v3.

* Gists
* Users
* Issues
* Orgs
* Repos

just the pubic rest calls for now

## Quick docs

[docco-generated docs](http://mklabs.github.com/ghv3/docs/gh.html)

    
## callbacks

every api methods takes a callback as last parameter. This try to follow the node convention:

    function(err, values...){
      if(err) { return console.error(err); }
            do something
    }
    
## cache

the exposed variable `gh` defined the raw request methods, that api components use to interact with the api. A simple in-memory caching strategy based on requested uri.

Basically, an api access should be done just once, any other subsequent calls gets result from the built-in cache.

The `gh.request` method is wrapped by the `gh.cache` method.

## tests

Run the [tests](http://mklabs.github.com/ghv3/tests/gh.html).