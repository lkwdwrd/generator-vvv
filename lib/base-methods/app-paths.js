/**
 * Methods for setting up applications paths for the selected install.
 *
 * This API gives access to all of the customizable locations for the various
 * tools output by Generator VVV. This includes the composer path, vendor
 * directory, WordPress path, wp-content folder path, and site root path.
 *
 * The `getAppPath` method abstracts getting these paths from the base object
 * prepending and appending paths to them as necessary based on context.
 */

// Require dependencies
var _ = require( 'lodash' );
var path = require( 'path' );

/**
 * Sets up the customizable tool paths for the selected site install.
 *
 * In the `wpmanifest.json` file you can specify an `app-paths` object and
 * choose a custom directory for each of the default items (composer, the
 * vendor directory, the core WordPress path, the wp-content folder name and
 * locale, and the site-root location).
 *
 * This methods adds this to the appPaths object and intuits the locations of
 * the plugins, themes, and mu-plugins folders.
 *
 * @param {Function} done Callack to tell the environment work is done.
 */
function setUpAppPaths( done ) {
	this.appPaths = this.appPaths || {};
	// Set up path maps
	_.assign( this.appPaths, _.defaults( _.clone( this.install['app-paths'] || {} ), {
		'composer-path': '.',
		'vendor-dir': 'vendor',
		'wp-path': 'wp',
		'content-path': 'wp-content',
		'root': '.'
	} ) );
	this.appPaths['theme-path'] = path.join( this.appPaths['content-path'], 'themes' );
	this.appPaths['plugin-path'] = path.join( this.appPaths['content-path'], 'plugins' );
	this.appPaths['mu-plugin-path'] = path.join( this.appPaths['content-path'], 'mu-plugins' );
	done();
}

/**
 * Helper function for getting and app-path with optional root and path args.
 *
 * @param  {String} name       The name of the app-path to retrieve.
 * @param  {String} root       The root of the app itself based on context.
 * @param  {String} additional Additional path segments to add to the app-path.
 * @return {String}            The normalized path as requested.
 */
function getAppPath( name, root, additional ) {
	root = root || '.';
	additional = additional || '.';
	return path.normalize( path.join( root, this.appPaths[ name ], additional ) );
}

// Export these methods to mix with the base object prototype.
module.exports = {
	setUpAppPaths: setUpAppPaths,
	getAppPath: getAppPath
};
