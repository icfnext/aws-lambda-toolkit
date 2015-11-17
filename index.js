var fs = require('fs'),
    aws = require('aws-sdk');

var bundle = require('./bin/bundle-lambda.js'),
    install = require('./bin/install-modules.js');

var deploy = function(file, name) {
    var lambda = new aws.Lambda();

    var params = {
        Publish: true,
        FunctionName: name,
        ZipFile: file
    };

    console.log('Attempting to upload bundled lambda to AWS.');

    lambda.updateFunctionCode(params, function(err, data) {
      if (err) console.log('ERROR:', err); // an error occurred
      else     console.log('Success!', data);           // successful response
    });
};

var deployToAws = function(props) {
    var funcName = props.name;

    aws.config.secretAccessKey = props.secretKey;
    aws.config.accessKeyId = props.accessKey;
    aws.config.region = props.region;

    return install(function() {
        console.log('Successfully installed npm modules.');
        return bundle(deploy, funcName);
    });
};

module.exports = deployToAws;
