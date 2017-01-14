// Dependencies
var aws     = require('aws-sdk'),
    chalk   = require('chalk'),
    emph    = chalk.bold.green,
    label   = chalk.yellow,
    val     = chalk.cyan;

// Methods
var bundle  = require('../lib/deploying/bundle-lambda.js'),
    install = require('../lib/deploying/install-modules.js');

// Configs
var config  = require(process.cwd() + '/.awstoolkitconfig.json'),
    creds;

/**
 * Bundles and deploys the lambda to AWS.
 * If no props are present, attempt to use the config file.
 * @param {Object=} props - The optional props to use for deloyment.
 * @returns {Function} instance of the NPM installer and bundler.
 */
var deployToAws = function (props) {
    var params = props || {},
        lambda,
        secret, access;

    // Set up properties...
    try {
        // If we can get the creds file, use it
        creds   = require(process.cwd() + '/.awscredentials.json');
        secret = creds.secretKey;
        access = creds.accessKey;
    } catch (e) {
        // If the user has the keys passed in as props, use them but warn them of their ways
        if (params.hasOwnProperty('accessKey') || params.hasOwnProperty('secretKey')) {
            console.log(
                emph('.awscredentials.json'), label('file could not be found!'), '\n\n',
                label('It is highly recommended you move your credentials into'),
                label('\nthe'), emph('.awscredentials.json'), label('file and add it to '), emph('.gitignore'),
                label('\nto avoid compromising your credentials.\n\n')
            );

            if (params.secretAccessKey)
                secret = params.secretKey;
            if (params.accessKey)
                access = params.accessKey;
        }
        // If they don't have a creds file OR props, likely they have the creds saved
        // via the AWS SDK credentials file (~/.aws/credentials)
    }

    // Only publish a new version if specified to prevent 500000000 versions
    doPublish = false;
    if (config.hasOwnProperty('publish'))
      doPublish = config.publish;

    if (params.hasOwnProperty('publish'))
      doPublish = params.publish;

    // Set our region
    aws.config.update({
        accessKeyId : access,
        secretAccessKey : secret,
        region : config.region || params.region
    });

    lambda = new aws.Lambda({ region: config.region || params.region });

    /**
     * Uses the AWS SDK to update a lambdas source code by pushing up the local
     * bundled and zipped version of the code up to AWS.
     * @param {Buffer} file : The bundled lambda to push up to AWS.
     */
    var deploy = function(file) {
        // Lets do some uploading, dawg
        console.log('Attempting to upload bundled lambda to AWS.');
        lambda.updateFunctionCode({
            Publish: doPublish,
            FunctionName: config.name || params.name,
            ZipFile: file
        }, function(err, data) {
            if (err) {
                // If it doesn't exist....
                if (err.code === 'ResourceNotFoundException') {
                    console.log(
                        emph('Whoops!'), 'It looks like this lambda doesn\'t exist yet.',
                        '\nTrying to fix that for you...'
                    );
                    return create(file);
                } else {
                    return console.log('[AWS ERROR]:', err.message); // an error occurred
                }
            }

            console.log('Successfully deployed', emph(data.FunctionName), emph('v'+data.Version)+'\n', '\t'+label('Using handler'), val(data.Handler)); // successful response
            console.log(label('\tFunction Arn:'), val(data.FunctionArn));
            console.log(label('\tRole:'), val(data.Role));
            console.log(label('\tBundle size:'), val(data.CodeSize));
            console.log(label('\tSha256:'), val(data.CodeSha256));
        });
    };

    /**
     * Uses the AWS SDK to create a lambda function, then pushes up the
     * local bundled lambda as the functions code.
     * @param {Buffer} file : The bundled lambda to push up to AWS.
     */
    var create = function createFunction(file) {
        console.log('Attempting to create function on AWS.');
        // Create our lambda!
        lambda.createFunction({
            Code: {
                ZipFile: file
            },
            FunctionName: config.name || params.name,
            Handler: config.handler || params.handler,
            Role: config.role || params.role,
            Runtime: 'nodejs4.3',
            Description: config.description || params.role || '',
            Publish: true
        }, function(err, data) {
            if (err) // If there was an error, log dat
                return console.log('[AWS ERROR]:', err.message);

            // Otherwise, log the success dawg
            console.log(
                'Successfully created', emph(data.FunctionName), '\n',
                label('\tUsing handler'), val(data.Handler), '\n',
                label('\tFunction Arn:'), val(data.FunctionArn), '\n',
                label('\tRole:'), val(data.Role), '\n',
                label('\tBundle size:'), val(data.CodeSize), '\n',
                label('\tSha256:'), val(data.CodeSha256)
            );
        });
    };

    // Fire off the installer and bundler and return the results
    return install(function() {
        console.log('Successfully installed npm modules.');
        return bundle(deploy, config.name || params.name);
    });
};

module.exports = deployToAws;
