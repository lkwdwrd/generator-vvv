var _ = require( 'lodash' );
var path = require( 'path' );
var Download = require( 'mc-download' );
var debug = require('debug')('generator-vvv');

function download( location, dest, opts, cb ) {
	var installName = ( this.install ) ? this.install.name : 'bootstrap';
	dest = _normalizePath.call( this, dest );
	opts = _.assign( { type: 'http' }, opts || {}, this.options );
	opts.adapter = _getAdapter.call( this, opts );
	opts = _mixRC.call( this, opts, opts.type, installName );

	return Download.download(location, dest, opts, cb );
}

function multiDownload( locations, opts, cb ) {
	var i, length, installName = ( this.install ) ? this.install.name : false;
	for ( i = 0, length = locations.length; i < length; i++ ) {
		locations[ i ].dest = _normalizePath.call( this, locations[ i ].dest );
		locations[ i ].opts = locations[ i ].opts || {};
		locations[ i ].opts.adapter = _getAdapter.call( this, locations[ i ].opts );
		locations[ i ].opts = _mixRC.call(
			this,
			locations[ i ].opts,
			locations[ i ].opts.type,
			installName
		);
	}
	return Download.multi( locations, opts, cb );
}

function _getAdapter( opts ) {
	var adapter;
	adapter = new Download.Adapter( _.assign(
		opts || {},
		{
			prompt: this.prompt.bind( this ),
			log: this.env.adapter.log
		}
	) );
	if ( ! adapter.log.debug ) {
		adapter.log.debug = debug;
	}

	return adapter;
}

function _mixRC( opts, type, installName ) {
	if ( 'scp' === type ) {
		if ( installName ) {
			_.defaults(
				opts,
				this.rcConfig.get( 'scp-' + installName ) || {}
			);
		}
		_.defaults(
			opts,
			this.rcConfig.get( 'scp' ) || {}
		);
	}
	return opts;
}

function _normalizePath( dest ) {
	if ( ! path.isAbsolute( dest ) ) {
		return this.destinationPath( dest );
	}
	return dest;
}

module.exports = {
	download: download,
	multiDownload: multiDownload
};
