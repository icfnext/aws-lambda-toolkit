var http = require('http'),
    chalk = require('chalk'),
    server = require('../lib/testing/generate-server.js'),
    testRunner = require('../lib/testing/run-tests.js');

var testLambdaFunction = function testLambda(props) {
    var cwd = process.cwd(),
        package = require(cwd+'/package.json'),
        config = require(cwd+'/.awstoolkitconfig.json'),
        entry, tests,
        port = 3123,
        srv, req;

    // get main lambda file path
    if (props && props.hasOwnProperty('entry')) {
        entry = cwd+'/'+props.entry;
    } else {
        entry = cwd+'/'+package.main;
    }

    if (props && props.hasOwnProperty('tests')) {
        tests = props.tests;
    } else {
        tests = config.tests;
    }

    srv = server(entry);
    srv.listen(port);
    testRunner(tests, port);
};

module.exports = testLambdaFunction;
