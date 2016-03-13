var _ = require( 'lodash' );
var inquirer = require( 'inquirer' );
var chalk = require( 'chalk' );

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

function makeWhen( test, key, present ) {
	if ( 'object' !== typeof test || ! test instanceof Array ) {
		test = [ test ];
	}
	present = !present;
	return function _when( answers ) {
		if ( present ) {
			return -1 !== test.indexOf( answers[ key ] );
		} else {
			return -1 === test.indexOf( answers[ key ] );
		}
	};
}

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

function notEmpty( value ) {
	return !!value;
}

function filterLatest( input ) {
	return ( 'latest' === input ) ? '*' : input;
}

function filterToUndef( val ) {
	return ( val ) ? val : undefined;
}