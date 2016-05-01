/**
 * This file contains the main WP Make generator base definition.
 *
 * The Make Base defines most of the functionality to control the lifecycle of a
 * generator. Most generators can be defined with little more than an initConfig
 * method which sends back a lifecycle object controlling the generation
 * lifecycle.
 */

'use strict';

// Require dependencies
var YeomanBase = require( 'yeoman-generator' ).Base;
var _ = require( 'lodash' );
var rc = require( './util/rc-config.js' );
var path = require( 'path' );

/**
 * 
 */
var Base = YeomanBase.extend( {
	installs: {},
	iPathMap: {},
	runTree: {},
	/**
	 * Sets up the object, registering methods with the Yeoman run loop.
	 *
	 * @return {Object} The resulting MakeBase object.
	 */
	constructor: function () {
		// Run the baser constructor.
		YeomanBase.apply( this, arguments );
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
			this.install = {};
			this.appPaths = {};
			this._compose();
			this.setUpRC();
		}
	},
	setUpRC: function() {
		this.rcConfig = rc( 'gv', {} );
	},
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
	initialize: function( done ) {
		this._composedWith.forEach( function( composed ){ composed._initialize(); } );
		this._initialize();
		done();
	},
	_compose: function(){},
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
