var Base = require( '../../lib/base' );
var chalk = require( 'chalk' );

module.exports = Base.extend({
	_compose: function() {
		this.composeWith( 'vvv:dump', { arguments: [ 'manifest' ] } );
		this.composeWith( 'vvv:dump-task', { arguments: [ 'src' ] } );
	},
	prompting: function() {
		var done = this.async(),
			prompts = this.getPrompt( 'source' );

		this.log( chalk.magenta.bold( 'Let\'s add some sources!' ) );
		this.prompt( prompts.questions, prompts.answers( this, done ) );
	}
});
