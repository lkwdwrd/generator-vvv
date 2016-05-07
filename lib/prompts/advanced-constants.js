/**
 * Advanced prompts for adding custom constants to an install.
 */

// Require Dependencies.
var tools = require( '../util/prompt-tools' );

// Export the questions and answer processing method.
module.exports = {
	questions: [
		{
			type: 'confirm',
			name: 'add',
			message: 'Add or modify a constant:'
		},
		{
			when: tools.makeWhen( true, 'add' ),
			name: 'key',
			message: 'Constant name:'
		},
		{
			when: tools.makeWhen( true, 'add' ),
			name: 'value',
			message: 'Constant value:'
		}
	],
	answers: tools._.curry( processAnswers )
};

/**
 * Process answers from an Inquierer like framework.
 *
 * This processor records a single constant to the install object, then
 * recursively asks again so multiple constants can be added.
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

	context.install.site.constants[ answers.key ] = answers.value;
	context.prompt( module.exports.questions, module.exports.answers( context, done ) );
}
