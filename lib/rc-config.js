'use strict';

var rcFetch = require( 'rc' );
var NPromise = require( 'promise' );
var writeFile = NPromise.denodeify( require( 'fs' ).writeFile );
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
	this._localPath = join( process.cwd(), this.rcname );
	this._globalPath = join( home, this.rcname );
	this.refresh();
}

/**
 * Gets a single value stored in the context requested.
 *
 * @param  {string} key     The key to return from the object.
 * @param  {string} context The context of the object to use, global, local, or rc.
 * @return {mixed}          Whatever is stored at the key in the requested context.
 */
RC.prototype.get = function( key, context ) {
	if ( 'global' === context ) {
		return this._globalValues[ key ];
	} else if ( 'local' === context ) {
		return this._localValues[ key ];
	} else {
		return this.values[ key ];
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
		return this._globalValues;
	} else if ( 'local' === context ) {
		return this._localValues;
	} else {
		return this.values;
	}
};

/**
 * Refresh the current RC values this object represents.
 */
RC.prototype.refresh = function() {
	this.values = rcFetch( this.appname, this._defaults );
	try {
		this._globalValues = require( this._globalPath );
	} catch( e ) {
		this._globalValues = {};
	}
	try {
		this._localValues = require( this._localValues );
	} catch( e ) {
		this._localValues = {};
	}
};


/**
 * Save the RC file to disk.
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
 * Assign a key to a value and save the file.
 *
 * @param {String}    key    The key under which the value is stored.
 * @param {mixed}     val    Any valid JSON type value (String, Number, Array, Object).
 * @param  {bool}     global Whether or not to affect the local or global rcfile.
 * @return {Function}        A promise passed the result of the save.
 */
RC.prototype.set = function ( key, val, global ) {
	if ( true === global ) {
		this._globalValues[ key ] = val;
	} else {
		this._localValues[ key ] = val;
	}
	return this._save( global ).then( this.refresh.bind( this ) );
};

/**
 * Delete a key from the store and save.
 *
 * @param  {String}    key    The key to remove from storage.
 * @param  {bool}      global Whether or not to affect the local or global rcfile.
 * @return {Function}         A promise passed the result of the save.
 */
RC.prototype.delete = function ( key, global ) {
	if ( true === global ) {
		delete this._globalValues[ key ];
	} else {
		delete this._localValues[ key ];
	}
	return this._save( global ).then( this.refresh.bind( this ) );
};

/**
 * Reset the stored values with a new set or clear the values entirely.
 *
 * @param  {mixed} vals   The new values to store.
 * @param  {bool}  global Whether or not to affect the local or global rcfile.
 * @return {Function}     A promise passed the result of the save.
 */
RC.prototype.reset = function( vals, global ) {
	if ( true === global ) {
		this._globalValues = ( 'object' === typeof vals ) ? vals : {};
	} else {
		this._localValues = ( 'object' === typeof vals ) ? vals : {};
	}
	return this._save( global ).then( this.refresh.bind( this ) );
};
