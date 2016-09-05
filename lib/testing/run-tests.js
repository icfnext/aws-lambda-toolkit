var request = require('./generate-request.js');

/**
 * Reads test JSON files and pipes them through to the server running
 * an instance of the lambda function via the generate-request module.
 * @param {Object} tests - The object containing the test paths.
 * @param {Number} port - The port we should be using to send requests to.
 * @returns {Function} A recursive function running the tests.
 */
module.exports = function runTests(tests, port) {
    var cwd = process.cwd(),
        testCount = 0,
        readyRequests = [],
        inProgress,
        current;

    // Iterate through our tests and format/push them into a queue
    for (var test in tests) {
        current = {};

        current.name = test;
        current.data = require(cwd+'/'+tests[test]);
        current.port = port;

        readyRequests.push(current);
    }

    /**
     * Runs requests against the running lambda instance.
     * @param {Array} ready - The formatted request array.
     */
    var runRequests = function runRequests(ready) {
        // We done? Then terminate, bro
        if (testCount == ready.length)
            return request({
                terminate: true,
                port: port
            });

        inProgress = ready.slice(testCount, ++testCount);
        request(inProgress[0], ready, runRequests);
    };

    return runRequests(readyRequests);
};
