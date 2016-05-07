/**
 * Queries for dependency requirement definitions and stores them.
 *
 * This will only work if the install uses composer to manage its
 * various dependencies.
 */

'use strict';

// Require dependencies.
var Base = require( '../../lib/base' );
var chalk = require( 'chalk' );

// Export the Require generator.
module.exports = Base.extend({
	/**
	 * The subgenerator description used in the main `yo:vvv` command.
	 *
	 * @type {String}
	 */
	description: 'Define project dependencies and add them to the manifest.',
	/**
	 * Compose require with the dump to output the manifest and composer files.
	 *
	 * @return {void}
	 */
	_compose: function() {
		this.composeWith( 'vvv:dump', { arguments: [ 'manifest', 'composer' ] } );
	},
	/**
	 * Prompt for requirements and record them to the install object.
	 *
	 * @return {void}
	 */
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
