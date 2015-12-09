'use strict';
var _ = require('lodash');
var uri = 'mongodb://localhost:27017/test';
var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');

// The recommended way of working with mongodb from nodejs code
// is by using mongoose - an orm like wrapper for mongodb that offers
// a lot more functionality, data modelling features, cleaner code
// and less reliance on callbacks by using promises and other features

// First we initialize the connection
mongoose.connect(uri);
// Then we can get the active connection like such:
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection Error: '));
db.once('open', function(callback) {
  console.log("Connection to the db established.");
});

var issueSchema = mongoose.Schema({
  url: String,
  labels_url: String,
  comments_url: String,
  events_url: String,
  html_url: String,
  id: Number,
  title: String,
  user: {
    login: String,
    id: Number,
    avatar_url: String,
    gravatar_id: String,
    url: String,
    html_url: String,
    followers_url: String,
    following_url: String,
    gists_url: String,
    starred_url: String,
    subscriptions_url: String,
    organizations_url: String,
    repos_url: String,
    events_url: String,
    received_events_url: String,
    type: {type: String},
    site_admin: Boolean
  },
  number: Number,
  labels: [String],
  state: String,
  locked: Boolean,
  assignee: Boolean,
  milestone: Boolean,
  comments: Number,
  created_at: Date,
  updated_at: Date,
  closed_at: Date,
  body: String
});

// !!! ATT !!! when using virtual properties with Mongoose we cannot save them, or rather
// the changed values of their compound real properties while using the findOneAndUpdate
// mongoose helper. It will not work. Instead we have to use the classic findOne and then
// call issue.save() to properly save the changes done to virtual properties
// Creating virtual properties with Mongoose
issueSchema.virtual('user.status').get(function() {
  // We're using lodash startCase to porper capitalize this
  return _.startCase(this.user.login + " | " + this.assignee);
});
// We can also create setters for virtual properties
issueSchema.virtual('user.status').set(function(value) {
  var bits = value.split(' | ');
  this.user.login = bits[0];
  this.assignee = bits[1];
});

// We have to be careful when naming our models. Mongoose will use that name
// 'Issue' lowercase it and make it plural to find the collection
exports.Issue = mongoose.model('Issue', issueSchema);

// Check if it works and retuns us the issues
//exports.Issue.find({}, function(err, issues) {
  //console.log(issues);
//});

// This is the classical way of working with mongodb - using the official
// mongodb driver and writing queries directly
//var findIssues = function(db, callback) {
  //// we load our query to get all issues in the cursor
  //var cursor = db.collection('issues').find();
  //// when each is called on the query, it is executed and results/documents
  //// can be iterated. When the cursor has no more documents to return it will
  //// return a null - this is how we know that the collection has been returned
  //// and we can close the connection to the db with db.close()
  //cursor.each(function(err, doc) {
    //if (doc !== null) {
      //console.dir(doc);
    //} else {
      //callback();
    //} 
  //});
//};

//MongoClient.connect(uri, function(err, db) {
  //findIssues(db, function() {
    //db.close();
  //});
//});




