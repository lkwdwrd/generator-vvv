var _ = require( 'lodash' );
var path = require( 'path' );
var Base = require( '../../lib/base' );

module.exports = Base.extend({
	pullMap: {
		'uploads': '_getUploads',
		'db': '_getSQL',
	},
	_initialize: function() {
		this.addRunMethod(
			'pull',
			this._doPull,
			'default'
		);
	},
	_doPull: function( done ) {
		var pulls = _.remove( this.arguments.map( this._getPull, this ) );

		this.multiDownload( pulls )
			.then( done )
			.catch( function( err ){
				this.log( err.message );
				process.exit( 0 );
			}.bind( this ));
	},
	_getPull: function( pull ) {
		if ( this.pullMap[ pull ] ) {
			return this[ this.pullMap[ pull ] ]();
		} else {
			return false;
		}
	},
	_getUploads: function() {
		var uploads = false;
		if ( this.install.uploads ) {
			if ( 'string' === typeof this.install.uploads ) {
				uploads = { location: this.install.uploads };
			} else {
				uploads = _.clone( this.install.uploads );
			}
			uploads.dest = this.getAppPath( 'content-path', 'app', 'uploads' );
			uploads.opts = uploads.opts || {};
			uploads.opts.extract = { strip: 1 };
		}
		return uploads;
	},
	_getSQL: function() {
		var database = false;
		if ( this.install.database ) {
			if ( 'string' ===  typeof this.install.database ) {
				database = { location: this.install.database };
			} else {
				database = _.clone( this.install.database );
			}
			database.dest = path.join( 'config', 'data' );
		}
		return database;
	},
	allowRun: function(){}
});
