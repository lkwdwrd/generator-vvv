var Base = require( '../../lib/base' );
var inquirer = require( 'inquirer' );
var chalk = require( 'chalk' );
var path = require( 'path' );

module.exports = Base.extend({
	_compose: function() {
		this.composeWith( 'vvv:dump', { arguments: [ 'manifest', 'composer' ] } );
	},
	prompting: function() {
		if ( ! this.install.composer ) {
			this.log(
				chalk.yellow.bold( "I can't add requirements:\n" ) +
				chalk.yellow( "I use composer to control requirements and it is " ) +
				chalk.yellow.bold( "turned off." )
			);
			return;
		}
		var done = this.async(),
			prompts = [
				{
					type: 'list',
					name: 'type',
					message: 'This dependency is a:',
					choices: [
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
					name: 'source',
					message: 'This dependency is:',
					choices: [
						{
							name: 'In the .org repository.',
							value: 'wpackagist'
						},
						{
							name: 'Version controlled (git or svn).',
							value: 'vcs'
						},
						{
							name: 'In the packagist repository.',
							value: 'packagist'
						},
						{
							name: 'In a zip file or tar ball.',
							value: 'ziptar'
						}
					]
				},
				{
					when: makeWhen( 'wpackagist', 'source' ),
					name: 'slug',
					message: 'The .org slug is:'
				},
				{
					when: makeWhen( [ 'vcs', 'ziptar' ], 'source' ),
					name: 'url',
					message: 'The dependency URL is:',
				},
				{
					when: makeWhen( 'vcs', 'source' ),
					type: 'confirm',
					name: 'hasJSON',
					message: 'The repository contains a composer.json file:'
				},
				{
					when: makeWhen( [ 'packagist', 'vcs', 'ziptar' ], 'source' ),
					name: 'name',
					message: 'The package name is:',
				},
				{
					when: makeWhen( 'done', 'type', true ),
					name: 'version',
					message: 'The version to install:',
					filter: filterLatest,
					default: 'latest'
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
			}

			var composerRepo = {},
				repoDef = {},
				requireName;

			if ( 'vcs' === answers.source || 'ziptar' === answers.source ) {
				composerRepo = {};
				repoDef.type = ( 'ziptar' === answers.source ) ? path.extname( answers.url ) : 'vcs';
				repoDef.url = answers.url;

				if ( ! answers.hasJSON || 'ziptar' === answers.source ) {
					composerRepo = {
						name: answers.name,
						version: answers.version,
						type: 'wordpress-' + answers.type
					};
					composerRepo[ ( answers.hasJSON ) ? 'source' : 'dist' ] = repoDef;
				} else {
					composerRepo = repoDef;
				}
				this.install.composer.repositories.push( composerRepo );
			}

			if ( 'wpackagist' === answers.source ) {
				requireName = 'wpackagist-' + answers.type + '/' + answers.slug;
			} else {
				requireName = answers.name;
			}

			this.install.composer.require[ requireName ] = answers.version;

			this.log( chalk.green.bold( 'All right, your dependency has been noted!' ) );
			this.log( chalk.magenta( 'Want to add another?' ) );
			this.prompt( prompts, processAnswers.bind( this ) );
		}

		function filterLatest( input ) {
			return ( 'latest' === input ) ? '*' : input;
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

		this.log( chalk.magenta.bold( 'Let\'s add some requirements!' ) );
		this.prompt( prompts, processAnswers.bind( this ) );
	}
});
