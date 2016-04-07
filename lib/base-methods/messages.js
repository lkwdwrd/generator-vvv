// Require dependencies
var chalk = require( 'chalk' );

/**
 * Outputs a welcome message to thank users for trying WP Make.
 *
 * @param  {Function} done The function to continue generation.
 * @return {void}
 */
function welcomeMessage( done ) {
	this.log(
		chalk.magenta( 'Thanks for creating with ' ) +
		chalk.cyan.bold( 'Generator VVV' ) +
		chalk.magenta( '!' )
	);
	done();
}
/**
 * Outputs a goodbye message to let users know generation is complete.
 *
 * @param  {Function} done The function to continue generation.
 * @return {void}
 */
function goodbyeMessage( done ) {
	this.log( chalk.green.bold( 'All done!' ) );
	if ( this.goodbyeText ) {
		this.log( this.goodbyeText );
	}
	done();
}

module.exports = {
	welcomeMessage: welcomeMessage,
	goodbyeMessage: goodbyeMessage
};
