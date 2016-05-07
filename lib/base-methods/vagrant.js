/**
 * Contains everything needed for finding and managing a VVV install.
 *
 * This finds or queries for the correct vagrant path and provides a helper for
 * the checking ot make sure a path is within the VVV directory.
 */

'use strict';

// Require dependencies.
var fs = require( 'fs' );
var path = require( 'path' );
var chalk = require( 'chalk' );

/**
 * Finds or queries for the correct location of the VVV install.
 *
 * If the `--vagrant-path` is used, this will ensure that is a Vagrant path and
 * use it, bailing if it's not. If the option is not sent, it grabs the
 * Vagrant path out of the RC config. If it is not in the RC config, or the
 * data in the RC config is wrong, it will prompt for the Vagrant directory.
 *
 * If the current working directory is inside the VVV directory, it will set
 * the found Vagrant path as the default value for the query.
 *
 * Once set, it's unlikely the user will be asked again for the VVV directory
 * location. They can pass a `--vagrant-path` flag to switch installs
 * temporarily, or you can modify your .gvrc file and point it to the correct
 * install location.
 *
 * @param  {Function} done Callack to tell the environment work is done.
 * @return {void}
 */
function vagrantPath( done ) {
	// See if it came in as an argument and if not try to get it from config.
	if( this.options.vagrantPath ) {
		this.options.vagrantPath = path.resolve( this.options.vagrantPath );
		if ( ! _isVVVDir.call( this, this.options.vagrantPath ) ) {
			this.log( chalk.red.bold( 'The passed vagrant path does not appear to contain a VVV install... :(' ) );
			process.exit( 0 );
		} else {
			console.log( this.options.vagrantPath );
			done();
		}
	} else {
		this.options.vagrantPath = this.rcConfig.get( 'vagrantPath' );
	}
	// Make sure the stored directory still looks VVV-ish.
	if ( this.options.vagrantPath && ! _isVVVDir.call( this, this.options.vagrantPath ) ) {
		this.options.vagrantPath = false;
	}
	// See if we've gotten it yet, and if not try to autodetect and then prompt.
	if ( ! this.options.vagrantPath ) {
		// Set up question and asnwer processor.
		var vdir = process.cwd(),
			info = path.parse( vdir ),
			question = [ {
				type: 'text',
				name: 'dir',
				message: 'Where is your VVV directory located?'
			} ];
		/**
		 * Based on the answer, if we detect VVV here, store it and move on, or ask again.
		 *
		 * @param  {object} answer The object holding the user input.
		 */
		var processAnswer = function ( answer ){
			if ( _isVVVDir.call( this, answer.dir ) ) {
				this.options.vagrantPath = answer.dir;
				this.log( chalk.green.bold( 'Storing Vagrant path... great job! :)' ) );
				this.rcConfig.set( 'vagrantPath', this.options.vagrantPath, true ).then( done );
			} else {
				this.log( chalk.red.bold( 'That does not look like a VVV directory... :(' ) );
				this.prompt( question, processAnswer );
			}
		}.bind( this );
		// Try to autodetect the directory and set as default.
		do {
			if ( _isVVVDir.call( this, vdir ) ) {
				question[0].default = vdir;
				break;
			} else {
				vdir = path.dirname( vdir );
			}
		} while ( vdir !== info.root );
		// Start asking where Vagrant is.
		this.prompt( question, processAnswer );
	} else {
		done();
	}
}

/**
 * Check to see if the working path is in the VVV `www` directory.
 *
 * Will check up to the number of levels passed. So if 2 is passed, and the path
 * is within 2 directory levels of the VVV `www` directory, this method will
 * return true.
 *
 * @param  {String}  workingPath The working path to check for.
 * @param  {Int}     levels      How deeply nested the working path can be.
 * @return {Boolean}             Whether or not the working path is in `www`.
 */
function isVVVPath( workingPath, levels ) {
	var pathDiff, wwwPath = path.join( this.options.vagrantPath, 'www' );
	levels = parseInt( levels, 10 ) || 2;
	workingPath = path.resolve( workingPath );

	if ( 0 !== workingPath.indexOf( wwwPath ) ) {
		return false;
	}
	pathDiff = path.relative( wwwPath, workingPath ).split( path.sep );
	if ( pathDiff.length > levels ) {
		return false;
	}

	return true;
}

/**
 * Some file-system checks to see if the passed directory is the root VVV dir.
 *
 * @param  {String}  dir The directory to test as the root VVV directory.
 * @return {Boolean}     Whether or not the passed directory is the VVV root.
 */
function _isVVVDir( dir ) {
	try {
		fs.lstatSync( path.join( dir, 'Vagrantfile' ) );
		fs.lstatSync( path.join( dir, 'www' ) );
		fs.lstatSync( path.join( dir, 'www', 'vvv-hosts' ) );
		return true;
	} catch( e ) {
		return false;
	}
}

// Export these methods to mix with the base object prototype.
module.exports = {
	vagrantPath: vagrantPath,
	isVVVPath: isVVVPath
};
