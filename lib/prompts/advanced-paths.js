/**
 * Advanced prompts for customizing the various paths used of the install.
 */

// Require Dependencies.
var tools = require( '../util/prompt-tools' );

// Export the questions and answer processing method.
module.exports = {
	questions: [
		{
			name: 'wpPath',
			message: 'WordPress Install Path:',
			default: 'wp'
		},
		{
			name: 'contentPath',
			message: 'Content Path:',
			default: 'wp-content'
		},
		{
			name: 'composerPath',
			message: 'Composer JSON Directory:',
			default: '.'
		},
		{
			name: 'vendorDir',
			message: 'Vendor Directory Location:',
			default: 'vendor'
		},
		{
			name: 'root',
			message: 'Server Index Root:',
			default: '.'
		}
	],
	answers: tools._.curry( processAnswers )
};

/**
 * Process answers from an Inquierer like framework.
 *
 * This processor records advanced path information to the istall object.
 *
 * @param  {Object}   context The context this method runs under.
 * @param  {Function} done    Callack to tell the environment work is done.
 * @param  {Object}   answers An object of answers for the asked questions.
 * @return {void}
 */
function processAnswers( context, done, answers ){
	var appPaths = {};
	if ( answers.wpPath !== 'wp' ) {
		appPaths['wp-path'] = answers.wpPath;
	}
	if ( answers.contentPath !== 'wp-content' ) {
		appPaths['content-path'] = answers.contentPath;
	}
	if ( answers.composerPath !== '.' ) {
		appPaths['composer-path'] = answers.composerPath;
	}
	if ( answers.vendorDir !== 'vendor' ) {
		appPaths['vendor-dir'] = answers.vendorDir;
	}
	if ( answers.root !== '.' ) {
		appPaths.root = answers.root;
	}
	if ( appPaths ) {
		context.install.appPaths = appPaths;
	}
	done();
}
