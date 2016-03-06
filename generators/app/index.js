'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');


module.exports = yeoman.Base.extend({
	description: 'testing 1 2 3',
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
	_filterNames: function( name ) {
		return ( 'vvv:' === name.substr( 0, 4 ) && 'vvv:app' !== name );
	},
	_mapNames: function( name ) {
		var desc = this.env.get( name ).prototype.description,
			opt = chalk.green.bold( name );
		if ( desc ) {
			opt += "\n    " + desc;
		}
		return { name: opt, value: name };
	},
	allowRun: function(){}
});
