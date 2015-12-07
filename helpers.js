'use strict';
var _ = require('lodash');
var jsonfile = require('jsonfile');

var issues = [];
var issueStore = [];

var createIssueSummary = function(issue) {
  if (issue) {
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
  }
};

var data = jsonfile.readFileSync('./issues.json');
data.forEach(function(ghIssue) {
  issueStore.push(ghIssue);
  issues.push(createIssueSummary(ghIssue));
});

// We are going to create a function that is going to verify if an issue id
// actually exists and belongs to an issue
exports.verifyIssueId = function(req, res, next) {
  var issue = findIssueById(req.params.id);
  if (issue) {
    next();
  } else {
    //res.status(404).send("Issue not found!");
    // We can also tell express to skip the route this handler is defined on
    // and go on to the next route that matches. This is especially usefull if we
    // have multiple dynamic routes that fall under the same pattern. For example
    // /issue/:id and /issue/:name. To tell express that it should move to the
    // next route that matches we use next and pass it 'route' string - not name of
    // route, but actually 'route', like so:
    // next('route');
    //
    // We could also redirect from a route handler, for example we could:
    res.redirect('/404-error/' + req.params.id);
    // This will redirect to the /404-error route and will also pass the params
    // of the initial request to the redirected route
  }
};
var findIssueById = function(id) {
  return _.find(issueStore, {number: +id});  
};
var findIssueIndex = function(issue) {
  return _.findIndex(issueStore, issue);
};

var writeData = function (issueStore, cb) {
  var dataStore = './issues.json';
  jsonfile.writeFileSync(dataStore, issueStore); 
  cb();
}; 

exports.saveIssueData = function(issue, cb) {
  var issueIndex = findIssueIndex(issue); 
  issueStore[issueIndex] = issue;
  writeData(issueStore, cb);
};
exports.deleteIssue = function(id, cb) {
  _.remove(issueStore, {number: +id});
  writeData(issueStore, cb);
};



exports.issues = issues;
exports.issueStore = issueStore;
exports.createIssueSummary = createIssueSummary;
exports.findIssueById = findIssueById;
exports.findIssueIndex = findIssueIndex;
exports.writeData = writeData;
