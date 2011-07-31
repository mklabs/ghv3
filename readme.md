

Github api v3 library. ideally, it should work in node via http request, and in browsers using jsonp.

Authenticated and full http rest verbs may only be used using the nodejs backend. The provided jsonp interface should stick with read-only and unauthenticated stuff.

## Quick docs

[docco-generated docs](http://mklabs.github.com/ghv3/docs/gh.html)

#### dependencies

The only required dependency is [underscore](http://documentcloud.github.com/underscore/). Used mainly to implement class in a way similar to Backbone, thus enforcing functional programming style and providing a set of utility methods.

    
## callbacks

every api methods takes a callback as last parameter. This try to follow the node convention:

    function(err, values...){
      if(err) { return console.error(err); }
            do something
    }
    
## cache

the exposed variable `gh` defined the raw request method, which api components must use to interact with the api. A simple in-memory caching strategy based on requested uri (may be soon slightly reworked to work with adapters or something, so that other caching strategy may be implemented).

Basically, an api access should be done just once, any other subsequent calls gets result from the built-in cache.

The `gh.request` method is wrapped by the `gh.cache` method.

## tests

Run the [tests](http://mklabs.github.com/ghv3/tests/gh.html).

## todo



## changelog

* v.0.0.1:
  * raw request method
  * caching request output
  * starting point of tree api
  * tests