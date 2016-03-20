'use strict';
var Base = require( '../../lib/base' );
var path = require( 'path' );
var Promise = require( 'bluebird' );

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
		var pulls = this.arguments.map( this._getPull.bind( this ) );

		Promise.all( pulls ).then( done );
	},
	_getPull: function( pull ) {
		if ( this.pullMap[ pull ] ) {
			return this[ this.pullMap[ pull ] ]();
		} else {
			return false;
		}
	},
	_doDownload: function( def, dest ) {
		var location, options;
		if ( 'string' === typeof def ) {
			location = def;
			options = {};
		} else if ( 'object' === typeof def ) {
			location = def.location;
			options = def.options;
		}

		if ( location && 'object' === typeof options ) {
			return this.download( location, dest, options );
		}
	},
	_getUploads: function() {
		if ( this.install.uploads ) {
			return this._doDownload(
				this.install.uploads,
				this.getAppPath( 'content-path')
			);
		}
	},
	_getSQL: function() {
		if ( this.install.database ) {
			return this._doDownload(
				this.install.database,
				this.destinationPath( path.join( 'config', 'data' ) )
			);
		}
	},
	allowRun: function(){}
});
