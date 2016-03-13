var tools = require( '../util/prompt-tools' );

module.exports = {
	questions: [
		{
			name: 'name',
			message: 'The project name is (typically namespace/project):',
			filter: tools.stripChars( /[^a-zA-Z0-9_\-\/]/g, false ),
			validate: tools.notEmpty
		},
		{
			name: 'title',
			message: 'The project title is:',
			validate: tools.notEmpty
		},
		{
			name: 'description',
			message: 'The project description is:'
		},
		{
			name: 'localUrl',
			message: 'The local URL will be (ex. project.dev):',
			validate: tools.notEmpty
		},
		{
			name: 'remoteUrl',
			message: 'The remote URL is (ex. project.com, blank for none):'
		},
		{
			name: 'homepage',
			message: 'The homepage for this project is at:'
		},
		{
			name: 'dbName',
			message: 'The database name for this site will be:',
			default: tools.stripChars( /[^a-zA-Z0-9_]/g, 'localUrl' )
		},
		{
			type: 'confirm',
			name: 'multisite',
			message: 'This will be a Multisite Install:'
		},
		{
			when: tools.makeWhen( true, 'multisite' ),
			type: 'confirm',
			name: 'subdomain',
			message: 'This will be a Subdomain Multisite:'
		},
		{
			when: tools.makeWhen( true, 'subdomain' ),
			name: 'subdomains',
			message: 'Add subdomains (comma separated):'
		}
	],
	answers: tools._.curry( processAnswers )
};

function processAnswers( context, done, answers ){
	tools._.assign(
		context.install,
		tools._.pick( answers, [ 'name', 'title', 'description', 'homepage' ] )
	);
	context.install.site = { constants: { DB_NAME: answers.dbName } };
	context.install.server = { local: answers.localUrl };
	if ( answers.remoteUrl ) {
		context.install.server.remote = answers.remoteUrl;
	}
	if ( answers.multisite ) {
		context.install.site.base = '/';
		context.install.site.constants.MULTISITE = true;
		context.install.site.constants.SUBDOMAIN_INSTALL = answers.subdomain;
		context.install.site.constants.DOMAIN_CURRENT_SITE = answers.localUrl;
		context.install.site.constants.PATH_CURRENT_SITE = '/';
		context.install.site.constants.SITE_ID_CURRENT_SITE = 1;
		context.install.site.constants.BLOG_ID_CURRENT_SITE = 1;
	}
	if ( answers.subdomain ) {
		context.install.server.subdomains = answers.subdomains.split( ',' )
			.map( Function.prototype.call, String.prototype.trim );
	}
	done();
}