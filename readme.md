

Github api v3 library. ideally, it should work in node via http request, and in browsers using jsonp.

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

## quick api overview

Head over to [http://developer.github.com/v3/](http://developer.github.com/v3/) and check the uri endpoint that you'd like to test.

Most likely any `GET` request is supported.

##### Gh.request

** show user info**:

[http://developer.github.com/v3/users/](http://developer.github.com/v3/users/)

    gh.request('/users/:user', {user: 'mklabs'}, console.log.bind(console));
    gh.request('/users/:user', {user: 'github'}, console.log.bind(console));
    gh.request('/users/:user', {user: 'somefancynamethatdoesnotexists'}, console.log.bind(console));
    
** show repo info**:

[http://developer.github.com/v3/repos/](http://developer.github.com/v3/repos/)

    gh.request('/repos/:user/:repo', {user: 'loicdescotte', repo: 'coffeeblog'}, console.log.bind(console));
    
**List public repositories for the specified user**:

    gh.request('/users/:user/repos', {user: 'mklabs'}, console.log.bind(console));
    
**List public repositories for the specified user**:

    gh.request('/orgs/:org/repos', {org: 'github'}, console.log.bind(console));
    
**Get a Tree**:

[http://developer.github.com/v3/git/trees/](http://developer.github.com/v3/git/trees/)

    gh.request('/repos/:user/:repo/git/trees/:sha', {
      user: 'github', 
      repo: 'developer.github.com',
      sha: 'ddec68feb7486edb94be5e102f433cf25ccd7390'
    }, console.log.bind(console));

**Get a Tree Recursively**:
    
    gh.request('/repos/:user/:repo/git/trees/:sha?recursive=1', {
      user: 'github', 
      repo: 'developer.github.com',
      sha: 'ddec68feb7486edb94be5e102f433cf25ccd7390'
    }, console.log.bind(console));
    
## notes on error

[http://developer.github.com/v3/#client-errors](http://developer.github.com/v3/#client-errors)

Callback functions can take any number of arguments, but the first argument is always an error or null.

    
## notes on sha

most requests are based on sha. You may omit to specify the placeholder value. If not specified, the request method will get the latest sha from this repo, either by requesting the api or pulling from the cache, and then output the original request method.


## todo

## changelog

* v.0.0.1:
  * raw request method
  * caching request output
  * starting point of tree wrapper api
  * tests