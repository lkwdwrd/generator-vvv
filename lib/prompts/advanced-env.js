/**
 * Advanced prompts for adding environment variables to an install.
 */

// Require Dependencies.
var tools = require( '../util/prompt-tools' );

// Export the questions and answer processing method.
module.exports = {
	questions: [
		{
			type: 'confirm',
			name: 'add',
			message: 'Add or modify an environment variable:'
		},
		{
			when: tools.makeWhen( true, 'add' ),
			name: 'key',
			message: 'Variable name:'
		},
		{
			when: tools.makeWhen( true, 'add' ),
			name: 'value',
			message: 'Variable value:'
		}
	],
	answers: tools._.curry( processAnswers )
};

/**
 * Process answers from an Inquierer like framework.
 *
 * This processor records  an environment variable to the install object. It
 * then asks again recursively so multiple environment variables can be added.
 *
 * @param  {Object}   context The context this method runs under.
 * @param  {Function} done    Callack to tell the environment work is done.
 * @param  {Object}   answers An object of answers for the asked questions.
 * @return {void}
 */
function processAnswers( context, done, answers ){
	if ( ! answers.add ) {
		return done();
	}

	if ( ! context.install.site.env ) {
		context.install.site.env = {};
	}

	context.install.site.env[ answers.key ] = answers.value;
	context.prompt( module.exports.questions, module.exports.answers( context, done ) );
}
