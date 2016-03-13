var tools = require( '../util/prompt-tools' );

var sourcePrompts = {
	questions: [
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
				new tools.inquirer.Separator(),
				{
					name: 'No more, I\'m done',
					value: 'done'
				}
			]
		},
		{
			when: tools.makeWhen( 'done', 'type', true ),
			type: 'list',
			name: 'map',
			message: 'This repository contains a:',
			choices: [
				{
					name: 'WP Theme',
					value: 'theme'
				},
				{
					name: 'WP Plugin',
					value: 'plugin'
				},
				{
					name: 'WP MU Plugin',
					value: 'muplugin'
				},
				{
					name: 'Content Folder',
					value: 'content'
				},
				{
					name: 'Site Root',
					value: 'root'
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
			when: tools.makeWhen( 'done', 'type', true ),
			name: 'url',
			message: 'The repository URL is:'
		},
		{
			when: tools.makeWhen( [ 'theme', 'plugin', 'muplugin' ], 'map' ),
			filter: tools.filterToUndef,
			name: 'name',
			message: 'The name in the composer.json file is (blank if none):'
		},
		{
			when: tools.makeWhen( undefined, 'name', true ),
			name: 'stable',
			message: 'The stable version of this source is:'
		},
		{
			when: tools.makeWhen( 'done', 'type', true ),
			type: 'confirm',
			name: 'confirmed',
			message: 'Alright, I got it. Is everything correct?'
		}
	],
	answers: tools._.curry( processAnswers )
};

function processAnswers( context, done, answers ) {
	if ( 'done' === answers.type ) {
		return done();
	}

	if ( ! answers.confirmed ) {
		context.log( tools.chalk.red.bold( 'OK, let\'s try again.' ) );
		context.prompt( sourcePrompts.questions, sourcePrompts.answers( context, done ) );
		return;
	} else {
		delete answers.confirmed;
	}

	if ( ! answers.name ) {
		delete answers.name;
	}

	context.install.src.push( answers );

	context.log( tools.chalk.green.bold( 'All right, your source has been noted!' ) );
	context.log( tools.chalk.magenta( 'Want to add another?' ) );
	context.prompt( sourcePrompts.questions, sourcePrompts.answers( context, done ) );
}

module.exports = sourcePrompts;
