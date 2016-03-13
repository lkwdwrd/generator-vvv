var tools = require( '../util/prompt-tools' );

var advSite = {
	questions: [
		{
			name: 'prefix',
			message: 'The database prefix should is:',
			default: 'wp_'
		},
		{
			name: 'adminUser',
			message: 'The admin user should be:',
			default: 'admin'
		},
		{
			name: 'adminPass',
			message: 'The admin password should be:',
			default: 'password'
		},
		{
			name: 'adminEmail',
			message: 'The admin email should be:',
		},
		{
			type: 'confirm',
			name: 'externalEnv',
			message: 'The .env file should be outside of app/:',
			default: false
		}
	],
	answers: tools._.curry( processAnswers )
};

function processAnswers( context, done, answers ) {
	if ( answers.prefix !== 'wp_' ) {
		context.install.site.prefix = answers.prefix;
	}
	if ( answers.adminUser !== 'admin' ) {
		context.install.site['admin-user'] = answers.adminUser;
	}
	if ( answers.adminPass !== 'password' ) {
		context.install.site['admin-pass'] = answers.adminPass;
	}
	if ( answers.adminEmail !== advSite.adminEmail ) {
		context.install.site['admin-email'] = answers.adminEmail;
	}
	if ( answers.externalEnv ) {
		context.install.site['external-env'] = true;
	}
	done();
}

module.exports = advSite;
