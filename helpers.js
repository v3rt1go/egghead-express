'use strict';
var _ = require('lodash');
var jsonfile = require('jsonfile');
var Issue = require('./db.js').Issue;

var issues = [];
var issueStore = [];

var createIssueSummary = function(issue) {
  if (issue) {
    return {
      title: issue.title,
      url: issue.html_url,
      id: issue.number,
      user: issue.user.login,
      status: issue.user.status,
      state: issue.state,
      locked: issue.locked,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      closed_at: issue.closed_at,
      content: issue.body
    };
  }
};

Issue.find({}, function(err, issueDocs) {
  if (err) throw err;
  issueDocs.forEach(function(ghIssue) {
    if (ghIssue) {
      issueStore.push(ghIssue);
      issues.push(createIssueSummary(ghIssue));
    }
  });

  exports.issues = issues;
  exports.issueStore = issueStore;
});

//var data = jsonfile.readFileSync('./issues.json');
//data.forEach(function(ghIssue) {
  //issueStore.push(ghIssue);
  //issues.push(createIssueSummary(ghIssue));
//});

// We are going to create a function that is going to verify if an issue id
// actually exists and belongs to an issue
exports.verifyIssueId = function(req, res, next) {
  var issue = findIssueById(req.params.id, function(err, issue) {
    if (err) throw err;

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
  });
};
var findIssueById = function(id, cb) {
  //return _.find(issueStore, {number: +id});  
  Issue.findOne({number: +id}, function(err, issue) {
    if (err) cb(err);
    cb(null, issue);
  });
};
var findIssueIndex = function(issue) {
  return _.findIndex(issueStore, issue);
};

var writeData = function (issueStore, cb) {
  var dataStore = './issues.json';
  jsonfile.writeFileSync(dataStore, issueStore); 
  cb();
}; 

// !!! ATT !!! when using virtual properties with Mongoose we cannot save them, or rather
// the changed values of their compound real properties while using the findOneAndUpdate
// mongoose helper. It will not work. Instead we have to use the classic findOne and then
// call issue.save() to properly save the changes done to virtual properties
exports.saveIssueData = function(issue, cb) {
  //var issueIndex = findIssueIndex(issue); 
  //issueStore[issueIndex] = issue;
  //writeData(issueStore, cb);
  //
  //TODO: There is a bug in the code below. We need to use $set: to update the login field of the nested
  //user object. The code below just replaces the user object.
  Issue.findOneAndUpdate({number: issue.number}, 
                         {state: issue.state, updated_at: issue.updated_at, user: {login: issue.user.login}}, 
    function(err, data) {
      if (err) cb(err);

      // Check that we saved the right data
      findIssueById(issue.number, function(err, issueDoc) {
        if (err) throw err;

        console.log("Saved data: ", issueDoc);
        var issueIndex = findIssueIndex(issue); 
        issueStore[issueIndex] = issue;
        cb(null, data);
      });
    });
};
exports.deleteIssue = function(id, cb) {
  _.remove(issueStore, {number: +id});
  writeData(issueStore, cb);
};

exports.createIssueSummary = createIssueSummary;
exports.findIssueById = findIssueById;
exports.findIssueIndex = findIssueIndex;
exports.writeData = writeData;
