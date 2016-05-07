/**
 * Advanced prompts for adding static file proxies to the install.
 */

// Require Dependencies.
var tools = require( '../util/prompt-tools' );

// Export the questions and answer processing method.
module.exports = {
	questions: [
		{
			type: 'confirm',
			name: 'add',
			message: 'Add a static proxy capture:'
		},
		{
			when: tools.makeWhen( true, 'add' ),
			name: 'name',
			message: 'This proxy capture is named:',
			validate: tools.notEmpty
		},
		{
			when: tools.makeWhen( true, 'add' ),
			type: 'list',
			name: 'type',
			message: "This proxy capture is for:\n" +
			'(defaults: js, css, png, jpg, jpeg, gif, ico, mp3, mov, tif, tiff, swf, txt, html)',
			choices: [
				{
					name: 'The default static files list.',
					value: 'default'
				},
				{
					name: 'A subset or superset of the default static files list.',
					value: 'subset'
				},
				{
					name: 'A custom set of file types.',
					value: 'customTypes'
				},
				{
					name: 'A custom file capture.',
					value: 'custom'
				}
			]
		},
		{
			when: tools.makeWhen( 'subset', 'type' ),
			name: 'filesInclude',
			message: 'Types to add to the default list (comma separated):',
		},
		{
			when: tools.makeWhen( 'subset', 'type' ),
			name: 'filesExclude',
			message: 'Types to remove from the default list (comma separated):',
		},
		{
			when: tools.makeWhen( 'customTypes', 'type' ),
			name: 'files',
			message: 'Files types to match (comman separated)',
			validate: tools.notEmpty
		},
		{
			when: tools.makeWhen( 'custom', 'type' ),
			name: 'match',
			message: 'Custom file capture regular expression:',
			validate: tools.notEmpty
		}
	],
	internalQuestions: [
		{
			type: 'confirm',
			name: 'add',
			message: 'Add a proxy location to this capture:'
		},
		{
			when: tools.makeWhen( true, 'add' ),
			name: 'url',
			message: 'Proxy files to (URL, no trailing slash):',
			validate: tools.notEmpty
		},
		{
			when: tools.makeWhen( true, 'add' ),
			name: 'rewrite',
			message: "Proxy path rewrite (blank for none)\n" +
				'(ex. /wp-content(.*) $1):'
		}
	],
	answers: tools._.curry( processAnswers ),
	internalAnswers: tools._.curry( internalAnswers )
};

/**
 * Process answers from an Inquierer like framework.
 *
 * This processor records data about static file proxies to an intermediary object
 * and then passes it to the internal question processor to complete the proxy
 * object. The internal processor records the proxy to the install.
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

	if ( ! context.install.server.proxies ) {
		context.install.server.proxies = {};
	}

	var proxy = { proxies: [] };

	switch ( answers.type ) {
	case 'custom':
		proxy.match = answers.match;
		break;
	case 'customTypes':
		proxy.types = answers.files.split( ',' )
			.map( Function.prototype.call, String.prototype.trim );
		break;
	case 'subset':
		if ( answers.filesInclude ) {
			proxy['types-include'] = answers.filesInclude.split( ',' )
				.map( Function.prototype.call, String.prototype.trim );
		}
		if ( answers.filesExclude ) {
			proxy['types-exclude'] = answers.filesExclude.split( ',' )
				.map( Function.prototype.call, String.prototype.trim );
		}
		break;
	}

	context.prompt( module.exports.internalQuestions, module.exports.internalAnswers( context, done, proxy, answers.name ) );
}

/**
 * Process answers from an Inquierer like framework.
 *
 * This is for the internal questions for setting up static file proxies. It is passed
 * information from the normal processor, and then combines that with the internal
 * answers before actually recording the proxy data to the install object.
 *
 * @param  {Object}   context The context this method runs under.
 * @param  {Function} done    Callack to tell the environment work is done.
 * @param {Object}    proxy   The proxy object internal data was collected for.
 * @param {String}    name    The name of the proxy.
 * @param  {Object}   answers An object of answers for the asked questions.
 * @return {void}
 */
function internalAnswers( context, done, proxy, name, answers ) {
	if ( ! answers.add ) {
		context.install.server.proxies[ name ] = proxy;
		context.prompt( module.exports.questions, module.exports.answers( context, done ) );
		return;
	}

	proxy.proxies.push( ( answers.rewrite ) ? tools._.pick( answers, [ 'url', 'rewrite' ] ) : answers.url );
	context.prompt( module.exports.internalQuestions, module.exports.internalAnswers( context, done, proxy, name ) );
}
