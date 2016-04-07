// Require dependencies
var fs = require( 'fs' );
var path = require( 'path' );
var chalk = require( 'chalk' );

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

module.exports = {
	vagrantPath: vagrantPath,
	isVVVPath: isVVVPath
};
