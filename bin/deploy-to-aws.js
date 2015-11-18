var aws = require('aws-sdk');

var bundle = require('../lib/deploying/bundle-lambda.js'),
    install = require('../lib/deploying/install-modules.js');

var deployToAws = function(props) {
    var funcName = props.name;

    if (props.secretKey) aws.config.secretAccessKey = props.secretKey;
    if (props.accessKey) aws.config.secretAccessKey = props.accessKey;
    aws.config.region = props.region;

    var deploy = function(file) {
        var lambda = new aws.Lambda();

        var params = {
            Publish: true,
            FunctionName: funcName,
            ZipFile: file
        };

        console.log('Attempting to upload bundled lambda to AWS.');

        lambda.updateFunctionCode(params, function(err, data) {
          if (err) console.log('ERROR:', err); // an error occurred
          else     console.log('Success!', data); // successful response
        });
    };

    return install(function() {
        console.log('Successfully installed npm modules.');
        return bundle(deploy, funcName);
    });
};

module.exports = deployToAws;
