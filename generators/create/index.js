/**
 * The create subgenerator is streamlined way to define an boostrap in one go.
 *
 * It will run the json subgenerator to ask all of the questions to define the
 * install and then mixes in bootstrap to actually create the defined site and
 * set it up within the Vagrant install.
 */

'use strict';

// Require dependencies.
var Base = require( '../../lib/base' );
var chalk = require( 'chalk' );


module.exports = Base.extend({
	description: 'Define a site and immediately bootstrap it.',
	/**
	 * Compose the json, source, require, and bootstrap subgenerators.
	 *
	 * @return {void}
	 */
	_compose: function() {
		this.composeWith( 'vvv:json' );
		this.composeWith( 'vvv:source' );
		this.composeWith( 'vvv:require' );
		this.composeWith( 'vvv:bootstrap' );
		this.composeWith( 'vvv:dump', { arguments: [ 'all' ] } );
		this.composeWith( 'vvv:dump-task', { arguments: [ 'all' ] } );
	},
	/**
	 * Set up run-methods to trigger during the yeoman lifecycle.
	 *
	 * This removes the manifest processing methods from bootstrap since we are
	 * creating the install definition.
	 *
	 * @return {void}
	 */
	_initialize: function() {
		this.removeRunMethod( 'downloadManifest', 'initializing', 4 );
		this.removeRunMethod( 'processManifest', 'initializing', 4 );
		this.addRunMethod( '_checkLocationArg', this._checkLocationArg, 'initializing', 4 );
	},
	/**
	 * Make sure the generator has a valid install location.
	 * 
	 * The first argument sent for the create method is the install location. If
	 * it is not a valid install location, this will detect that and output an
	 * error before exiting the process.
	 *
	 * @param  {Function} done Callack to tell the environment work is done.
	 * @return {void}
	 */
	_checkLocationArg: function( done ) {
		if ( ! this.arguments[0] || this.isVVVPath( this.arguments[0] ) ) {
			return done();
		} else {
			this.log( chalk.red.bold( 'That destination path is not in the VVV directory!' ) );
			this.log( '' );
			this.log( chalk.red( 'You might try...') );
			this.log( chalk.red( '  * Moving to a directory one or two levels deep in the VVV www/ folder.' ) );
			this.log( chalk.red( '  * Not specifying a directory and allowing the generator to create one.' ) );
			process.exit( 0 );
		}
	}
});
