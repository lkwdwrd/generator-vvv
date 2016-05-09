/**
 * This file contains the VVV generator base definition.
 *
 * The Base generator contains most of the methods for controlling the lifecycle
 * of the VVV generator. This object sets up all the correct paths, config, and
 * gathers the available installs for the generator to run outside of the
 * directory that it's currently in.
 */

'use strict';

// Require dependencies
var YeomanBase = require( 'yeoman-generator' ).Base;
var _ = require( 'lodash' );
var rc = require( './util/rc-config.js' );
var path = require( 'path' );

/**
 * The base object for all VVV sub-generators.
 *
 * This base object gathers all of the combined functionality to make the
 * subgenerators actually run. The lifecycle follows:
 *
 * - Compose any subgenerators
 * - Gather RC configuration
 * - Initialize, adding any runtime methods
 * - Output welcome message
 * - Configure the VVV install path
 * - Gather any Generator-VVV installs in the VVV install
 * - Select the correct site install from the gathered installs
 * - Set up app paths for the selected install
 * - Share objects with composed sub-generators
 * - Run any sub-generator functions
 * - Output goodbye message
 *
 * Extending subgenerators can then use the `_compose()` and `_initialize`
 * methods to compose other subgenerators and add actions to the yeoman
 * lifecycle.
 *
 * In addition to this lifecycle, the base object also exposes some tools for
 * subgenerators to make use of. Download helpers providing access to an
 * MC download instance (allowing http and scp download capabilities), as well
 * as global templating functions so that each generator does not need to have
 * it's own set of templates. This keeps code duplication to a minimum. There
 * are also some prompt helpers to allow the subgenerators to enjoy a
 * centralized set of prompt questions and answer processing.
 */
var Base = YeomanBase.extend( {
	/**
	 * Contains all of the installs available in the selected instance of VVV.
	 *
	 * @type {Object}
	 */
	installs: {},
	/**
	 * The Install Path Map, allowing access to gathered installs by name or
	 * by path. This allows for additional flexibility in selecting an install.
	 *
	 * @type {Object}
	 */
	iPathMap: {},
	/**
	 * Stores the run methods added in with the add_run_method helper in a
	 * subgenerator's _initialize method.
	 *
	 * @type {Object}
	 */
	runTree: {},
	/**
	 * Sets up the object, registering methods with the Yeoman run loop.
	 *
	 * The manual conflicter is set to always overwrite unless the
	 * `--manual-conflict` option is sent.
	 *
	 * Adds the initialize methods to the environment's run loop and if this is
	 * the root object, sets up the RC config and composes sub-generators.
	 *
	 * @return {Object} A Yeoman generator object.
	 */
	constructor: function () {
		// Run the baser constructor.
		YeomanBase.apply( this, arguments );

		// Set up help options
		this.option( 'manual-conflict', {
			type: Boolean,
			desc: 'Manually determine file conflict resolution.',
			alias: 'm'
		} );
		this.option( 'name', {
			type: String,
			desc: 'Select an install using its name.'
		} );
		this.option( 'path', {
			type: String,
			desc: 'Select an isntall by its file path.'
		} );
		this.option( 'vagrant-path', {
			type: path,
			desc: 'Override the path to the Vagrant install.'
		} );

		// Only process conflicts if we got the option
		if ( ! this.options.manualConflict ) {
			this.conflicter._ask = function( f, cb ){
				var rfp = path.relative( process.cwd(), f.path );
				this.adapter.log.force( rfp );
				cb( 'force' );
			};
		}

		// Register initialize required functions.
		this.env.runLoop.add( 'initializing', this.preInit.bind( this ), { once: 'gv:preInit', run: false } );
		this.env.runLoop.add( 'initializing', this.initialize.bind( this ), { once: 'gv:init', run: false } );
		this.env.runLoop.add( 'initializing', this.processRunMethods.bind( this ), { run: false } );

		// Only set up rc and compose if this is the root generator.
		if( ! this.env._rootConstructed ) {
			this.env._rootConstructed = true;
			this.isRoot = true;
			this.install = {};
			this.appPaths = {};
			this._compose();
			this.setUpRC();
		}
	},
	/**
	 * Gets the .gvrc information from the system and makes it available at
	 * `this.rcConfig`.
	 *
	 * @return {void}
	 */
	setUpRC: function() {
		this.rcConfig = rc( 'gv', {} );
	},
	/**
	 * Sets up all of the default actions to be added to the run loop.
	 *
	 * This runs before the subgenerator's '_initialize' method meaning that
	 * these default methods can be removed as needed. This is particularly
	 * useful for commands that work without selecting an install specifically.
	 *
	 * @param  {Function} done Callack to tell the environment work is done.
	 * @return {void}
	 */
	preInit: function( done ) {
		this.addRunMethod( 'welcome', this.welcomeMessage, 'initializing', 1 );
		this.addRunMethod( 'isVagrant', this.vagrantPath, 'initializing', 3 );
		this.addRunMethod( 'gatherInstalls', this.gatherInstalls, 'initializing', 5 );
		this.addRunMethod( 'selectInstall', this.selectInstall, 'initializing', 7 );
		this.addRunMethod( 'setUpAppPaths', this.setUpAppPaths, 'initializing', 9 );
		this.addRunMethod( 'shareObjects', this.shareObjects, 'initializing', 9 );
		this.addRunMethod( 'goodbye', this.goodbyeMessage, 'end', 100 );
		done();
	},
	/**
	 * Initializes this generator.
	 *
	 * This method runs each composed generator's `initialize()` method before
	 * running it's own `_initialize()` method allowing this generator to
	 * control each method added to the yeoman run loop.
	 *
	 * @param  {Function} done Callack to tell the environment work is done.
	 * @return {void}
	 */
	initialize: function( done ) {
		this._composedWith.forEach( function( composed ){ composed._initialize(); } );
		this._initialize();
		done();
	},
	/**
	 * Placeholder for the _compose method, optional in VVV subgenerators.
	 *
	 * @return {void}
	 */
	_compose: function(){},
	/**
	 * Placeholder for the _initialize method, optional in VVV subgenerators.
	 *
	 * @return {void}
	 */
	_initialize: function(){},
} );

// Mixin various base methods.
_.assign(
	Base.prototype,
	require( './base-methods/app-paths' ),
	require( './base-methods/download' ),
	require( './base-methods/global-template' ),
	require( './base-methods/installs' ),
	require( './base-methods/messages' ),
	require( './base-methods/object-mixing' ),
	require( './base-methods/object-output' ),
	require( './base-methods/prompting' ),
	require( './base-methods/vagrant' )
);

//Export the Base object.
module.exports = Base;
