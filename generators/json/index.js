'use strict';
var Base = require( '../../lib/base' );
var path = require( 'path' );
var mkdirp = require( 'mkdirp' );
var _ = require( 'lodash' );

module.exports = Base.extend({
	description: 'another test',
	_compose: function() {
		this.composeWith( 'vvv:source' );
		this.composeWith( 'vvv:require' );
		this.composeWith( 'vvv:dump', { arguments: [ 'manifest' ] } );
	},
	_initialize: function() {
		this.removeRunMethod( 'selectInstall', 'initializing', 7 );
		this.removeRunMethod( 'setUpAppPaths', 'initializing', 9 );
		this.addRunMethod( 'initInstall', this._initInstall, 'initializing' );
		this.addRunMethod( 'advOptions', this._advancedOptions, 'prompting' );
		this.addRunMethod( 'setupInstall', this._setupInstall, 'configuring' );
		this.addRunMethod( 'setUpAppPaths', this.setUpAppPaths, 'configuring' );
	},
	_initInstall: function( done ) {
		_.assign( this.install , {
			name: '',
			title: '',
			description: '',
			homepage: '',
			site: {},
			server: {},
			src: [],
			composer: {
				'type': 'root',
				'keywords': [],
				'minimum-stability': 'dev',
				'prefer-stable': true,
				'repositories': [{
					'type': 'composer',
					'url': 'https://wpackagist.org'
				}],
				'require': {
					'vlucas/phpdotenv': '~2.2.0',
					'johnpbloch/wordpress': '*'
				}
			}
		} );
		done();
	},
	_setupInstall: function( done ) {
		var projectPath = path.resolve(
			this.arguments[0] ||
			path.join( this.options.vagrantPath, 'www', this.install.name )
		);
		mkdirp.sync( projectPath );
		this.destinationRoot( projectPath );
		process.chdir( projectPath );
		this.rcConfig.refresh();
		done();
	},
	_advancedOptions: function( done ) {
		var prompts = this.getPrompt( 'advanced-options' );
		this.prompt( prompts.questions, prompts.answers( this, done ) );
	},
	_advancedSite: function( done ) {
		var prompts = this.getPrompt( 'advanced-site' );
		prompts.questions[3].default = 'admin@' + this.install.server.local;
		this.prompt( prompts.questions, prompts.answers( this, done ) );
	},
	_advancedConstants: function( done ) {
		var prompts = this.getPrompt( 'advanced-constants' );
		this.prompt( prompts.questions, prompts.answers( this, done ) );
	},
	_advancedEnv: function( done ) {
		var prompts = this.getPrompt( 'advanced-env' );
		this.prompt( prompts.questions, prompts.answers( this, done ) );
	},
	_advancedProxies: function( done ) {
		var prompts = this.getPrompt( 'advanced-proxies' );
		if ( this.install.server.remote ) {
			prompts.internalQuestions[1].default = 'https://' + this.install.server.remote;
		}
		this.prompt( prompts.questions, prompts.answers( this, done ) );
	},
	_advancedPaths: function( done ) {
		var prompts = this.getPrompt( 'advanced-paths' );
		this.prompt( prompts.questions, prompts.answers( this, done ) );
	},
	_advancedComposer: function( done ) {
		var prompts = this.getPrompt( 'advanced-composer' );
		this.prompt( prompts.questions, prompts.answers( this, done ) );
	},
	prompting: function() {
		var done = this.async(),
		prompts = this.getPrompt( 'basic-manifest' );
		this.prompt( prompts.questions, prompts.answers( this, done ) );
	}
});
