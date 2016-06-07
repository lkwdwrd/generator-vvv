/**
 * Methods for output of objects into the destination path.
 *
 * This includes turning JSON object into JSON files as well as Grunt tasks.
 */

'use strict';

// Require dependencies.
var path = require( 'path' );
var objectStringify = require('object-stringify');

/**
 * Writes out a JSON object to the destination file.
 *
 * @param  {Object} data       The data object to write to a JSON file.
 * @param  {String} location   The file path where the json file will live.
 * @return {void}
 */
function writeJSON( data, location ) {
	// Write the file
	this.fs.write(
		this.destinationPath( location ),
		JSON.stringify( data, null, "\t" )
	);
}

/**
 * Writes out a grunt task JS module to the file system.
 *
 * The passed object runs through objectStringify instead of the JSON method so
 * that functions passed are stringified and output as well. This is necessary
 * for some Grunt task definitions.
 *
 * @param  {Object} config The object representing for Grunt task config.
 * @param  {String} name   The name of the task being output (no .js ext).
 * @return {void}
 */
function writeTask( config, name ) {
	// Write the file
	this.fs.write(
		this.destinationPath( path.join( 'tasks', name + '.js' ) ),
		"module.exports = " + objectStringify( config, { beautify: true } ) + ";\n"
	);
}

// Export these methods to mix with the base object prototype.
module.exports = {
	writeJSON: writeJSON,
	writeTask: writeTask
};
