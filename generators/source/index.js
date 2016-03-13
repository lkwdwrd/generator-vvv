var Base = require( '../../lib/base' );
var inquirer = require( 'inquirer' );
var chalk = require( 'chalk' );

module.exports = Base.extend({
	_compose: function() {
		this.composeWith( 'vvv:dump', { arguments: [ 'manifest' ] } );
		this.composeWith( 'vvv:dump-task', { arguments: [ 'src' ] } );
	},
	prompting: function() {
		var done = this.async(),
			prompts = [
				{
					type: 'list',
					name: 'type',
					message: 'This source is a:',
					choices: [
						{
							name: 'Git Repository',
							value: 'git'
						},
						{
							name: 'Subversion Repository',
							value: 'svn'
						},
						new inquirer.Separator(),
						{
							name: 'No more, I\'m done',
							value: 'done'
						}
					]
				},
				{
					when: makeWhen( 'done', 'type', true ),
					type: 'list',
					name: 'map',
					message: 'This repository contains a:',
					choices: [
						{
							name: 'Site Root',
							value: 'root'
						},
						{
							name: 'Content Folder',
							value: 'content'
						},
						{
							name: 'WP Plugin',
							value: 'plugin'
						},
						{
							name: 'WP Theme',
							value: 'theme'
						},
						{
							name: 'WP MU Plugin',
							value: 'muplugin'
						},
						{
							name: 'A Dropin Plugin',
							value: 'dropin'
						},
						{
							name: 'VIP Resource',
							value: 'vip'
						},
						{
							name: 'Plugins Folder',
							value: 'plugins-folder'
						},
						{
							name: 'Themes Folder',
							value: 'themes-folder'
						},
						{
							name: 'MU Plugins Folder',
							value: 'mu-plugins-folder'
						}
					]
				},
				{
					when: makeWhen( 'done', 'type', true ),
					name: 'url',
					message: 'The repository URL is:'
				},
				{
					when: makeWhen( [ 'theme', 'plugin', 'muplugin' ], 'map' ),
					filter: filterName,
					name: 'name',
					message: 'The name in the composer.json file is (blank if none):'
				},
				{
					when: makeWhen( undefined, 'name', true ),
					name: 'stable',
					message: 'The stable version of this source is:'
				},
				{
					when: makeWhen( 'done', 'type', true ),
					type: 'confirm',
					name: 'confirmed',
					message: 'Alright, I got it. Is everything correct?'
				}
			];

		function processAnswers( answers ) {
			if ( 'done' === answers.type ) {
				return done();
			}

			if ( ! answers.confirmed ) {
				this.log( chalk.red.bold( 'OK, let\'s try again.' ) );
				this.prompt( prompts, processAnswers.bind( this ) );
			} else {
				delete answers.confirmed;
			}

			if ( !answers.name ) {
				delete answers.name;
			}

			this.install.src.push( answers );

			this.log( chalk.green.bold( 'All right, your source has been noted!' ) );
			this.log( chalk.magenta( 'Want to add another?' ) );
			this.prompt( prompts, processAnswers.bind( this ) );
		}
		function filterName( val ) {
			return ( val ) ? val : undefined;
		}
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

		this.log( chalk.magenta.bold( 'Let\'s add some sources!' ) );
		this.prompt( prompts, processAnswers.bind( this ) );
	}
});
