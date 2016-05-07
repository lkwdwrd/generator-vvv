/**
 * This file contains helpers for downloading files with MC-Download.
 *
 * This allows for streams-based downloads in parallel over either http or scp.
 * It also provides binding so that the downloads use the yeoman adapter as the
 * ouptut adapter for better mixing with non-cli environments.
 */

// Require Dependencies
var _ = require( 'lodash' );
var path = require( 'path' );
var Download = require( 'mc-download' );
var debug = require('debug')('generator-vvv');

/**
 * Download files from a single MC-Download channel.
 *
 * @param  {String|Array} location A path, url, or array of paths/urls 
 * @param  {String}       dest     The destiantion folder for the files.
 * @param  {Object}       opts     The options for this download.
 * @param  {Function}     cb       Optional callback after the download.
 * @return {Promise}               A promise that can be `.then()`ed.
 */
function download( location, dest, opts, cb ) {
	var installName = ( this.install ) ? this.install.name : 'bootstrap';
	dest = _normalizePath.call( this, dest );
	opts = _.assign( { type: 'http' }, opts || {}, this.options );
	opts.adapter = _getAdapter.call( this, opts );
	opts = _mixRC.call( this, opts, opts.type, installName );

	return Download.download(location, dest, opts, cb );
}

/**
 * Download files from multiple MC-Download channels at once.
 *
 * @param  {Array}    locations An array of MC-Download definitions.
 * @param  {Object}   opts      MC-Download multiDownload options object.
 * @param  {Function} cb        An optional callback after downloading all.
 * @return {Promise}            A promise that can be `.then()`ed.
 */
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

/**
 * Helper function to bind MC Download to the yeoman environment's adapter.
 *
 * @param  {Object}  opts MC Download adapter options.
 * @return {Adapter}      An MC Download adapter object.
 */
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

/**
 * Mixes RC data for scp downloads into the download options.
 *
 * @param  {Object} opts        The MC Download options object.
 * @param  {String} type        The download type.
 * @param  {String} installName The specific install name if available.
 * @return {Object}             The options object with the rc data mixed in.
 */
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

/**
 * If the passed destination is not an aboslute path, sends it to the site dest.
 *
 * @param  {String} dest The destination to download the file to.
 * @return {String}      The normalized destination path.
 */
function _normalizePath( dest ) {
	if ( ! path.isAbsolute( dest ) ) {
		return this.destinationPath( dest );
	}
	return dest;
}

// Export these methods to mix with the base object prototype.
module.exports = {
	download: download,
	multiDownload: multiDownload
};
