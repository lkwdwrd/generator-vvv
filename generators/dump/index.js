/**
 * Outputs various types of files tht require templating or processing.
 *
 * This file reads in the manifest declaration and then allows outputting of
 * the following files
 *
 * - manifest (wpmanifest.json)
 * - composer (composer.json, both in the root and the app if applicable)
 * - env (.env, and .env.example)
 * - domains (vvv-hosts, nginx configs, wp-cli yaml)
 * - wp-cli (the wp-cli yaml file)
 * - package (package.json)
 * - nginx-config (vvv-nginx.conf, proxy.conf, rewrites.conf)
 *
 * You can also pass 'all' as a dump argument and all of these files will be
 * output into the install location.
 *
 * ```
 * yo vvv:dump <options> <args>
 * ```
 *
 * The space separated args are used to dump whatever files you would like in
 * one call to dump. Any of the above strings can be used to dump out the
 * associated files. For instance: `yo vvv:dump composer env` will output both
 * the composer files and the .env files.
 *
 * Dump is very useful when you make a small update to your manifest and need to
 * reprocess it and update a file. For example, after modifying the composer
 * key of the manifest file, you will likely want to dump composer so that the
 * chages are propagated out to the actual composer.json files.
 */

'use strict';

// Require dependencies.
var Base = require( '../../lib/base' );
var _ = require( 'lodash' );
var path = require( 'path' );
var slash = require( 'slash' );
var envParse = require( 'dotenv' ).parse;
var crypto = require( 'crypto' );
var chalk = require( 'chalk' );

// Export the dump generator.
module.exports = Base.extend({
	/**
	 * The subgenerator description used in the main `yo:vvv` command.
	 *
	 * @type {String}
	 */
	desc: 'Output files based on the manifest.json values.',
	/**
	 * Maps command line arguments to processing methods for each dump type.
	 *
	 * @type {Object}
	 */
	dumpMap: {
		'manifest': '_dumpManifest',
		'composer': '_dumpComposer',
		'env': '_dumpEnv',
		'domains': '_dumpDomains',
		'wp-cli': '_dumpWPCLI',
		'package': '_dumpPackage',
		'nginx-config': '_dumpNginxConfig'
	},
	/**
	 * Set up run-methods to trigger during the yeoman lifecycle.
	 *
	 * @return {void}
	 */
	_initialize: function() {
		this.arguments.forEach( this._processDump.bind( this ) );
	},
	/**
	 * If an argument matches the dump map, add it to the yeoman lifecycle
	 *
	 * @param  {String} dump The specific dump to perform.
	 * @return {void}
	 */
	_processDump: function ( dump ) {
		if ( this.dumpMap[ dump ] ) {
			this.addRunMethod(
				'dump:' + dump,
				this.wrapDone( this[ this.dumpMap[ dump ] ] ),
				'writing'
			);
		}
		if ( 'all' === dump ) {
			_.keys( this.dumpMap ).forEach( this._processDump.bind( this ) );
		}
	},
	/**
	 * Writes the `manifest.json` file.
	 *
	 * This dump is primarily useful for the 'json' and 'create' subgenerators.
	 *
	 * @return {void}
	 */
	_dumpManifest: function() {
		this.writeJSON( _.omit( this.install, [ 'workingDirectory' ] ), 'wpmanifest.json' );
	},
	/**
	 * Output the `composer.json` files as defined by the manifest.
	 *
	 * @return {void}
	 */
	_dumpComposer: function() {
		// Localize vars.
		var composer;
		if ( ! this.install.composer ) {
			this.log(
				chalk.yellow( 'Composer is turned for this site in the manifest.' )
			);
			return;
		}

		// Copy and mutate install data into composer json.
		composer = _.chain( this.install )
			.assign( this.install.composer )
			.omit( [ 'in-app', 'app-paths', 'site', 'server', 'src', 'composer', 'workingDirectory' ] )
			.merge( this._processComposerPaths( this.appPaths, 'app', '.' ) )
			.value();

		// Write the composer file.
		this.writeJSON( composer, 'composer.json' );

		// Dump the app version if it's supported.
		if ( false !== this.install.composer['in-app'] ) {
			this._dumpComposerApp( composer, this.appPaths );
		}
	},
	/**
	 * Dump out the app version of the `composer.json` when needed.
	 *
	 * @param  {Object} composer The root level composer object.
	 * @param  {Object} paths    The app-paths object.
	 * @return {void}
	 */
	_dumpComposerApp: function( composer, paths ) {
		var i, length, sourcesWhitlist = [ 'plugin', 'theme', 'muplugin' ];

		// clean composer object
		delete composer.extra['installer-paths'];
		delete composer.extra['wordpress-install-dir'];
		if ( composer.config && composer.config['vendor-dir'] ) {
			delete composer.config['vendor-dir'];
			if ( _.isEmpty( composer.config ) ) {
				delete composer.config;
			}
		}

		// Add each plugin, theme, and muplugin source as a dependency.
		if ( 0 < this.install.src.length ) {
			for( i = 0, length = this.install.src.length; i < length; i++ ) {
				if ( -1 !== sourcesWhitlist.indexOf( this.install.src[ i ].map ) ) {
					if ( this.install.src[ i ].name ) {
						composer.repositories.push( _.pick( this.install.src[ i ], [ 'type', 'url' ] ) );
						composer.require[ this.install.src[ i ].name ] = this.install.src[ i ].stable;
					}
				}
			}
		}

		// Dump the app's composer.json file.
		this.writeJSON(
			_.merge( composer, this._processComposerPaths( paths ) ),
			path.join( 'app', paths['composer-path'], 'composer.json' )
		);
	},
	/**
	 * Set up the correct paths for `composer.json` based on the manifest.
	 *
	 * This is what allows the definition in the `wpmanifest.json` file to
	 * output multiple `composer.json` files that send dependencies to the same
	 * locations despite being in different locations themselves.
	 *
	 * @param  {Object} paths        The app-paths object.
	 * @param  {String} root         The app root file paths for `composer.json`
	 * @param  {String} composerPath The path where for this `composer.json`.
	 * @return {Object}              Normalized composer path definitions.
	 */
	_processComposerPaths: function( paths, root, composerPath ) {
		root = root || '.';
		composerPath = composerPath || paths['composer-path'];

		var composerPaths = { extra: { 'installer-paths': {} } },
			themePath = path.normalize( path.join( root, paths['theme-path'], '{$name}' ) ),
			pluginPath = path.normalize( path.join( root, paths['plugin-path'], '{$name}' ) ),
			muPluginPath = path.normalize( path.join( root, paths['mu-plugin-path'], '{$name}' ) ),
			wpPath = path.normalize( path.join( root, paths['wp-path'] ) ),
			vendorDir = path.normalize( path.join( root, path.relative( composerPath, paths['vendor-dir'] ) ) );

		// Set up extras
		composerPaths.extra['wordpress-install-dir'] = slash( wpPath );
		composerPaths.extra['installer-paths'][ slash( themePath ) ] = [ 'type:wordpress-theme' ];
		composerPaths.extra['installer-paths'][ slash( pluginPath ) ] = [ 'type:wordpress-plugin' ];
		composerPaths.extra['installer-paths'][ slash( muPluginPath ) ] = [ 'type:wordpress-muplugin' ];
		// set up config as needed
		if ( 'vendor' !== vendorDir ) {
			composerPaths.config = { 'vendor-dir': slash( vendorDir ) };
		}

		return composerPaths;
	},
	/**
	 * Output .env and .env.example files.
	 *
	 * This will automatically generate random salts to use in the WP install.
	 * However if salts have already been generated, they will be read and
	 * reuse the defined salts so that they do not constantly change every time
	 * the environment file is refreshed.
	 *
	 * @return {void}
	 */
	_dumpEnv: function() {
		// Localize vars
		var env, envExample, basicItems, defaultConstants, salts,
			envPath = this.destinationPath( ( this.install.site['external-env'] ) ? '.' : 'app' );

		// Compile basic items into an object.
		basicItems = {
			SITE_TITLE: this.install.title,
			TABLE_PREFIX: this.install.site.prefix || 'wp_',
		};
		if ( this.install.site.constants.MULTISITE ) {
			basicItems.INSTALL_BASE = this.install.site.base || '/';
		}

		// Default Constants
		defaultConstants = {
			WPCONST_DB_USER: 'wordpress',
			WPCONST_DB_PASSWORD: 'wordpress',
		};

		// Set up salts
		try {
			salts = this._generateSalts( envParse( this.fs.read( path.join( envPath, '.env' ) ) ) );
		} catch( e ) {
			salts = this._generateSalts();
		}

		// Compile the environment file string.
		env = _.chain( this.install.site.constants )
			.mapKeys( function ( item, key ) { return 'WPCONST_' + key; } )
			.defaults( defaultConstants )
			.assign( basicItems )
			.assign( this.install.site.env )
			.defaults( salts )
			.value();


		// example key vars.
		envExample = _.assign( _.clone( env ), this._generateSalts( {}, 'your_key_here' ) );

		// Dump the .env and .env.example files.
		this.fs.write( path.join( envPath, '.env' ), this._envToString( env ) );
		this.fs.write( path.join( envPath, '.env.example' ), this._envToString( envExample ) );
	},
	/**
	 * Converts an object of environment vairables into and evironment string.
	 *
	 * @param  {Object} envObj A object of env variable key/val pairs.
	 * @return {String}        An evironment string to save to a file.
	 */
	_envToString: function ( envObj ) {
		return _.map( envObj, function ( item, key ) {
			item = ( 'true' === '' + item || 'false' === '' + item ) ? item : '"' + item + '"';
			return key + '=' + item;
		} ).join( "\n" );
	},
	/**
	 * Generate WP salt keys as needed.
	 *
	 * If salts already exist, then they will be read and reused, otherwise
	 * randomized strings will be used for the main .env function using the
	 * passed `genFunc` or by default a random base64 string. If a string is
	 * passed as the genFunc, it's value will be returned for all salts.
	 *
	 * @param  {Object}          envObj  Environment key/value pairs.
	 * @param  {Function|String} genFunc A function to generate vals, or a
	 *                                   static string to use for all salts.
	 * @return {Object}                  Environment key/value pairs with the
	 *                                   needed salts added.
	 */
	_generateSalts: function ( envObj, genFunc ) {
		var keys = [
			'WPCONST_AUTH_KEY',
			'WPCONST_SECURE_AUTH_KEY',
			'WPCONST_LOGGED_IN_KEY',
			'WPCONST_NONCE_KEY',
			'WPCONST_AUTH_SALT',
			'WPCONST_SECURE_AUTH_SALT',
			'WPCONST_LOGGED_IN_SALT',
			'WPCONST_NONCE_SALT',
		];

		envObj = envObj || {};

		if ( undefined === genFunc ) {
			genFunc = function(){ return crypto.randomBytes(64).toString('base64'); };
		} else if ( 'function' !== typeof genFunc ) {
			var genFuncVal = genFunc;
			genFunc = function(){ return genFuncVal; };
		}

		return _.zipObject( keys, _.map( keys, function( key ){
			return envObj[ key ] || genFunc( key );
		} ) );
	},
	/**
	 * Dumps all files associated with the domains defined by the manifest.
	 *
	 * @return {void}
	 */
	_dumpDomains: function() {
		// Make sure CLI gets porcessed as well.
		this._processDump( 'wp-cli' );
		this._processDump( 'nginx' );

		// Dump the hosts and nginx config files.
		this.globalTemplate( '_vvv-hosts', path.join( 'config', 'vvv-hosts' ), {
			domains: this._getDomains().join( "\n" )
		} );
	},
	/**
	 * Processes the domains defined in the manifest into an array of domains.
	 *
	 * @return {Array} An array of full domain strings.
	 */
	_getDomains: function() {
		// process out an array of local domains.
		return [ this.install.server.local ].concat(
			( this.install.server.subdomains || [] )
			.map( _mapSubs, this )
		);

		/**
		 * Turns a subdomain string into a full domain string.
		 *
		 * @param  {String} sub The subdomain to create.
		 * @return {String}     The full domain string for the subdomain.
		 */
		function _mapSubs( sub ) {
			return sub + '.' + this.install.server.local;
		}
	},
	/**
	 * Dumps out all necessary Nginx configuration files.
	 *
	 * @return {void}
	 */
	_dumpNginxConfig: function() {
		var rewriteBase = path.relative( this.getAppPath( 'root' ), this.getAppPath( 'wp-path' ) ),
		templateVars = {
			subdomain: this.install.site.constants.SUBDOMAIN_INSTALL,
			domain: this.install.server.local,
			path: slash( this.getAppPath( 'root', 'app' ) ),
			rewrite: ( '.' === rewriteBase ) ? '' : rewriteBase,
			proxy: !! this.install.server.proxies,
			phpver: this.install.server['php-version'] || false
		};
		// Support wildcard subdomains in subdomain multisite.
		if ( templateVars.subdomain ) {
			templateVars.domain += ' *.' + this.install.server.local;
		}
		this.globalTemplate( '_vvv-nginx.conf', 'vvv-nginx.conf', templateVars );
		if ( templateVars.rewrite ) {
			this.globalTemplate(
				'_rewrites.conf',
				path.join( 'config', 'rewrites.conf' ),
				templateVars
			);
		}
		if ( !! this.install.server.proxies ) {
			this.globalTemplate(
				'_proxy.conf',
				path.join( 'config', 'proxy.conf' ),
				{
					proxies: this._normalizeProxies(
						this.install.server.proxies,
						this.install.server.remote
					),
					prefix: this.install.site.constants.DB_NAME
				}
			);
		} else {
			this.fs.delete( this.destinationPath( path.join( 'config', 'proxy.conf' ) ) );
		}
	},
	/**
	 * Turns a proxy definition into a usable nginx configuration string.
	 *
	 * @param  {Object} proxies     A set of prozy definitions.
	 * @param  {String} fallbackURL The fallback URL for the proxies.
	 * @return {Array}              Normalized proxies for templating.
	 */
	_normalizeProxies: function( proxies, fallbackURL ) {
		proxies = _.clone( proxies );
		fallbackURL = ( fallbackURL ) ? 'https://' + fallbackURL : false;

		return _.mapValues( proxies, _.curry( _singleProxyNormalize )( _, fallbackURL ) );

		/**
		 * Normalizes a single proxy declaration for use in templating.
		 *
		 * @param  {Object} proxy       A singular poxy definition.
		 * @param  {String} fallbackURL The fallback URL to proxy to.
		 * @return {Object}             The normalized proxy object.
		 */
		function _singleProxyNormalize( proxy, fallbackURL ) {
			var types, typesExclude, normalized = {},
				defaultTypes = [
					'js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'ico',
					'mp3', 'mov', 'tif', 'tiff', 'swf', 'txt', 'html'
				];

			// If a falsey is passed, this proxy is off, keep it false.
			if ( ! proxy ) {
				return false;
			}

			// Assume simply string are meant to be the proxy URL and default the rest.
			if ( 'string' === typeof proxy ) {
				proxy = { proxies: [ proxy ] };
			}

			// Verify we have an object now.
			proxy = ( 'object' === typeof proxy ) ? proxy : {};
			if ( ! ( proxy.proxies instanceof Array ) || 0 === proxy.proxies.length ) {
				proxy.proxies = [ fallbackURL ];
			}

			// Normalize the location values, bail if we have no valid locations.
			normalized.proxies = _.compact(
				proxy.proxies.map(
					_.curry( normalizeLocations )( _, fallbackURL )
				)
			);
			if ( 0 > normalized.proxies.length ) {
				return false;
			}

			// Process out the match value.
			if ( proxy.match && 'string' === typeof proxy.match ) {
				normalized.match = proxy.match;
			} else {
				// Add types to the default array if needed.
				if ( proxy['types-include'] instanceof Array ) {
					defaultTypes = _.uniq( defaultTypes.concat( proxy['types-include'] ) );
				}
				// Process types out into a final match string.
				types = ( proxy.types instanceof Array ) ? proxy.types : defaultTypes;
				typesExclude = ( proxy['types-exclude'] instanceof Array ) ? proxy['types-exclude'] : [];
				normalized.match = '\\.(' + _.without( types, typesExclude ).join( '|' ) + ')$';
			}

			return normalized;

			/**
			 * Normalize the proxy locations for a single proxy declaration.
			 *
			 * @param  {mixed}  location    Either a location string or object.
			 * @param  {String} fallbackURL The fallback URL for this proxy.
			 * @return {Object}             A normalized proxy location object.
			 */
			function normalizeLocations( location, fallbackURL ) {
				if ( 'string' === typeof location ) {
					location = {
						rewrite: false,
						url: location
					};
				} else if ( 'object' === typeof location ) {
					location = {
						rewrite: ( 'string' === typeof location.rewrite ) ? location.rewrite : false,
						url: ( 'string' === typeof location.url ) ? location.url : fallbackURL
					};
				} else {
					location = false;
				}
				return location;
			}
		}
	},
	/**
	 * Dump out a WP-ClI Yaml file for install commands and root accessiblity.
	 *
	 * @return {void}
	 */
	_dumpWPCLI: function() {
		// Compile basic data.
		var data = {
			path: slash( this.getAppPath( 'wp-path', 'app' ) ),
			title: this.install.title,
			url: this.install.server.local,
			user: this.install.site['admin-user'] || 'admin',
			pass: this.install.site['admin-pass'] || 'password',
			email: this.install.site['admin-email'] || 'admin@' + this.install.server.local,
			base: this.install.site.base || '/',
			subdomains: this.install.site.constants.SUBDOMAIN_INSTALL || false
		};

		// Dump the wp-cli.yml file.
		this.globalTemplate( '_wp-cli.yml', 'wp-cli.yml', data );
	},
	/**
	 * Output a NPM package.json file to ensure grunt is properly configured.
	 *
	 * @return {void}
	 */
	_dumpPackage: function() {
		this.writeJSON( {
			name: this.install.site.constants.DB_NAME,
			description: this.install.description,
			main: 'Gruntfile.js',
			scripts: {
				test: 'echo "Error: no test specified" && exit 1'
			},
			dependencies: {
				'grunt': '^0.4.5',
				'grunt-confirm': '^1.0.4',
				'grunt-contrib-clean': '^0.7.0',
				'grunt-contrib-copy': '^1.0.0',
				'grunt-contrib-symlink': '^1.0.0',
				'grunt-gitpull': '^0.3.0',
				'grunt-http': '^2.0.0',
				'grunt-svn-checkout': '^0.3.0',
				'grunt-vagrant-commands': '^0.1.0',
				'load-grunt-config': '^0.17.2'
			}
		}, 'package.json' );
	},
	/**
	 * A noop to trick Yeoman into running this generator with 'no methods'.
	 *
	 * @return {void}
	 */
	allowRun: function(){}
});
