/**
 * A question to select which advanced options the user wants to be asked.
 */

'use strict';

// Require Dependencies.
var tools = require( '../util/prompt-tools' );

// Export the questions and answer processing method.
module.exports = {
	questions: [
		{
			type: 'checkbox',
			name: 'opts',
			message: 'Advanced Customization Options (space bar to select, enter to continue):',
			choices: [
				{
					name: 'Customize Site Options',
					value: 'site'
				},
				{
					name: 'Add or Modify Constants',
					value: 'constants'
				},
				{
					name: 'Add or Modify Environment Variables',
					value: 'env'
				},
				{
					name: 'Add static file proxies',
					value: 'proxies'
				},
				{
					name: 'Customize App Paths',
					value: 'paths'
				},
				{
					name: 'Customize Composer Options',
					value: 'composer'
				}
			]
		}
	],
	answers: tools._.curry( processAnswers )
};

/**
 * Process answers from an Inquierer like framework.
 *
 * This processor adds the advanced option questions to the question queue so
 * the user can doesn't need to be asked every question if they don't need to
 * be asked it.
 *
 * @param  {Object}   context The context this method runs under.
 * @param  {Function} done    Callack to tell the environment work is done.
 * @param  {Object}   answers An object of answers for the asked questions.
 * @return {void}
 */
function processAnswers( context, done, answers ) {
	var i, length, advMap = {
		'site': '_advancedSite',
		'constants': '_advancedConstants',
		'env': '_advancedEnv',
		'proxies': '_advancedProxies',
		'paths': '_advancedPaths',
		'composer': '_advancedComposer'
	};

	for ( i = 0, length = answers.opts.length; i < length; i++ ) {
		context.env.runLoop.add(
			'prompting',
			context[ advMap[ answers.opts[ i ] ] ].bind( context ),
			{
				run: false,
				once: 'adv-' + answers.opts[ i ]
			}
		);
	}
	done();
}
