var chalk = require('chalk'),
    emph = chalk.bold.green,
    fs    = require('fs'),
    glob = require( 'glob' ),
    archiver = require( 'archiver' ),
    tmp = require( 'tmp' ),
    flatmap = require( 'flatmap' );

// Configs
var cwd = process.cwd(),
    pkg = require( cwd + '/package.json' ),
    config = require( cwd + '/.awstoolkitconfig.json' );

var calculateDependencies = function( pkg, cwd, accumulator, useDev ) {
    var dependencies = useDev ? Object.keys( pkg.devDependencies || [] ) : Object.keys( pkg.dependencies || [] );
    var newDependencies = dependencies.filter( function( currentDependency ) {
        return !accumulator[ currentDependency ];
    } );

    newDependencies.forEach( function( currentDependency ) {
        accumulator[ currentDependency ] = true;
    } );

    return flatmap( newDependencies, function( currentDependency ) {
        try {
            return calculateDependencies(
                require( cwd + '/node_modules/' + currentDependency + '/package.json' ),
                cwd,
                accumulator )
                .concat( [ currentDependency ] );
        }
        catch( e ) {
            return [];
        }
    } );

};

module.exports = function bundleLambda( cb, name ) {

    var potentialDevDependencies = calculateDependencies( pkg, cwd, {}, true );
    var dependencies = calculateDependencies( pkg, cwd, {}, false );
    var devDependencies = potentialDevDependencies.filter( function( currentDependency ) {
        return dependencies.indexOf( currentDependency ) === -1;
    } );



    glob( '**/*', {
        ignore: [
            'testdata',
            '.DS_Store',
            'node_modules/aws-sdk/**/*'
        ]
            .concat( devDependencies.map( function( currentDevDependency ) {
                return 'node_modules/' + currentDevDependency + '/**/*';
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

            archive.on('error', function(err) {
                throw err;
            });

            output.on('close', function() {
                cb( fs.readFileSync( tempFilePath ), tempFilePath );
            });

            archive.pipe( output );

            files.forEach( function( currentFile ) {

                if ( fs.lstatSync( currentFile ).isFile() ) {
                    archive.append(fs.createReadStream(currentFile), {name: currentFile});
                }
            } );

            archive.finalize();
        } );

    } );

};
