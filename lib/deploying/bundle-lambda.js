var chalk = require('chalk'),
    emph = chalk.bold.green,
    fs    = require('fs'),
    spawn = require('child_process').spawn;

// Configs
var cwd = process.cwd(),
    pkg = require(cwd+'/package.json'),
    config = require(cwd+'/.awstoolkitconfig.json');

/**
 * Bundles up the lambda code and all dependencies
 * @param {Function} cb - The callback method
 * @param {String} name - The name of the target zip file
 */
module.exports = function bundleLambda(cb, name) {
    var file = name+'.zip',
        cwd = process.cwd(),
        devDependencies = pkg.devDependencies || {},
        userignores = config.ignores || [],
        fileBuffer, zip, exists;

    // See if the file already exists
    try {
        exists = fs.lstatSync(file);
    } catch(e) {
        exists = false;
    }

    // Delete the old bundle if it exists
    if (exists) {
        fs.unlinkSync(file);
        console.log('Successfully deleted the old bundle.');
    }

    /**
     * It's currently ignoring gulp, aws-sdk, aws-lambda-toolkit to prevent
     * user error. If this isn't really necessary those can be deleted.
     */
    console.log('Generating list of npm modules to ignore.');
    var opts = ['-rq', file, '.', '-x',
        'testdata',
        '.DS_Store',
        'node_modules/gulp/**\*',
        'node_modules/aws-sdk/**\*',
        'node_modules/aws-lambda-toolkit/**\*'
    ], ignore = ['gulp', 'aws-sdk', 'aws-lambda-toolkit'];

    for (var dep in devDependencies) {
      // Iterate through the dependencies to see if the current is needed
        var shouldIgnore = ignore.some(function (mod) {
            return dep === mod;
        });

        if (!shouldIgnore) {
            console.log('Ignoring depenency:', emph(dep));
            opts.push('node_modules/'+ dep +'/**\*');
        }
    }
    // Add the users specified ignores to the end of the array...
    opts.concat(userignores);
    // Zip up the lambda
    console.log('Bundling lambda.');
    zip = spawn('zip', opts);

    // Log the progress
    zip.stdout.on('data', function(data) {
        console.log('stdout: ' + data.toString());
    });

    // If there's an error, log it
    zip.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });

    // Let the user know everything was successful
    zip.on('close', function (code) {
        console.log('Successfully bundled lambda to', emph('\'' + file + '\'') + '.');
        return cb(fs.readFileSync(file), name);
    });
};
