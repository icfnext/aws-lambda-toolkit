var http = require('http'),
    chalk = require('chalk'),
    server = require('../lib/testing/generate-server.js'),
    testRunner = require('../lib/testing/run-tests.js');

var testLambdaFunction = function testLambda(props) {
    var cwd, config, entry, tests,
        port = 3001,
        srv, req;

    // get main lambda file path
    if (props && props.hasOwnProperty('entry')) {
        entry = props.entry;
    } else {
        cwd = process.cwd();
        config = require(cwd+'/package.json');
        entry = cwd+'/'+config.main;
    }

    if (props && props.hasOwnProperty('tests')) {
        tests = props.tests;
    } else {
        tests = config.lambdatests;
    }

    port = 3001;
    srv = server(entry);
    srv.listen(port);
    testRunner(tests, port);
};

module.exports = testLambdaFunction;
