var deployToAws = require('./bin/deploy-to-aws.js'),
    testLambda = require('./bin/test-lambda.js');

var awsLambdaToolkit = {
    deploy: deployToAws,
    test: testLambda
};

module.exports = awsLambdaToolkit;
