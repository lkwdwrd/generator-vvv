var tools = require( '../util/prompt-tools' );

var advEnv = {
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

function processAnswers( context, done, answers ){
	if ( ! answers.add ) {
		return done();
	}

	if ( ! context.install.site.env ) {
		context.install.site.env = {};
	}

	context.install.site.env[ answers.key ] = answers.value;
	context.prompt( advEnv.questions, advEnv.answers( context, done ) );
}

module.exports = advEnv;
