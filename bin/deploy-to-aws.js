var aws = require('aws-sdk'),
    chalk = require('chalk'),
    emph = chalk.bold.green,
    label = chalk.yellow,
    val = chalk.cyan;

var bundle = require('../lib/deploying/bundle-lambda.js'),
    install = require('../lib/deploying/install-modules.js');

var deployToAws = function(props) {
    var funcName = props.name;

    if (props.secretKey) aws.config.secretAccessKey = props.secretKey;
    if (props.accessKey) aws.config.accessKeyId = props.accessKey;
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
            if (err) return console.log('ERROR:', err); // an error occurred

            console.log('Successfully deployed', emph(data.FunctionName), emph('v'+data.Version)+'\n', '\t'+label('Using handler'), val(data.Handler)); // successful response
            console.log(label('\tFunction Arn:'), val(data.FunctionArn));
            console.log(label('\tRole:'), val(data.Role));
            console.log(label('\tBundle size:'), val(data.CodeSize));
            console.log(label('\tSha256:'), val(data.CodeSha256));
        });
    };

    return install(function() {
        console.log('Successfully installed npm modules.');
        return bundle(deploy, funcName);
    });
};

module.exports = deployToAws;
