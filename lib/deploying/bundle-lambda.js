var fs    = require('fs'),
    spawn = require('child_process').spawn;

module.exports = function bundleLambda(cb, name) {
    var file = name+'.zip', fileBuffer, zip, exists;

    try {
        exists = fs.lstatSync(file);
    } catch(e) {
        exists = false;
    }

    if (exists) {
        fs.unlinkSync(file);
        console.log('Successfully deleted the old bundle.');
    }

    console.log('Bundling lambda.');
    zip = spawn('zip', ['-rq', file, '.', '-x', 'node_modules/gulp/**\*', 'node_modules/aws-sdk/**\*', 'node_modules/aws-lambda-toolkit/**\*']);

    zip.stdout.on('data', function(data) {
        console.log('stdout: ' + data.toString());
    });

    zip.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });

    zip.on('close', function (code) {
        console.log('Successfully bundled lambda to \'' + file + '\'.');
        return cb(fs.readFileSync(file), name);
    });
};
