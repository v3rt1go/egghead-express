'use strict';
var express = require('express');
// Arguments to path.join must be strings - this error happens when we try to work inside
// an external router - like this one - with url params that should be passed from the top
// app level. This happens because when we create a router like this one, it is completely
// separate from the main app - that's why in the documentation these are offten reffered to
// as microapps / sites. In order to solve this we have to pass to the express.Router method
// an options object that contains mergeParams: true
var router = express.Router({
  mergeParams: true
});
var helpers = require('./helpers');
var _ = require('lodash');

// Much like the router/app.all method, we can declare the .use method
// - like we do when we include middleware - to be processed each time a request is made
// indifferent of the VERB used. The difference between use and all is that use does not
// require a path to be matched. It is fired every single time a request is made! If we use
// .use on a router it is still limited to the root path of the router (ie. issues/). If
// used on app it will fire each time
router.use(function(req, res, next) {
  console.log("A request for /issues has be sent");
  next();
});

// With views defined and a template engine selected we can now render the views from the routes
router.get('/', function(req, res) {
  // rendering a view without specifing the template engine extension tells express to use the
  // default templating engine - defined above, hbs - but if we have it installed - we can still 
  // use differen template engines - provided we have the views set up - like so:
  //res.render('index.jade', {issues: issues});
  res.render('index', {issues: helpers.issues});
});

// Another dynamic way to define express routes is to use regular expressions
// The regex below checks if a number is even
router.get(/[0-9]*[02468]$/, function(req, res, next) {
  console.log("EVEN number accessed");
  // by calling next we continue down the route processing pipe.
  // This has to be above the route that will match and send the response in order to
  // execute, else it will never be executed
  next();
});

// This will be triggered only if an odd number is provided
router.get(/[0-9]*[13579]$/, function(req, res, next) {
  console.log("ODD number accessed");
  next();
});

// Express also has the .all method, that it's going to match
// on all the VERBS that are used when a request is sent and matches the route
// This is especially usefull when we want to log some requests or prepare some data
// no matter what type of request comes for a specific route
router.all('/:id', function(req, res, next) {
  console.log(req.method, 'for issue: ', req.params.id);
  next();
});
  
// We can declare multiple route handlers on a route - they act like middleware
// and pass in the req, res, next params of the route. Inside the handler we can check
// the data, modify it etc. and then return next() to carry the normal route processing
// or even send the response from the middleware handler and stop further processing.
// Multiple handler can be sent as an array of functions [handle1, handle2]
// verifyIssueId acts as a 404 handler, if no issue is found with the id will send a 404
// response
router.get('/:id', helpers.verifyIssueId, function(req, res) {
  var issueId = +req.params.id;
  //res.send(_.result(_.find(issues, {'id': issueId}), 'title'));
  //var issue = _.pick(_.find(issues, {'id': issueId}), 'title', 'url', 'state');
  var issue = _.find(helpers.issues, {id: issueId});
  res.render('issue', issue);
});

// After setting up bodyParser we can configure the POST/PUT routes to handle the
// data and make the required changes
router.put('/:id', function(req, res) {
  var id = req.params.id;
  var issue = helpers.findIssueById(id);
  
  issue.updated_at = Date.now();
  issue.state = req.body.state;
  issue.user.login = req.body.user; 
  
  helpers.saveIssueData(issue, function(err) {
    if (err) console.log("Error! Data could not be saved. ", err);
    res.end();
  });
});

router.delete('/:id', function(req, res) {
  var id = req.params.id;
  helpers.deleteIssue(id, function(err) {
    if (err) console.log("Error! Data could not be saved. ", err);
    res.end();
  });
});

// A common use for the .use method is for error handling. Taking advantage of
// the router and microapps architecture of express we can define specific error
// handlers for each component of our app
// If we run our app with NODE_ENV=productio - aka in production mode - express won't
// output the error stack to the browser, so it's a good thing to have an error handler
// so we can control and see the errors
// It's important to have all 4 arguments in the express callback - this is how
// express recognizes this is error handling
router.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Oops! Something broke.");
});

// Finally we export our router
module.exports = router;







// Express gives us the option of grouping multiple routes that have the same
// pattern but are set for different verbs or perform different actions
// For this we initialize the pattern with app.route() and then chain the
// rest of the routes
//app.route('/issues/:id')
  //// Express also has the .all method, that it's going to match
  //// on all the VERBS that are used when a request is sent and matches the route
  //// This is especially usefull when we want to log some requests or prepare some data
  //// no matter what type of request comes for a specific route
  //.all(function(req, res, next) {
    //console.log(req.method, 'for issue: ', req.params.id);
    //next();
  //})
  //// We can declare multiple route handlers on a route - they act like middleware
  //// and pass in the req, res, next params of the route. Inside the handler we can check
  //// the data, modify it etc. and then return next() to carry the normal route processing
  //// or even send the response from the middleware handler and stop further processing.
  //// Multiple handler can be sent as an array of functions [handle1, handle2]
  //// verifyIssueId acts as a 404 handler, if no issue is found with the id will send a 404
  //// response
  //.get(helpers.verifyIssueId, function(req, res) {
    //var issueId = +req.params.id;
    ////res.send(_.result(_.find(issues, {'id': issueId}), 'title'));
    ////var issue = _.pick(_.find(issues, {'id': issueId}), 'title', 'url', 'state');
    //var issue = _.find(helpers.issues, {id: issueId});
    //res.render('issue', issue);
  //})
  //// After setting up bodyParser we can configure the POST/PUT routes to handle the
  //// data and make the required changes
  //.put(function(req, res) {
    //var id = req.params.id;
    //var issue = helpers.findIssueById(id);
    
    //issue.updated_at = Date.now();
    //issue.state = req.body.state;
    //issue.user.login = req.body.user; 
    
    //helpers.saveIssueData(issue, function(err) {
      //if (err) console.log("Error! Data could not be saved. ", err);
      //res.end();
    //});
  //})
  //.delete(function(req, res) {
    //var id = req.params.id;
    //helpers.deleteIssue(id, function(err) {
      //if (err) console.log("Error! Data could not be saved. ", err);
      //res.end();
    //});
  //});
