/**
 * A wrapper around the 'rc' module to also support writing to an RC file.
 */

'use strict';

// Require dependencies.
var rcFetch = require( 'rc' );
var _ = require( 'lodash' );
var ini = require( 'ini' );
var fs = require( 'fs' );
var Promise = require( 'bluebird' );
var writeFile = Promise.promisify( fs.writeFile );
var join = require( 'path' ).join;
var home = ( process.platform === "win32" ) ? process.env.USERPROFILE : process.env.HOME;

/**
 * Factory method to create a new RC object and return it.
 *
 * @param  {String} appname The name of the new storage
 * @param  {String} level   Whether to store globally (per user) or locally.
 * @return {RC}             The constructed RC object.
 */
module.exports = function( appname, defaults ) {
	return new RC( appname, defaults );
};

/**
 * Storage instances handle a json rc file saving.
 *
 * @constructor
 * @param {String} appname The name of the new storage
 * @param {String} level   Whether to store globally (per user) or locally.
 */
function RC( appname, defaults ) {
	this.appname = appname;
	this.rcname = '.' + appname + 'rc';
	this._defaults = ( 'object' === typeof defaults ) ? defaults : {};
	this._globalPath = join( home, this.rcname );
	this.refresh();
}

/**
 * Gets a single value stored in the context requested.
 *
 * @param  {string} key     The key to return from the object.
 * @param  {string} context The context of the object, global, local, or rc.
 * @return {mixed}          Whatever is stored at the key in context.
 */
RC.prototype.get = function( key, context ) {
	if ( 'global' === context ) {
		return _.get( this._globalValues, key );
	} else if ( 'local' === context ) {
		return _.get( this._localValues, key );
	} else {
		return _.get( this.values, key );
	}
};

/**
 * Gets all of the values stored in the requested context.
 *
 * @param  {string} context The context to get, global, local, or rc.
 * @return {Object}         All of the values in the requested context.
 */
RC.prototype.getAll = function( context ) {
	if ( 'global' === context ) {
		return _.clone( this._globalValues );
	} else if ( 'local' === context ) {
		return _.clone( this._localValues );
	} else {
		return _.omit( _.clone( this.values ), [ '_', 'config', 'g' ] );
	}
};

/**
 * Refresh the current RC values this object represents.
 *
 * @return {void}
 */
RC.prototype.refresh = function() {
	this.values = rcFetch( this.appname, this._defaults );
	this._localPath = join( process.cwd(), this.rcname );
	try {
		var gContent = fs.readFileSync( this._globalPath );
		if( /^\s*{/.test( gContent ) ) {
			this._globalValues = JSON.parse( gContent );
		} else {
			this._globalValues = ini.parse( gContent );
		}
	} catch( e ) {
		this._globalValues = {};
	}
	try {
		var lContent = fs.readFileSync( this._localPath );
		if( /^\s*{/.test( lContent ) ) {
			this._localValues = JSON.parse( lContent );
		} else {
			this._localValues = ini.parse( lContent );
		}
	} catch( e ) {
		this._localValues = {};
	}
};


/**
 * Saves the RC file to disk.
 *
 * @return {Function} A promise passed the result of the save.
 */
RC.prototype._save = function( global ) {
	var rcValues = ( true === global ) ? this.getAll( 'global' ) : this.getAll( 'local' ),
		rcPath = ( true === global ) ? this._globalPath : this._localPath;
	return writeFile(
		rcPath,
		JSON.stringify( rcValues, null, "\t" ),
		{ mode: parseInt( '0600', 8 ) }
	);
};

/**
 * Assign a key to a value and optionally saves the file.
 *
 * @param {String}    key    The key under which the value is stored.
 * @param {mixed}     val    Any valid JSON type value (not a function).
 * @param  {bool}     global Affect the local or global rcfile.
 * @param  {bool}     save   Whether to automatically save the config to file.
 * @return {Function}        A promise passed the result of the save.
 */
RC.prototype.set = function ( key, val, global, save ) {
	if ( true === global ) {
		_.set( this._globalValues, key, val );
	} else {
		_.set( this._localValues, key, val );
	}

	if ( false !== save ) {
		return this._save( global )
			.then( this.refresh.bind( this ) )
			.then( _.constant( key ) );
	} else {
		return Promise.resolve( key );
	}
};

/**
 * Delete a key from the store and optionally saves it.
 *
 * @param  {String}   key    The key to remove from storage.
 * @param  {bool}     global Affect the local or global rcfile.
 * @param  {bool}     save   Whether to automatically save the config to file.
 * @return {Function}        A promise passed the result of the save.
 */
RC.prototype.delete = function ( key, global, save ) {
	var vals = ( true === global ) ? this._globalValues : this._localValues;
	if ( _.has( vals, key ) ) {
		_.unset( vals, key );
	} else {
		return Promise.reject( key );
	}

	if ( false !== save ) {
		return this._save( global )
			.then( this.refresh.bind( this ) )
			.then( _.constant( key ) );
	} else {
		return Promise.resolve( key );
	}
};

/**
 * Reset the stored values with a new set or clear the values entirely.
 *
 * @param  {mixed}    vals   The new values to store.
 * @param  {bool}     global Affect the local or global rcfile.
 * @param  {bool}     save   Whether to automatically save the config to file.
 * @return {Function}        A promise passed the result of the save.
 */
RC.prototype.reset = function( vals, global, save ) {
	vals = ( 'object' === typeof vals ) ? vals : {};
	if ( true === global ) {
		this._globalValues = vals;
	} else {
		this._localValues = vals;
	}

	if ( false !== save ) {
		return this._save( global )
			.then( this.refresh.bind( this ) )
			.then( _.constant( vals ) );
	} else {
		return Promise.resolve( vals );
	}
};
