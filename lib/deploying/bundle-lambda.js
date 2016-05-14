var chalk = require('chalk'),
    emph = chalk.bold.green,
    fs    = require('fs'),
    spawn = require('child_process').spawn;

module.exports = function bundleLambda(cb, name) {
    var file = name+'.zip',
        cwd = process.cwd(),
        devDependencies = require(cwd+'/package.json').devDependencies,
        fileBuffer, zip, exists;

    try {
        exists = fs.lstatSync(file);
    } catch(e) {
        exists = false;
    }

    if (exists) {
        fs.unlinkSync(file);
        console.log('Successfully deleted the old bundle.');
    }

    console.log('Generating list of npm modules to ignore.');
    /**
     * It's currently ignoring gulp, aws-sdk, aws-lambda-toolkit to prevent
     * user error. If this isn't really necessary those can be deleted.
     */
    var opts = ['-rq', file, '.', '-x',
        'node_modules/gulp/**\*',
        'node_modules/aws-sdk/**\*',
        'node_modules/aws-lambda-toolkit/**\*'
    ], ignore = ['gulp', 'aws-sdk', 'aws-lambda-toolkit'];

    for (var dep in devDependencies) {
        var shouldIgnore = ignore.some(function (mod) {
            return dep === mod;
        });

        if (!shouldIgnore) {
            console.log('Ignoring depenency:', emph(dep));
            opts.push('node_modules/'+ dep +'/**\*');
        }
    }

    console.log('Bundling lambda.');
    zip = spawn('zip', opts);

    zip.stdout.on('data', function(data) {
        console.log('stdout: ' + data.toString());
    });

    zip.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });

    zip.on('close', function (code) {
        console.log('Successfully bundled lambda to', emph('\'' + file + '\'') + '.');
        return cb(fs.readFileSync(file), name);
    });
};
