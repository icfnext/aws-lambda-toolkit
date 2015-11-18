var chalk = require('chalk'),
    http  = require('http');

module.exports = function generateRequest(test, arr, cb) {
    var postData, opts, req;

    if (test.terminate) {
        postData = JSON.stringify({ end : true });
        console.log('Tests completed. Terminating server.');
    } else {
        postData = JSON.stringify(test.data);
        console.log('Running test', '"'+test.name+'".');
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

    req = http.request(opts, function testRequest(res) {
        if (!test.terminate) {
            console.log('\n'+chalk.white('RESPONSE ----------------------------------'));
            console.log(chalk.magenta('[REQUEST]'), 'Rendering response from server.');

            console.log(chalk.magenta('[REQUEST]'), chalk.green('(STATUS)'), res.statusCode);
            console.log(chalk.magenta('[REQUEST]'), chalk.green('(HEADERS)'), JSON.stringify(res.headers));
        }

        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            console.log(chalk.magenta('[REQUEST]'), chalk.green('(BODY)'), chunk);
        });

        res.on('end', function() {
            if (!test.terminate) {
                console.log(chalk.magenta('[REQUEST]'), 'No more data in response.');
                console.log(chalk.white('/RESPONSE ----------------------------------'));
                if (arr && cb) {
                    cb(arr);
                }
            }
        });
    });

    req.on('error', function(e) {
        console.log(chalk.magenta('[REQUEST]') + chalk.red('There was a problem with your request: ') + e.message);
        console.log(chalk.white('RESPONSE ----------------------------------'));
    });

    // write data to request body
    req.write(postData);
    req.end();

    return req;
};
