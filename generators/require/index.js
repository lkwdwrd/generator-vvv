'use strict';
var Base = require( '../../lib/base' );
var chalk = require( 'chalk' );

module.exports = Base.extend({
	_compose: function() {
		this.composeWith( 'vvv:dump', { arguments: [ 'manifest', 'composer' ] } );
	},
	prompting: function() {
		if ( ! this.install.composer ) {
			this.log(
				chalk.yellow.bold( "I can't add requirements:\n" ) +
				chalk.yellow( "I use composer to control requirements and it is " ) +
				chalk.yellow.bold( "turned off." )
			);
			return;
		}
		var done = this.async(),
			prompts = this.getPrompt( 'require' );

		this.log( chalk.magenta.bold( 'Let\'s add some requirements!' ) );
		this.prompt( prompts.questions, prompts.answers( this, done ) );
	}
});
