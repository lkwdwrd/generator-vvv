/**
 * The main generator VVV object.
 * 
 * This simply lists the available subgenerators and allows you to trigger one
 * through an inquirer prompt. The optiosn are built dynamically and
 * descriptions for each are stored as a property on the generators themselves.
 */

'use strict';

//Require dependencies.
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

// Export the generator base.
module.exports = yeoman.Base.extend({
	/**
	 * A custom constructor for gathering available subgenerators and presenting
	 * them in an inquirer prompt.
	 *
	 * @return {Generator} A yeoman generator object. 
	 */
	constructor: function () {
		yeoman.Base.apply( this, arguments );
		var done = this.async(),
			choices = Object.keys( this.env.store._meta )
			.filter( this._filterNames.bind( this ) )
			.map( this._mapNames.bind( this ) );
		// replace it with a short and sweet description of your generator
		this.prompt( [ {
			type: 'list',
			name: 'generator',
			message: chalk.magenta( 'Choose a subgenerator to get started!' ),
			choices: choices
		} ],
		function( answers ) {
			this.env.run( answers.generator );
			done();
		}.bind( this ) );
	},
	/**
	 * Filter names to grab all available sub-generators without 'vvv:'.
	 *
	 * @param  {String} name The name of the subgenerator to filter.
	 * @return {String}      The filtered generator name stripped of 'vvv:'.
	 */
	_filterNames: function( name ) {
		return ( 'vvv:' === name.substr( 0, 4 ) && 'vvv:app' !== name );
	},
	/**
	 * Maps generator objects into an options object used for prompting.
	 *
	 * @param  {String} name The name of the generator being processed.
	 * @return {Object}      The prompt object for the passed subgenerator.
	 */
	_mapNames: function( name ) {
		var desc = this.env.get( name ).prototype.description,
			opt = chalk.green.bold( name );
		if ( desc ) {
			opt += "\n    " + desc;
		}
		return { name: opt, value: name };
	},
	/**
	 * A noop since to trick Yeoman into running this generator with no methods.
	 *
	 * @return {void}
	 */
	allowRun: function(){}
});
