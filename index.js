'use strict';

var express = require('express');
var engines = require('consolidate');
var bodyParser = require('body-parser');
var fs = require('fs');
var JSONStream = require('JSONStream');
var helpers = require('./helpers');

// Import Issue mongoose model
var Issue = require('./db.js').Issue;

var app = express();

// using consolidate we can work with different template engines, including ones that do not
// work with express out of the box
app.engine('hbs', engines.handlebars);

// Defining the template engine and the views folder
app.set('views', './views');
app.set('view engine', 'hbs');

// We can declare locations from where express can serve files as static
// assets. A common thing is to declare the public folder from where to serve
// images, stylesheets and front end js libraries
app.use(express.static(__dirname + '/public'));

// If we want to guard a folder and always serve static content from a sepcific subdirectory
// we could
// The code basicly sais to express that every time a request is made to the /profilepics
// folder to look for and serve the static content from the images subfolder contained by
// /profilepics
app.use('/profilepics', express.static('images'));

// Parsing the body and handling POST/PUT/DELETE requests
// In order to parse the body of a POST/PUT message we need to insall the body-parser package
// and setup express to use it
// We tell bodyParser that our data is going to be urlencoded and with extended: true we are
// setting it up to parse as much of the body as it can
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  Issue.find({}, function(err, issues) {
    res.send(issues);
  });

  // Express has made the response object implement the writable stream object. That means that
  // we can pipe data directly into it:
  //var readable = fs.createReadStream('./issues.json');
  //readable.pipe(res);

  //var buffer = '';

  //helpers.issues.forEach(function(issue) {
    //buffer += '<a href="/issues/' + issue.url + '" target="_blank">' + 
                //issue.title + 
              //'</a><br />';
  //});
  //// res.send(JSON.stringify(issues, null, '---'));
  //res.send(buffer);
});

// Express also has the option to allow the user to download a file from the server
// Each time a request comes with a .json ie /foo.json express will send to the client
// the full issues.json file to download
app.get('*.json', function(req, res) {
  // We can optionally sepcify a filename, other than the original file
  res.download('./issues.json', 'virus.exe');
});

// We can also send json directly to the browser, not only for download
app.get('/data/:id', function(req, res) {
  var issue = helpers.findIssueById(req.params.id);
  res.json(issue);
});

// We can use the JSONStream npm package to create streams that manipulate and stream
// JSON data directly
app.get('/issues/by/:state', function(req, res) {
  var state = req.params.state;
  var readable = fs.createReadStream('./issues.json');
  // We'll be using JSONStream.parse(pattern, map) where map is going to be a function
  // that will filter the issues by state and pattern will be '*' which means each object
  // in the JSONStream. JSONStream when server a stream with JSON content converts everythin
  // in an object, and we can work with them more easily
  readable
    .pipe(
      JSONStream.parse('*', function(issue) {
        return issue.state === state ? {id: issue.number, title: issue.title} : null;
      }))
    .pipe(JSONStream.stringify())
    .pipe(res);
});

app.get('/yo', function(req, res) {
  res.send("YO!");
});

app.get('/404-error/:id', function(req, res) {
  res.status(404).send("No issue with id " + req.params.id + " was found");
});

// If we use external routers (like we have issue.js) we can require them and use them
// in our index.js file
var issueRouter = require('./issue.js');
app.use('/issues', issueRouter);

var server = app.listen(3000, function() {
  console.log("Server running at http://localhost:" + server.address().port);
});

