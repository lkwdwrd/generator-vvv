/**
 * Adds source repositories to the install. Code you are working on.
 */

'use strict';

// Require dependencies.
var Base = require( '../../lib/base' );
var chalk = require( 'chalk' );

// Export the Source generator.
module.exports = Base.extend({
	/**
	 * The subgenerator description used in the main `yo:vvv` command.
	 *
	 * @type {String}
	 */
	description: 'Define project source repositories and add them to the manifest.',
	/**
	 * Compose require with the dump and dump-task to output the affected files.
	 *
	 * @return {void}
	 */
	_compose: function() {
		this.composeWith( 'vvv:dump', { arguments: [ 'manifest' ] } );
		this.composeWith( 'vvv:dump-task', { arguments: [ 'src' ] } );
	},
	/**
	 * Prompt for source repositories and record them to the install object.
	 *
	 * @return {void}
	 */
	prompting: function() {
		var done = this.async(),
			prompts = this.getPrompt( 'source' );

		this.log( chalk.magenta.bold( 'Let\'s add some sources!' ) );
		this.prompt( prompts.questions, prompts.answers( this, done ) );
	}
});
