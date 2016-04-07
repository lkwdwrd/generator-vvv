// Require dependencies
var _ = require( 'lodash' );
var path = require( 'path' );

function setUpAppPaths( done ) {
	this.appPaths = this.appPaths || {};
	// Set up path maps
	_.assign( this.appPaths, _.defaults( _.clone( this.install['app-paths'] || {} ), {
		'composer-path': '.',
		'vendor-dir': 'vendor',
		'wp-path': 'wp',
		'content-path': 'wp-content',
		'root': '.'
	} ) );
	this.appPaths['theme-path'] = path.join( this.appPaths['content-path'], 'themes' );
	this.appPaths['plugin-path'] = path.join( this.appPaths['content-path'], 'plugins' );
	this.appPaths['mu-plugin-path'] = path.join( this.appPaths['content-path'], 'mu-plugins' );
	done();
}

function getAppPath( name, root, additional ) {
	root = root || '.';
	additional = additional || '.';
	return path.normalize( path.join( root, this.appPaths[ name ], additional ) );
}

module.exports = {
	setUpAppPaths: setUpAppPaths,
	getAppPath: getAppPath
};
