var tools = require( '../util/prompt-tools' );

var advConstants = {
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

function processAnswers( context, done, answers ){
	if ( ! answers.add ) {
		return done();
	}

	context.install.site.constants[ answers.key ] = answers.value;
	context.prompt( advConstants.questions, advConstants.answers( context, done ) );
}

module.exports = advConstants;
