/**
 * A subgenerator to create a `manifest.json` file based on user input.
 *
 * This generator allows a user to run through a set of interactive prompts to
 * create a complete `manifest.json` file and outputs it so it can be shared
 * or used to bootstrap a new site.
 */

'use strict';

// Require dependencies.
var Base = require( '../../lib/base' );
var path = require( 'path' );
var mkdirp = require( 'mkdirp' );
var _ = require( 'lodash' );

// Output the JSON subgenerator for use.
module.exports = Base.extend({
	/**
	 * The subgenerator description used in the main `yo:vvv` command.
	 *
	 * @type {String}
	 */
	description: 'Create a manifest.json using interactive promts.',
	/**
	 * Composes this generator with the source, requrie and dump subgenerators.
	 *
	 * @return {void}
	 */
	_compose: function() {
		this.composeWith( 'vvv:source' );
		this.composeWith( 'vvv:require' );
		this.composeWith( 'vvv:dump', { arguments: [ 'manifest' ] } );
	},
	/**
	 * Set up run-methods to trigger during the yeoman lifecycle.
	 *
	 * This removes the selection and app path methods since this method does
	 * not actually deal with an install. It simply creates an install
	 * definition that can then be used to create an install or shared.
	 *
	 * @return {void}
	 */
	_initialize: function() {
		this.removeRunMethod( 'selectInstall', 'initializing', 7 );
		this.removeRunMethod( 'setUpAppPaths', 'initializing', 9 );
		this.addRunMethod( 'initInstall', this._initInstall, 'initializing' );
		this.addRunMethod( 'advOptions', this._advancedOptions, 'prompting' );
		this.addRunMethod( 'setupInstall', this._setupInstall, 'configuring' );
		this.addRunMethod( 'setUpAppPaths', this.setUpAppPaths, 'configuring' );
	},
	/**
	 * Creates an initial 'install' object to be customized based on answers.
	 *
	 * @param  {Function} done Callack to tell the environment work is done.
	 * @return {void}
	 */
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
	/**
	 * Sets up the location that this json file will be output to.
	 *
	 * @param  {Function} done Callack to tell the environment work is done.
	 * @return {void}
	 */
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
	/**
	 * Queries the user to choose which advanced options to customize.
	 *
	 * @param  {Function} done Callack to tell the environment work is done.
	 * @return {void}
	 */
	_advancedOptions: function( done ) {
		var prompts = this.getPrompt( 'advanced-options' );
		this.prompt( prompts.questions, prompts.answers( this, done ) );
	},
	/**
	 * Queries the user for advance site customizations.
	 *
	 * Makes sure the third question has the default value set by adding an
	 * 'admin@' email address for the local domain.
	 *
	 * @param  {Function} done Callack to tell the environment work is done.
	 * @return {void}
	 */
	_advancedSite: function( done ) {
		var prompts = this.getPrompt( 'advanced-site' );
		prompts.questions[3].default = 'admin@' + this.install.server.local;
		this.prompt( prompts.questions, prompts.answers( this, done ) );
	},
	/**
	 * Allows the user to add additional WordPress constants to the site.
	 *
	 * @param  {Function} done Callack to tell the environment work is done.
	 * @return {void}
	 */
	_advancedConstants: function( done ) {
		var prompts = this.getPrompt( 'advanced-constants' );
		this.prompt( prompts.questions, prompts.answers( this, done ) );
	},
	/**
	 * Allows a user to add additional environment variables to the site.
	 *
	 * @param  {Function} done Callack to tell the environment work is done.
	 * @return {void}
	 */
	_advancedEnv: function( done ) {
		var prompts = this.getPrompt( 'advanced-env' );
		this.prompt( prompts.questions, prompts.answers( this, done ) );
	},
	/**
	 * Allows a user to add static file proxies to the site.
	 *
	 * @param  {Function} done Callack to tell the environment work is done.
	 * @return {void}
	 */
	_advancedProxies: function( done ) {
		var prompts = this.getPrompt( 'advanced-proxies' );
		if ( this.install.server.remote ) {
			prompts.internalQuestions[1].default = 'https://' + this.install.server.remote;
		}
		this.prompt( prompts.questions, prompts.answers( this, done ) );
	},
	/**
	 * Allows a user to customize the app-paths for the install.
	 *
	 * @param  {Function} done Callack to tell the environment work is done.
	 * @return {void}
	 */
	_advancedPaths: function( done ) {
		var prompts = this.getPrompt( 'advanced-paths' );
		this.prompt( prompts.questions, prompts.answers( this, done ) );
	},
	/**
	 * Allows the user to customize some `composer.json` items.
	 *
	 * @param  {Function} done Callack to tell the environment work is done.
	 * @return {void}
	 */
	_advancedComposer: function( done ) {
		var prompts = this.getPrompt( 'advanced-composer' );
		this.prompt( prompts.questions, prompts.answers( this, done ) );
	},
	/**
	 * Basic prompts for setting up a new install with Vagrant.
	 *
	 * @param  {Function} done Callack to tell the environment work is done.
	 * @return {void}
	 */
	prompting: function() {
		var done = this.async(),
		prompts = this.getPrompt( 'basic-manifest' );
		this.prompt( prompts.questions, prompts.answers( this, done ) );
	}
});
