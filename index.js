'use strict';

var express = require('express');
var jsonfile = require('jsonfile');
var _ = require('lodash');
var engines = require('consolidate');
var bodyParser = require('body-parser');

var issues = [];
var issueStore = [];
jsonfile.readFile('issues.json', function (err, data) {
  if (err) throw err;

  data.forEach(function(ghIssue) {
    issueStore.push(ghIssue);
    issues.push(createIssueSummary(ghIssue));
  });
});

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
app.use('/profilepics', express.static('images'));
// The above code basicly sais to express that every time a request is made to the /profilepics
// folder to look for and serve the static content from the images subfolder contained by
// /profilepics

// Parsing the body and handling POST/PUT/DELETE requests
// In order to parse the body of a POST/PUT message we need to insall the body-parser package
// and setup express to use it
// We tell bodyParser that our data is going to be urlencoded and with extended: true we are
// setting it up to parse as much of the body as it can
app.use(bodyParser.urlencoded({ extended: true }));

// With views defined and a template engine selected we can now render the views from the routes
app.get('/', function(req, res) {
  // rendering a view without specifing the template engine extension tells express to use the
  // default templating engine - defined above, hbs - but if we have it installed - we can still 
  // use differen template engines - provided we have the views set up - like so:
  //res.render('index.jade', {issues: issues});
  res.render('index', {issues: issues});
});

app.get('/raw', function(req, res) {
  var buffer = '';

  issues.forEach(function(issue) {
    buffer += '<a href="/issues/' + issue.url + '" target="_blank">' + 
                issue.title + 
              '</a><br />';
  });
  // res.send(JSON.stringify(issues, null, '---'));
  res.send(buffer);
});

// Another dynamic way to define express routes is to use regular expressions
// The regex below checks if a number is even
app.get(/issues\/[0-9]*[02468]$/, function(req, res, next) {
  console.log("EVEN number accessed");
  // by calling next we continue down the route processing pipe.
  // This has to be above the route that will match and send the response in order to
  // execute, else it will never be executed
  next();
});

// This will be triggered only if an odd number is provided
app.get(/issues\/[0-9]*[13579]$/, function(req, res, next) {
  console.log("ODD number accessed");
  next();
});

app.get('/issues/:id', function(req, res) {
  var issueId = +req.params.id;
  //res.send(_.result(_.find(issues, {'id': issueId}), 'title'));
  //var issue = _.pick(_.find(issues, {'id': issueId}), 'title', 'url', 'state');
  var issue = _.find(issues, {id: issueId});
  res.render('issue', issue);
});

// After setting up bodyParser we can configure the POST/PUT routes to handle the
// data and make the required changes
app.put('/issues/:id', function(req, res) {
  var id = req.params.id;
  var issue = findIssueById(id);
  
  issue.updated_at = Date.now();
  issue.state = req.body.state;
  issue.user.login = req.body.user; 
  
  saveIssueData(issue, function(err) {
    if (err) console.log("Error! Data could not be saved. ", err);
    res.end();
  });
});

app.delete('/issues/:id', function(req, res) {
  var id = req.params.id;
  deleteIssue(id, function(err) {
    if (err) console.log("Error! Data could not be saved. ", err);
    res.end();
  });
});

app.get('/yo', function(req, res) {
  res.send("YO!");
});

var findIssueById = function(id) {
  return _.find(issueStore, {number: +id});  
};
var findIssueIndex = function(issue) {
  return _.findIndex(issueStore, issue);
};

var saveIssueData = function(issue, cb) {
  var issueIndex = findIssueIndex(issue); 
  issueStore[issueIndex] = issue;
  writeData(issueStore, cb);
};
var deleteIssue = function(id, cb) {
  _.remove(issueStore, {number: +id});
  writeData(issueStore, cb);
};

var writeData = function (issueStore, cb) {
  var dataStore = 'issues.json';
  jsonfile.writeFile(dataStore, issueStore, cb); 
}; 

var server = app.listen(3000, function() {
  console.log("Server running at http://localhost:" + server.address().port);
});

var createIssueSummary = function (issue) {
  return {
    title: issue.title,
    url: issue.html_url,
    id: issue.number,
    user: issue.user.login,
    state: issue.state,
    locked: issue.locked,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
    closed_at: issue.closed_at,
    content: issue.body
  };
};
