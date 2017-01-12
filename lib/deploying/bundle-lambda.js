var chalk = require('chalk'),
    emph = chalk.bold.green,
    fs    = require('fs'),
    glob = require( 'glob' ),
    archiver = require( 'archiver' ),
    tmp = require( 'tmp' );

// Configs
var cwd = process.cwd(),
    pkg = require( cwd + '/pkg.json' ),
    config = require( cwd + '/.awstoolkitconfig.json' );

module.exports = function bundleLambda( cb, name ) {

    archive.on('error', function(err) {
        throw err;
    });

    var devDependencies = pkg.devDependencies || {};

    glob( '**/*', {
        cwd: o.directory,
        ignore: [
            'testdata',
            '.DS_Store',
            'node_modules/aws-sdk/**\*'
        ]
            .concat( Object.keys( devDependencies ).map( function( currentDevDependency ) {
                return 'node_modules/' + currentDevDependency + '/**\*';
            } ) )
            .concat( config.ignores || [] )
    }, function( err, files ) {
        if ( err ) {
            throw err;
        }

        tmp.file( function( err, tempFilePath, fd, cleanupCallback ) {
            if ( err ) {
                throw err;
            }

            var archive = archiver( 'zip', {
                store: true
            } );

            var output = fs.createWriteStream( tempFilePath );

            output.on('close', function() {
                cb( fs.readFileSync( tempFilePath ), tempFilePath );
            });

            archive.pipe( output );

            files.forEach( function( currentFile ) {
                archive.append( fs.createReadStream( currentFile ), { name: currentFile } );
            } );

            archive.finalize();
        } );

    } );

};
