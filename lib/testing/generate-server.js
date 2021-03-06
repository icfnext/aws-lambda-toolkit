var http    = require('http'),
    chalk   = require('chalk'),
    context = require('./context.js'),
    lambda;

/**
 * Creates a node server running an instance of the lambda function.
 * @param {string} entry - The main lambda file.
 * @returns {Object} The server instance.
 */
module.exports = function generateServer (entry) {
    lambda = require(entry);

    // Set up test server
    var srv = http.createServer(function server(request, response) {
        var requestBody = '';

        // Let the user know when a request has succeeded :)
        context.on('success', function(reason) {
            console.log(chalk.cyan('[SERVER]'), chalk.green('(CONTEXT)'), reason);
            console.log(chalk.cyan('[SERVER]'), chalk.green('200'), 'Request success!');
            console.log(chalk.white('/SERVER ----------------------------------\n'));
            response.writeHead(200);
            response.body = reason;
        });

        // Let the user know when a request has failed :(
        context.on('fail', function(reason) {
            console.log(chalk.cyan('[SERVER]'), chalk.red('500'), 'Request failed.');
            console.error(chalk.cyan('[SERVER]'), reason);
            console.log(chalk.white('/SERVER ----------------------------------\n'));
            response.writeHead(500);
            response.body = reason;
        });

        // Fill up requestBody with the data from the stream.
        request.on('data', function(data) {
            requestBody += data;

            // Kill connection if too much post data
            if (data > 1 * Math.pow(10, 6)) {
                request.connection.destroy();
            }
        });

        // On end....
        request.on('end', function() {
            var event = (requestBody !== '' ? JSON.parse(requestBody) : '');

            // Shut down the server.
            if (event.end) {
                response.writeHead(500);
                response.end();
                srv.close(function() {
                    console.log(chalk.cyan('[SERVER]'),'Shutting down.');
                    console.log(chalk.white('/SERVER ----------------------------------\n'));
                });
            } else {
                // Reset the context and send another one!
                context.reset();
                console.log(chalk.white('REQUEST ----------------------------------'));
                console.log(chalk.cyan('[SERVER]'), 'Received request.');
                console.log(chalk.cyan('[SERVER]'), event);
                console.log(chalk.white('/REQUEST ---------------------------------\n'));

                console.log(chalk.white('SERVER ----------------------------------'));
                lambda.handler(event, context);
                response.end();
            }
        });
    });

    return srv;
}
