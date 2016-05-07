/**
 * Helpers for getting and processing global prompts.
 */

// Require dependencies.
var path = require( 'path' );

/**
 * Gets a global prompt object out of the centralized prompts directory.
 *
 * @param  {String} promptName The name of the prompts to get.
 * @return {Object}            The object containing the prompts.
 */
function getPrompt( promptName ) {
	try {
		return require( path.join( __dirname, '../prompts', promptName + '.js' ) );
	} catch( e ) {
		return { questions: [], answers: function(){} };
	}
}

/**
 * Closures a function so automatically calls `done()` after execution.
 *
 * @param  {Function} func The function to wrap.
 * @return {Function}      The closured function.
 */
function wrapDone( func ) {
	/**
	 * Calls the closured `func` and then the passed `done()` method.
	 *
	 * @param  {Function} done Indicator to continue generation.
	 * @return {void}
	 */
	return function _doneWrapped( done ) {
		func.call( this );
		done();
	}.bind( this );
}

// Export these methods to mix with the base object prototype.
module.exports = {
	getPrompt: getPrompt,
	wrapDone: wrapDone
};
