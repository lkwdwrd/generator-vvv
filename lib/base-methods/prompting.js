// Require dependencies
var path = require( 'path' );

function getPrompt( promptName ) {
	try {
		return require( path.join( __dirname, '../prompts', promptName + '.js' ) );
	} catch( e ) {
		return { questions: [], answers: function(){} };
	}
}

function wrapDone( func ) {
	return function _doneWrapped( done ) {
		func.call( this );
		done();
	}.bind( this );
}

module.exports = {
	getPrompt: getPrompt,
	wrapDone: wrapDone
};
