var tools = require( '../util/prompt-tools' );

module.exports = {
	questions: [
		{
			type: 'confirm',
			name: 'useComposer',
			message: 'This site manages dependencies with composer:'
		},
		{
			when: tools.makeWhen( true, 'useComposer' ),
			type: 'confirm',
			name: 'composerInApp',
			message: 'Dump an app version of the Composer JSON file:'
		},
		{
			when: tools.makeWhen( true, 'useComposer' ),
			name: 'keywords',
			message: 'Comma separated keywords for this site:'
		},
		{
			when: tools.makeWhen( true, 'useComposer' ),
			name: 'wpVersion',
			message: 'This site should install a specific version of WordPress:',
			default: 'latest',
			filter: tools.filterLatest
		}
	],
	answers: tools._.curry( processAnswers )
};

function processAnswers( context, done, answers ){
	if ( ! answers.useComposer ) {
		context.install.composer = false;
		return done();
	}
	if ( ! answers.composerInApp ) {
		context.install['composer-in-app'] = false;
	}
	if ( answers.keywords ) {
		context.install.composer.keywords = answers.keywords.split( ',' )
			.map( Function.prototype.call, String.prototype.trim );
	}
	if ( answers.wpVersion !== '*' ) {
		context.install.composer.require['johnpbloch/wordpress'] = answers.wpVersion;
	}
	done();
}
