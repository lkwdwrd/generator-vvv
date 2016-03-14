var path = require( 'path' );
var fs = require( 'fs' );
var NPromise = require( 'promise' );
var readdir = NPromise.denodeify( fs.readdir );
var stat = NPromise.denodeify( fs.stat );

module.exports = walkDir;

function walkDir( name, folder, processor, depth ) {
	return readdir( folder ).then( readFiles( name, folder, processor, depth ) );
}

function statFile( name, fullPath, processor, depth ) {
	return stat( fullPath )
		.then( function _statFile( fstat ) {
			if ( fstat.isDirectory() ) {
				return walkDir( name, fullPath, processor, --depth );
			}
		} );
}

function readFiles( name, folder, processor, depth ) {
	return function _readFiles( files ) {
		var fullPath,
			promises = [];

		for ( var i = 0, length = files.length; i < length; i++ ) {
			fullPath = path.resolve( folder, files[ i ] );
			if ( name === files[ i ] ) {
				processor( fullPath );
			}
			if ( 1 !== depth ) {
				promises.push( statFile( name, fullPath, processor, depth ) );
			}
		}
		return NPromise.all( promises );
	};
}
