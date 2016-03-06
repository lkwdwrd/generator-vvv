/*!
 * Originally from Derrick CLI
 *
 * 10up <sales@10up.com>
 * John Bloch <john.bloch@10up.com>
 * Eric Mann <eric.mann@10up.com>
 * Luke Woodward <luke.woodward@10up.com>
 *
 * MIT License.
 */

'use strict';

/**
 * Module dependencies.
 */
var request = require( 'request' ),
	ProgressBar = require( 'progress' ),
	fs = require( 'fs' ),
	path = require( 'path' ),
	stream = require( 'stream' ),
	url = require( 'url' ),
	NPromise = require( 'promise' );

/**
 * Downloader method
 *
 * @type {downloadFile}
 */
module.exports = downloadFile;

/**
 * Get the destination as a Writable Stream
 * @param {*} destination
 * @return {stream.Writable}
 */
function destinationAsStream( destination ) {
	var destStream;
	if ( 'string' === typeof destination ) {
		destStream = fs.createWriteStream( destination, {flags: 'wx+'} );
	} else if ( destination instanceof stream.Writable ) {
		destStream = destination;
	} else {
		throw new TypeError( 'destination must be either a writable stream or string!' );
	}
	return destStream;
}

/**
 * Download the file to a destination
 *
 * @param {String} from
 * @param {stream.Writable|String} to
 * @returns {NPromise}
 */
function downloadFile( from, to ) {
	return new NPromise( function ( fulfill, reject ) {
		try {
			to = destinationAsStream( to );
		} catch ( e ) {
			reject( e );
		}
		to.on( 'error', reject );
		to.on( 'finish', function () {
			fulfill( to.path );
		} );
		var parsedUrl = url.parse( from ),
			opts = {
				hostname: parsedUrl.hostname,
				path    : parsedUrl.path
			};

		if ( parsedUrl.port ) {
			opts.port = parsedUrl.port;
		}

		if ( parsedUrl.auth ) {
			opts.auth = parsedUrl.auth;
		}

		// Set up the request
		var req = request.get( from );

		// Reject the promis on any errors
		req.on( 'error', reject );

		// Set up a progress bar so we know how things are going
		req.on( 'response', function( response ) {
			var contentLength = parseInt( response.headers['content-length'], 10 );
			if ( ! contentLength || isNaN( contentLength ) ) {
				return;
			}

			process.stdout.write( '\n' ); // Blank line before the progress bar

			var bar = new ProgressBar( '  Download: ' + path.basename( from ) + ' [:bar] :percent :etas', {
				complete: '=',
				incomplete: ' ',
				width: 16,
				total: contentLength
			} );

			response.on( 'data', function( chunk ) {
				bar.tick( chunk.length );
			} );

			response.on( 'end', function() {
				process.stdout.write( '\n' ); // Blank line after the progress bar
			} );
		} );

		// Pipe the data to the new location
		req.pipe( to );
	} );
}