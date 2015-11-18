var request = require('./generate-request.js');

module.exports = function runTests(tests, port) {
    var cwd = process.cwd(),
        testCount = 0,
        readyRequests = [],
        inProgress,
        current;

    for (var test in tests) {
        current = {};

        current.name = test;
        current.data = require(cwd+'/'+tests[test]);
        current.port = port;

        readyRequests.push(current);
    }

    var runRequests = function runRequests(ready) {
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
