/**
 * Helper functions for working with a centralized (global) set of templates.
 */

// Require Dependencies.
var path = require( 'path' );

/**
 * Gets the source root for the global template files.
 *
 * @return {string} The global template root path.
 */
function globalSourceRoot() {
	return path.join( __dirname, '..', 'templates' );
}

/**
 * Gets a global template path with the relative path added.
 *
 * @param  {String} relPath The relative path to fetch.
 * @return {String}         A resolved path to the requested global template.
 */
function globalTemplatePath( relPath ) {
	return path.resolve( path.join( this.globalSourceRoot(), relPath ) );
}

/**
 * Outputs a global template to the destination path with `this.fs.copyTmpl()`
 *
 * @param  {String} src     The relative source path.
 * @param  {String} dest    The destination relative to the site install.
 * @param  {Object} data    The data to inject into the template.
 * @param  {Object} options Options for controlling the templated output.
 * @return {void}
 */
function globalTemplate( src, dest, data, options ) {
	if ('string' !== typeof dest ) {
		options = data;
		data = dest;
		dest = src;
	}
	this.fs.copyTpl(
		this.globalTemplatePath( src ),
		this.destinationPath( dest ),
		data,
		options
	);
}

/**
 * Copy a file form the global templates folder to the destination path.
 *
 * @param  {String} src     The relative source path.
 * @param  {String} dest    The destination relative to the site install.
 * @param  {Object} options Options for controlling the copied output.
 * @return {void}
 */
function globalCopy( src, dest, options ) {
	if ('string' !== typeof dest ) {
		options = dest;
		dest = src;
	}
	this.fs.copy(
		this.globalTemplatePath( src ),
		this.destinationPath( dest ),
		options
	);
}

// Export these methods to mix with the base object prototype.
module.exports = {
	globalSourceRoot: globalSourceRoot,
	globalTemplatePath: globalTemplatePath,
	globalTemplate: globalTemplate,
	globalCopy: globalCopy
};
