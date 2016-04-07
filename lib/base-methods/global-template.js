var path = require( 'path' );

function globalSourceRoot() {
	return path.join( __dirname, '..', 'templates' );
}
function globalTemplatePath( relPath ) {
	return path.resolve( path.join( this.globalSourceRoot(), relPath ) );
}
function globalTemplate( src, dest, data, options ) {
	if ('string' !== typeof dest ) {
		options = data;
		data = dest;
		dest = src;
	}
	this.fs.copyTpl(
		this.globalTemplatePath( src ),
		this.destinationPath( dest ),
		data,
		options
	);
}
function globalCopy( src, dest, options ) {
	if ('string' !== typeof dest ) {
		options = dest;
		dest = src;
	}
	this.fs.copy(
		this.globalTemplatePath( src ),
		this.destinationPath( dest ),
		options
	);
}

module.exports = {
	globalSourceRoot: globalSourceRoot,
	globalTemplatePath: globalTemplatePath,
	globalTemplate: globalTemplate,
	globalCopy: globalCopy
};
