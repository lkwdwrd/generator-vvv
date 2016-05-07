/**
 * Downloads files based on the declaration in the wpmanifest.json file.
 *
 * An 'uploads' compressed file (.zip, .tar.gz) containing the necessary uploads
 * for the site as well as a 'database' to a .sql or .sql.gz file can be
 * declared in the manifest.
 *
 * If it was declared you can download both, decompress uploads, and import the
 * database with the `yo vvv:pull` command.
 *
 * The command taks space separated arguements similar to the dump commands. The
 * values of 'uploads' and 'db' will cause the two types of downloads to occur.
 */


'use strict';

// Require dependencies.
var _ = require( 'lodash' );
var path = require( 'path' );
var Base = require( '../../lib/base' );
var chalk = require( 'chalk' );

// Export the Pull generator.
module.exports = Base.extend({
	/**
	 * The subgenerator description used in the main `yo:vvv` command.
	 *
	 * @type {String}
	 */
	desc: 'Download uploads or a database based on passed args and manifest values.',
	/**
	 * Maps command line arguments to processing methods for each pull type.
	 *
	 * @type {Object}
	 */
	pullMap: {
		'uploads': '_getUploads',
		'db': '_getSQL',
	},
	/**
	 * Processes the passed arguments and sets up downloads as appropriate.
	 *
	 * @return {void}
	 */
	doPull: function() {
		var done = this.async();
		var pulls = _.remove( this.arguments.map( this._getPull, this ) );

		if ( 1 > pulls.length ) {
			return done();
		}

		this.multiDownload( pulls )
			.then( done )
			.catch( function( err ){
				this.log( err.message );
				process.exit( 0 );
			}.bind( this ));
	},
	/**
	 * Gets a specific download location based on the pull map and manifest.
	 *
	 * @param  {String}      pull The pull map key value to process a download.
	 * @return {Object|Bool}      Either the download definition or false.
	 */
	_getPull: function( pull ) {
		if ( this.pullMap[ pull ] ) {
			return this[ this.pullMap[ pull ] ]();
		} else {
			return false;
		}
	},
	/**
	 * Processes a download object for uploads if defined in the manifest file.
	 *
	 * @return {Object|Bool} Either the download object or false.
	 */
	_getUploads: function() {
		var uploads = false;
		if ( this.install.uploads ) {
			if ( 'string' === typeof this.install.uploads ) {
				uploads = { location: this.install.uploads };
			} else {
				uploads = _.clone( this.install.uploads );
			}
			uploads.dest = this.getAppPath( 'content-path', 'app', 'uploads' );
			uploads.opts = uploads.opts || {};
			uploads.opts.extract = { strip: 1 };
		}
		return uploads;
	},
	/**
	 * Processes a download object for a SQL file if defined in the manifest.
	 *
	 * If it is present and this is the root generator, it will also add a
	 * command to the run loop to import that database.
	 *
	 * @return {Object|Bool} Either the download object or false.
	 */
	_getSQL: function() {
		var database = false;
		if ( this.install.database ) {
			if ( 'string' ===  typeof this.install.database ) {
				database = { location: this.install.database };
			} else {
				database = _.clone( this.install.database );
			}
			database.dest = path.join( 'config', 'data' );
		}
		if ( this.isRoot ) {
			this.env.runLoop.add(
				'install',
				this._import.bind( this ),
				{ once: 'import', run: false }
			);
		}
		return database;
	},
	/**
	 * A helper function that imports a database after it has been downloaded.
	 *
	 * @param  {Function} done Callack to tell the environment work is done.
	 * @return {void}
	 */
	_import: function( done ){
		console.log();
		console.log( chalk.yellow( 'Attempting to import your database.' ) );
		console.log();
		this.spawnCommandSync( 'grunt', [ 'import' ] );
		done();
	}
});
