'use strict';
var Base = require( '../../lib/base' );
var chalk = require( 'chalk' );


module.exports = Base.extend({
	description: 'another test',
	_compose: function() {
		this.composeWith( 'vvv:json' );
		this.composeWith( 'vvv:source' );
		this.composeWith( 'vvv:require' );
		this.composeWith( 'vvv:bootstrap' );
		this.composeWith( 'vvv:dump', { arguments: [ 'all' ] } );
		this.composeWith( 'vvv:dump-task', { arguments: [ 'all' ] } );
	},
	_initialize: function() {
		this.removeRunMethod( 'downloadManifest', 'initializing', 4 );
		this.removeRunMethod( 'processManifest', 'initializing', 4 );
		this.addRunMethod( '_checkLocationArg', this._checkLocationArg, 'initializing', 4 );
	},
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
