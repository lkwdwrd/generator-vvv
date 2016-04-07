// Require dependencies
var path = require( 'path' );
var objectStringify = require('object-stringify');

/**
 * Writes out a JSON object to the destination file.
 *
 * If the file already exists, the existing object will be run through
 * `_.defaults` with the default object passed. This allows for some
 * mutation of an existing object if desired while ensuring we don't
 * overwrite and destroy the existing JSON object in the file.
 *
 * The contents and file names are run through templating so ejs template
 * tags can be used in both.
 *
 * @param  {Object} defaults   The default JSON object.
 * @param  {String} location   The file path where the json file will live.
 * @param  {String} whitespace Optional. The whitespace to use in output.
 *                             Will default to the defined default.
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
 * Writes out a JS module to the file system.
 *
 * The contents and file names are run through templating so ejs template
 * tags can be used in both.
 *
 * @param  {Object} module   The ASTConfig object for this module.
 * @param  {String} location The file path where the module will live.
 * @return {void}
 */
function writeTask( config, name ) {
	// Write the file
	this.fs.write(
		this.destinationPath( path.join( 'tasks', name + '.js' ) ),
		"module.exports = " + objectStringify( config, { beautify: true } ) + ";\n"
	);
}

module.exports = {
	writeJSON: writeJSON,
	writeTask: writeTask
};
