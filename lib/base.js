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
var fs = require( 'fs' );
var _ = require( 'lodash' );
var rc = require( './rc-config.js' );
var path = require( 'path' );
var chalk = require( 'chalk' );
var recursiveFind = require( './recursive-find.js' );

/**
 * The MakeBase definition for controlling a WP Make generation lifecycle.
 *
 * The MakeBase can be exteded in additional generators to allow controlling of
 * WordPress project generation in a fairly opinionated way. Each project will
 * define a initConfig method that will return a lifecycle object.
 *
 * The lifecycle object controls how a project is generated and consists of two
 * main sections. The prompts section, which defines what questions will be
 * asked of the user, and the tree section, which will define the generated
 * file structure as well as the copies, templates, json objects, and js modules
 * that will create the project.
 *
 * Here is a simple example lifecycle object:
 *
 *     {
 *     	prompts: [
 *     		name: 'projectTitle'
 *     		message: 'Project title',
 *     		default: 'WP Plugin'
 *     	],
 *     	tree: {
 *     		templates: {
 *     			'project.php': '_project.php'
 *     		},
 *     		json: {
 *     			'package.json': '_package.json'
 *     		}
 *     	}
 *     }
 *
 * The generator will then automatically ask the questions in the prompt
 * lifecycle, and then write out the templates according to the tree lifecycle.
 *
 * Additional methods can be used and will be run in sequence between the prompt
 * and tree lifecycles. This allows you to further mutate and add to the data
 * gathered from the user as neede before running into the tree lifecycle. These
 * methods will be run in sequence unless you specifically use the yeoman
 * queue framework to move them outside of this basic lifecycle.
 */
module.exports = YeomanBase.extend( {
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
		this.env.runLoop.add( 'initializing', this._preInit.bind( this ), { once: 'gv:preInit', run: false } );
		this.env.runLoop.add( 'initializing', this.initialize.bind( this ), { once: 'gv:init', run: false } );
		this.env.runLoop.add( 'initializing', this.processRunMethods.bind( this ), { run: false } );

		// Only set up rc and compose if this is the root generator.
		if( ! this.env._rootConstructed ) {
			this._compose();
			this._setUpRC();
			this.env._rootConstructed = true;
		}
	},
	_setUpRC: function() {
		this.rcConfig = rc( 'gv', {} );
	},
	_compose: function(){},
	_preInit: function( done ) {
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
	_initialize: function(){},
	addRunMethod: function ( name, callback, lifecycle, priority, multiple ) {
		var once = !once;
		priority = ( priority ) ? parseInt( priority, 10 ) : 10;
		if ( ! this.runTree[ lifecycle ] ) {
			this.runTree[ lifecycle ] = [];
		}
		if ( ! this.runTree[ lifecycle ][ priority ] ) {
			this.runTree[ lifecycle ][ priority ] = {};
		}
		this.runTree[ lifecycle ][ priority ][ name ] = { cb: callback, multiple: multiple };
	},
	removeRunMethod: function( name, lifecycle, priority ) {
		priority = ( priority ) ? parseInt( priority, 10 ) : 10;
		if ( this.runTree[ lifecycle ] && this.runTree[ lifecycle ][ priority ] ) {
			delete this.runTree[ lifecycle ][ priority ][ name ];
		}
	},
	processRunMethods: function( done ) {
		var lifecycle, i, length, name, priorityTree, opts = { run: false };
		function _passThrough( val ){ return val; }
		// Register Methods with the run loop
		for ( lifecycle in this.runTree ) {
			//reset array keys for iteration.
			priorityTree = this.runTree[ lifecycle ].filter( _passThrough );
			//iterate over each priority level.
			for ( i = 0, length = priorityTree.length; i < length; i++ ) {
				// iterate over each callback and register it with the run loop.
				for ( name in priorityTree[ i ] ) {
					opts.once = ( priorityTree[ i ][ name ].multiple ) ? false : name;
					this.env.runLoop.add( lifecycle, priorityTree[ i ][ name ].cb.bind( this ), opts );
				}
			}
		}
		done();
	},
	/**
	 * Outputs a welcome message to thank users for trying WP Make.
	 *
	 * @param  {Function} done The function to continue generation.
	 * @return {void}
	 */
	welcomeMessage: function( done ) {
		this.log(
			chalk.magenta( 'Thanks for creating with ' ) +
			chalk.cyan.bold( 'Generator VVV' ) +
			chalk.magenta( '!' )
		);
		done();
	},
	/**
	 * Outputs a goodbye message to let users know generation is complete.
	 *
	 * @param  {Function} done The function to continue generation.
	 * @return {void}
	 */
	goodbyeMessage: function( done ) {
		this.log( chalk.green.bold( 'All done!' ) );
		if ( this.goodbyeText ) {
			this.log( this.goodbyeText );
		}
		done();
	},
	vagrantPath: function( done ) {
		// See if it came in as an argument and if not try to get it from config.
		if( this.options.vagrantPath ) {
			this.options.vagrantPath = path.resolve( this.options.vagrantPath );
			if ( ! this._isVVVDir( this.options.vagrantPath ) ) {
				this.log( chalk.red.bold( 'The passed vagrant path does not appear to contain a VVV install... :(' ) );
				process.exit( 0 );
			} else {
				console.log( this.options.vagrantPath );
				done();
			}
		} else {
			this.options.vagrantPath = this.rcConfig.get( 'vagrantPath' );
		}
		// Make sure the stored directory still looks VVV-ish.
		if ( this.options.vagrantPath && ! this._isVVVDir( this.options.vagrantPath ) ) {
			this.options.vagrantPath = false;
		}
		// See if we've gotten it yet, and if not try to autodetect and then prompt.
		if ( ! this.options.vagrantPath ) {
			// Set up question and asnwer processor.
			var vdir = process.cwd(),
				info = path.parse( vdir ),
				question = [ {
					type: 'text',
					name: 'dir',
					message: 'Where is your VVV directory located?'
				} ];
			/**
			 * Based on the answer, if we detect VVV here, store it and move on, or ask again.
			 *
			 * @param  {object} answer The object holding the user input.
			 */
			var processAnswer = function ( answer ){
				if ( this._isVVVDir( answer.dir ) ) {
					this.options.vagrantPath = answer.dir;
					this.log( chalk.green.bold( 'Storing Vagrant path... great job! :)' ) );
					this.rcConfig.set( 'vagrantPath', this.options.vagrantPath, true ).then( done );
				} else {
					this.log( chalk.red.bold( 'That does not look like a VVV directory... :(' ) );
					this.prompt( question, processAnswer );
				}
			}.bind( this );
			// Try to autodetect the directory and set as default.
			do {
				if ( this._isVVVDir( vdir ) ) {
					question[0].default = vdir;
					break;
				} else {
					vdir = path.dirname( vdir );
				}
			} while ( vdir !== info.root );
			// Start asking where Vagrant is.
			this.prompt( question, processAnswer );
		} else {
			done();
		}
	},
	_isVVVDir: function ( dir ) {
		try {
			fs.lstatSync( path.join( dir, 'Vagrantfile' ) );
			fs.lstatSync( path.join( dir, 'www' ) );
			fs.lstatSync( path.join( dir, 'www', 'vvv-hosts' ) );
			return true;
		} catch( e ) {
			return false;
		}
	},
	gatherInstalls: function( done ) {
		recursiveFind(
			'vmanifest.json',
			path.join( this.options.vagrantPath, 'www' ),
			this._recordInstall.bind( this ),
			3
		)
		.then( done );
	},
	_recordInstall: function( filePath ) {
		var install = require( filePath );
		if ( install && install.name ) {
			install.workingDirectory = path.dirname( filePath );
			this.installs[ install.name ] = install;
			this.iPathMap[ install.workingDirectory ] = install;
		}
	},
	selectInstall: function( done ) {
		// Select by name if it was sent as an opiton.
		if ( this.options.name && this.installs[ this.options.name ] ) {
			this._makeInstallActive( this.installs[ this.options.name ] );
			done();
		}
		// Use cwd if name and path were not sent as options.
		var gvPath = ( this.options.path ) ? this.options.path : process.cwd(),
			info = path.parse( gvPath );
		do{
			if ( this.iPathMap[ gvPath ] ) {
				this._makeInstallActive( this.iPathMap[ gvPath ] );
				return done();
			} else {
				gvPath = path.dirname( gvPath );
			}
		} while ( info.root !== gvPath );

		this.log( chalk.red.bold( 'Unable to select an install!' ) );
		this.log( '' );
		this.log( chalk.red( 'You might try...') );
		this.log( chalk.red( '	* Moving to a working directory with a vmanifest file.' ) );
		this.log( chalk.red( '	* Using the --name="install/name" flag in the command.' ) );
		this.log( chalk.red( '	* Using the --path="install/path" to specify the project directory.' ) );
		process.exit( 0 );
	},
	_makeInstallActive: function( install ) {
		this.install = install;
		process.chdir( install.workingDirectory );
		this.rcConfig.refresh();
	},

	setUpAppPaths: function( done ) {
		// Set up path maps
		this.appPaths = _.defaults( _.clone( this.install['app-paths'] || {} ), {
			'composer-path': '.',
			'vendor-dir': 'vendor',
			'wp-path': 'wp',
			'content-path': 'wp-content',
		} );
		this.appPaths['theme-path'] = path.join( this.appPaths['content-path'], 'themes' );
		this.appPaths['plugin-path'] = path.join( this.appPaths['content-path'], 'plugins' );
		this.appPaths['mu-plugin-path'] = path.join( this.appPaths['content-path'], 'mu-plugins' );
		done();
	},

	shareObjects: function( done ) {
		this._composedWith.forEach( this._shareObjects.bind( this ) );
		done();
	},
	_shareObjects: function( generator ) {
		generator.install = this.install;
		generator.rcConfig = this.rcConfig;
		generator.appPaths = this.appPaths;
	},

	getAppPath: function( name, root, additional ) {
		root = root || '.';
		additional = additional || '.';
		return path.normalize( path.join( root, this.appPaths[ name ], additional ) );
	},

	/**
	 * Writes out a JSON object to the destination file.
	 *
	 * If the file already exists, the existing object will be run through
	 * `_.defaults` with the default object passed. This allows for some
	 * mutation of an existing object if desired while ensuring we don't
	 * overwrite and destroy the existing JSON object in the file.
	 *
	 * The contents and file names are run through templating so ejs template
	 * tags can be used in both.
	 *
	 * @param  {Object} defaults   The default JSON object.
	 * @param  {String} location   The file path where the json file will live.
	 * @param  {String} whitespace Optional. The whitespace to use in output.
	 *                             Will default to the defined default.
	 * @return {void}
	 */
	writeJSON: function ( data, location ) {
		// Write the file
		this.fs.write(
			this.destinationPath( location ),
			JSON.stringify( data, null, "\t" )
		);
	},
	/**
	 * Writes out a JS module to the file system.
	 *
	 * The contents and file names are run through templating so ejs template
	 * tags can be used in both.
	 *
	 * @param  {Object} module   The ASTConfig object for this module.
	 * @param  {String} location The file path where the module will live.
	 * @return {void}
	 */
	writeTask: function ( config, name ) {
		// Write the file
		this.fs.write(
			this.destinationPath( path.join( 'tasks', name + '.js' ) ),
			"module.exports = " + JSON.stringify( config, null, "\t" ) + ";\n"
		);
	},
	globalSourceRoot: function() {
		return path.join( __dirname, 'templates' );
	},
	globalTemplatePath: function( relPath ) {
		return path.resolve( path.join( this.globalSourceRoot(), relPath ) );
	},
	globalTemplate: function( src, dest, data, options ) {
		if ('string' !== typeof dest ) {
			options = data;
			data = dest;
			dest = src;
		}
		this.fs.copyTpl(
			this.globalTemplatePath( src ),
			this.destinationPath( dest ),
			data,
			options
		);
	},
	globalCopy: function( src, dest, options ) {
		if ('string' !== typeof dest ) {
			options = dest;
			dest = src;
		}
		this.fs.copy(
			this.globalTemplatePath( src ),
			this.destinationPath( dest ),
			options
		);
	},
	wrapDone: function( func ) {
		return function _doneWrapped( done ) {
			func.call( this );
			done();
		}.bind( this );
	}
} );
