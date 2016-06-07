/**
 * A helper function to search directories and subdirectories for a file.
 */

'use strict';

// Require Dependencies.
var path = require( 'path' );
var fs = require( 'fs' );
var Promise = require( 'bluebird' );
var readdir = Promise.promisify( fs.readdir );
var stat = Promise.promisify( fs.stat );

// Export the walkDir method which kicks off the magic.
module.exports = walkDir;

/**
 * Recursively walk a set of directories searching for 'name' to `depth` levels.
 *
 * @param  {String}   name      The name of the file ot search for.
 * @param  {String}   folder    The folder to search within for 'name'.
 * @param  {Function} processor The function to process 'name' with if found.
 * @param  {Int}      depth     How deep to search within 'folder'.
 * @return {Promise}            A promise resolving when the search is complete.
 */
function walkDir( name, folder, processor, depth ) {
	return readdir( folder ).then( readFiles( name, folder, processor, depth ) );
}

/**
 * Get the stats of an item in a directory to determine its type.
 *
 * @param  {String}   name      The name being search for.
 * @param  {String}   fullPath  The full path currently being searched.
 * @param  {Function} processor The processor for when 'name' is found.
 * @param  {Int}      depth     How deep within the path to search for 'name'.
 * @return {Promise}            A thenable resolving when the stat is done.
 */
function statFile( name, fullPath, processor, depth ) {
	return stat( fullPath )
		.then( function _statFile( fstat ) {
			if ( fstat.isDirectory() ) {
				return walkDir( name, fullPath, processor, --depth );
			}
		} );
}

/**
 * Create a function for reading the files in a dir to check for 'name'.
 *
 * @param  {String}   name      The name to search for.
 * @param  {String}   folder    The folder being searched.
 * @param  {Function} processor The method to call when 'name' is found.
 * @param  {Int}      depth     How deep within the 'folder' to search.
 * @return {Function}           The processing function to search for 'name'.
 */
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
		return Promise.all( promises );
	};
}
