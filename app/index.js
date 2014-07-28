'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');


var VVVGenerator = yeoman.generators.Base.extend({
	notify: function () {
		// replace it with a short and sweet description of your generator
		this.log(chalk.magenta('Invoke a subgenerator to get started!'));
		this.log('Available Modules:');
		this.log('');
		this.log(chalk.green.bold('\tyo vvv:json'));
		this.log('\tCreate a vvv.json file.');
		this.log('');
		this.log(chalk.green.bold('\tyo vvv:bootstrap'));
		this.log('\tRun a site setup from a vvv.json file.');
		this.log('');
		this.log(chalk.green.bold('\tyo vvv:create'));
		this.log('\tCreate a site setup and run it.');
		this.log('');
	},
});

module.exports = VVVGenerator;