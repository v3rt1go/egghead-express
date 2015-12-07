'use strict';
var fs = require('fs');

// Much of the node functionality and the way it works is powered by streams
var inputFile = './issues.json';
var outputFile = './savedIssues.json';

// Streams can be readable, writable or both - duplex
var readStream = fs.createReadStream(inputFile);
var writeStream = fs.createWriteStream(outputFile);

// The way we tie this stream together is by using the stream pipe method.
// Usually this is done by calling the pipe method on a readable stream and
// passing it the writable stream as an argument. We can chain multiple pipes
// together to prepare the data. This is how gulp works

// This will copy the data streaming it from the readStream to the writeStream
readStream.pipe(writeStream);

// TODO: Write a script that uses JSONStream.stringifyObject to create a file that will
// have the issues.json objects each on one line, separated by , for mongoimport
