/**
 * Export a tools object to assist in dealing with Inquierer style prompts.
 */

'use strict';

// Require dependencies.
var _ = require( 'lodash' );
var inquirer = require( 'inquirer' );
var chalk = require( 'chalk' );

// Export the inquiry helpers for use in prompting.
module.exports = {
	_: _,
	inquirer: inquirer,
	chalk: chalk,
	makeWhen: makeWhen,
	stripChars: stripChars,
	notEmpty: notEmpty,
	filterLatest: filterLatest,
	filterToUndef: filterToUndef
};


/**
 * Creates a function to be used in a 'when' promt definition.
 *
 * By default tests to see if an aswer at 'key' is present in 'test'. Test can
 * be a value or an array of values to test against. If present is set to false,
 * the returned when method will check to see if the answer at 'key' _is not_
 * present in with the value of test or array of test values.
 *
 * @param  {mixed}   test    A value or array of values to test against.
 * @param  {String}  key     The answer key to check against test.
 * @param  {Boolean} present Whether or not to test the presence or lack in key.
 * @return {Function}          The 'when' function to use when querying.
 */
function makeWhen( test, key, present ) {
	if ( 'object' !== typeof test || ! test instanceof Array ) {
		test = [ test ];
	}
	present = !present;
	/**
	 * A function to test for values or lack of values in an answers object.
	 *
	 * @param  {Object}  answers An object of current answers.
	 * @return {Boolean}         Whether or not the test passses.
	 */
	return function _when( answers ) {
		if ( present ) {
			return -1 !== test.indexOf( answers[ key ] );
		} else {
			return -1 === test.indexOf( answers[ key ] );
		}
	};
}

/**
 * Strip characters out of a specific answer key using a regexp.
 *
 * @param  {RegExp} regexp The regular expression to match with.
 * @param  {String} key    The answer key that should be stripped.
 * @return {Object}        The answers object with the characters stripped.
 */
function stripChars( regexp, key ) {
	return function _stripChars( answers ) {
		var answer = ( ! key ) ? answers : answers[ key ];
		if ( 'string' === typeof answer ) {
			return answer.replace( regexp, '' );
		} else {
			return answers;
		}
	};
}

/**
 * A simple helper to ensure a value is not empty.
 *
 * @param  {Mixed}   value The value to test.
 * @return {Boolean}       Whether or not the value is empty.
 */
function notEmpty( value ) {
	return !!value;
}

/**
 * A helper to filter 'latest' values into '*' values.
 *
 * @param  {String} input The input value to filter.
 * @return {String}       If input is latest, '*', or this is a pass through.
 */
function filterLatest( input ) {
	return ( 'latest' === input ) ? '*' : input;
}

/**
 * A helper to filter falsey values to be strictly 'undefined'.
 *
 * @param  {Mixed} val The value to filter.
 * @return {Mixed}     The original value if truthy, or 'undefined'.
 */
function filterToUndef( val ) {
	return ( val ) ? val : undefined;
}
