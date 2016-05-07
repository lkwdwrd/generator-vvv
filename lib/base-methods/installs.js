/**
 * Methods for gathering available installs and selecting the active one.
 *
 * The selected install determine which Generator VVV install is acted on by
 * the initialized subgenerator.
 */

// Require dependencies.
var path = require( 'path' );
var chalk = require( 'chalk' );
var recursiveFind = require( '../util/recursive-find.js' );

/**
 * Finds available wp-manifest.json files in the VVV instance and stores them.
 *
 * @param  {Function} done Callack to tell the environment work is done.
 * @return {void}
 */
function gatherInstalls( done ) {
	recursiveFind(
		'wpmanifest.json',
		path.join( this.options.vagrantPath, 'www' ),
		_recordInstall.bind( this ),
		3
	)
	.then( done );
}

/**
 * Selects a specific install as the active install for this subgenerator.
 *
 * @param  {Function} done Callack to tell the environment work is done.
 * @return {void}
 */
function selectInstall( done ) {
	// Select by name if it was sent as an opiton.
	if ( this.options.name && this.installs[ this.options.name ] ) {
		_makeInstallActive.call( this, this.installs[ this.options.name ] );
		done();
	}
	// Use cwd if name and path were not sent as options.
	var gvPath = ( this.options.path ) ? this.options.path : process.cwd(),
		info = path.parse( gvPath );
	do{
		if ( this.iPathMap[ gvPath ] ) {
			_makeInstallActive.call( this, this.iPathMap[ gvPath ] );
			return done();
		} else {
			gvPath = path.dirname( gvPath );
		}
	} while ( info.root !== gvPath );

	this.log( chalk.red.bold( 'Unable to select an install!' ) );
	this.log( '' );
	this.log( chalk.red( 'You might try...') );
	this.log( chalk.red( '  * Moving to a working directory with a WPManifest file.' ) );
	this.log( chalk.red( '  * Using the --name="install/name" flag in the command.' ) );
	this.log( chalk.red( '  * Using the --path="install/path" to specify the project directory.' ) );
	process.exit( 0 );
}

/**
 * Helper function to process and store a found install location and data.
 *
 * @param  {String} filePath The file path of a `wpmanifest.json` file.
 * @return {void}
 */
function _recordInstall( filePath ) {
	var install = require( filePath );
	if ( install && install.name ) {
		install.workingDirectory = path.dirname( filePath );
		this.installs[ install.name ] = install;
		this.iPathMap[ install.workingDirectory ] = install;
	}
}

/**
 * Helper to set a specific install as the active install for this subgenerator.
 *
 * Not only does this set up the `this.install` property, but it also ensures
 * that the destination root and rcConfig are correct for this install location.
 *
 * @param  {Object} install The install object to make active.
 * @return {void}
 */
function _makeInstallActive( install ) {
	this.install = install;
	process.chdir( install.workingDirectory );
	this.destinationRoot( install.WorkingDirectory );
	this.rcConfig.refresh();
}

// Export these methods to mix with the base object prototype.
module.exports = {
	gatherInstalls: gatherInstalls,
	selectInstall: selectInstall,
};
