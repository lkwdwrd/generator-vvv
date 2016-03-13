var tools = require( '../util/prompt-tools' );

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