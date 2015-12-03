'use strict';

var express = require('express');
var fs = require('fs');
var _ = require('lodash');

var issues = [];
fs.readFile('issues.json', {encoding: 'utf8'}, function (err, data) {
  if (err) throw err;

  JSON.parse(data).forEach(function(ghIssue) {
    issues.push(createIssueSummary(ghIssue));
  });
});

var app = express();

app.get('/', function(req, res) {
  var buffer = '';

  issues.forEach(function(issue) {
    buffer += '<a href="/issues/' + issue.url + '" target="_blank">' + 
                issue.title + 
              '</a><br />'
  });
  // res.send(JSON.stringify(issues, null, '---'));
  res.send(buffer);
});

app.get('/issues/:id', function(req, res) {
  // Use lodash to search in issues for the issue with number :id
  // and return the full issue object, that will be displayed on page
});

app.get('/yo', function(req, res) {
  res.send("YO!");
});

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
  };
};