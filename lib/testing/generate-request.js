var chalk = require('chalk'),
    http  = require('http');

/**
 * Generates a request from test data to pipe through to the node
 * server running the lambda instance, then displays the results.
 *
 * @param {Object} test - The initial options.
 * @param {Array} arr - An array of requests to pass to the cb.
 * @param {Function} cb - The callback to run if more tests are available.
 * @returns The request
 */
module.exports = function generateRequest(test, arr, cb) {
    var postData, opts, req;
    if (test.terminate) {
        postData = JSON.stringify({ end : true });
        console.log('Tests completed. Terminating server.');
    } else {
        postData = JSON.stringify(test.data);
        console.log('Running test', chalk.bold.cyan('"'+test.name+'"')+'.');
    }

    opts = {
        hostname: 'localhost',
        port: test.port,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    };

    // Make an HTTP request to the server
    req = http.request(opts, function testRequest(res) {
        if (!test.terminate) {
            console.log('\n'+chalk.white('RESPONSE ----------------------------------'));
            console.log(chalk.magenta('[REQUEST]'), 'Rendering response from server.');

            console.log(chalk.magenta('[REQUEST]'), chalk.green('(STATUS)'), res.statusCode);
            console.log(chalk.magenta('[REQUEST]'), chalk.green('(HEADERS)'), JSON.stringify(res.headers));
        }

        res.setEncoding('utf8');

        // Logo data to the console
        res.on('data', function (chunk) {
            console.log(chalk.magenta('[REQUEST]'), chalk.green('(BODY)'), chunk);
        });

        // Show the user when there is no more data left so they're not confused
        res.on('end', function() {
            if (!test.terminate) {
                console.log(chalk.magenta('[REQUEST]'), 'No more data in response.');
                console.log(chalk.white('/RESPONSE ----------------------------------\n'));
                if (arr && cb) {
                    cb(arr);
                }
            }
        });
    });

    // If there was an error, let the user know, yo
    req.on('error', function(e) {
        console.log(chalk.magenta('[REQUEST]') + chalk.red('There was a problem with your request: ') + e.message);
        console.log(chalk.white('/RESPONSE ----------------------------------'));
    });

    // write data to request body
    req.write(postData);
    req.end();

    // return dat request
    return req;
};
