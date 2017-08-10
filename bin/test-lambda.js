var http = require('http'),
    chalk = require('chalk'),
    server = require('../lib/testing/generate-server.js'),
    testRunner = require('../lib/testing/run-tests.js');

/**
 * Fire up the test runner and run some tests, yo.
 * If no props are present, attempt to use the config file.
 * @param {Obect=} props - The optional props to use for deployment.
 */
var testLambdaFunction = function testLambda(props) {
    var cwd = process.cwd(),
        pkg = require(cwd+'/package.json'),
        configName = '.awstoolkitconfig.' + ( props.environment ? props.environment + '.' : '' ) + 'json',
        config  = require(cwd + '/' + configName),
        entry, tests,
        port = 3123,
        srv, req;

    // get main lambda file path
    if (props && props.hasOwnProperty('entry')) {
        entry = cwd+'/'+props.entry;
    } else {
        entry = cwd+'/'+pkg.main;
    }

    // Set the test path if it's been configured
    if (props && props.hasOwnProperty('tests')) {
        tests = props.tests;
    } else {
        tests = config.tests;
    }

    // Start up the server
    srv = server(entry);
    srv.listen(port);

    // Run da tests
    testRunner(tests, port);
};

module.exports = testLambdaFunction;
