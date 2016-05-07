/**
 * Boostraps an install based on a `wpmanifest.json` file.
 *
 * You can invoke this generator with `yo vvv:boostrap <options> <args>`.
 *
 * The first argument passed is assumed to be the location of the manifest file
 * and the second argument passed will be the install loctaion. The manifest
 * can be a remote file accessible either through HTTP or SCP, or a local
 * file path. If nothing is passed, Generator VVV assumes the manifest is in
 * the current working directory. If no install location is passed, Generator
 * VVV will place the install in the `www` folder in a sudirectory named after
 * the project's name. If you use composer style names (`namespace/name`) then
 * it will create a namespace directory and then the project directory within
 * that directory.
 *
 * After dumping all of the files into the install location, bootstrap will then
 * call 'npm install' followed by 'grunt' to finish bootstrapping the site.
 *
 * It can take a few minutes, but when complete the new site will be available
 * at the defined local URL.
 */

'use strict';

// Require dependencies.
var Base = require( '../../lib/base' );
var fs = require( 'fs' );
var path = require( 'path' );
var slash = require( 'slash' );
var chalk = require( 'chalk' );
var isURI = require( 'valid-url' ).isWebUri;
var mkdirp = require( 'mkdirp' );
var tmpDir = require( 'os' ).tmpdir();

// Export the boostrap generator object.
module.exports = Base.extend({
	description: 'Turn an existing wpmanifest.json into a usable site.',
	/**
	 * Compose boostrap with the dump, dump-task, and pull subgenerators.
	 *
	 * @return {void}
	 */
	_compose: function() {
		this.composeWith( 'vvv:dump', { arguments: [ 'all' ] } );
		this.composeWith( 'vvv:dump-task', { arguments: [ 'all' ] } );
		this.composeWith( 'vvv:pull', { arguments: [ 'uploads', 'db' ] } );
	},
	/**
	 * Set up run-methods to trigger during the yeoman lifecycle.
	 *
	 * This adds a methods for processing the manifest, and removes the method
	 * for dumping the manifest because we already have it when this generatot
	 * is triggered.
	 *
	 * @return {void}
	 */
	_initialize: function() {
		this.addRunMethod( 'downloadManifest', this._downloadManifest.bind( this ), 'initializing', 4 );
		this.addRunMethod( 'processManifest', this._processManifest.bind( this ), 'initializing', 4 );
		this.addRunMethod( 'getUploads', this._getUploads.bind( this ), 'configuring' );
		this.removeRunMethod( 'dump:manifest', 'writing' );
	},
	/**
	 * If necessary, uses MC Download to get a remote manifest.
	 *
	 * It will auto-detect if a string is a URL, but you will need to pass the
	 * `--type="scp" option if the manifest is available only via SCP. If the
	 * first arg is not a url and the type option is not passed, it assumes it
	 * is a local file path and doesn't attempt any download.
	 *
	 * If a download fails, it will output the error to the console and stop
	 * the process.
	 *
	 * @param  {Function} done Callack to tell the environment work is done.
	 * @return {void}
	 */
	_downloadManifest: function( done ) {
		var manifest = this.arguments[0] || '.',
			httpManifest = isURI( manifest );

		try{
			fs.unlinkSync( path.join( tmpDir, 'wpmanifest.json' ) );
		} catch( e ) { /* File isn't there, no problem. */ }

		if ( ! httpManifest && 'scp' !== this.options.type ) {
			return done();
		}

		this.download( manifest, tmpDir, { adapterOpts: { progress: 'text' } } )
			.then( done )
			.catch( function( err ){
				this.log( err.message );
				process.exit( 0 );
			}.bind( this ));
	},
	/**
	 * Validates the passed manifest and moves it into the install location.
	 *
	 * This attempts to validate that we can at least read the manifest file and
	 * get JSON data out of it. If it fails to validate or read JSON, it will
	 * output an error message and stop the process.
	 *
	 * This method also verifies that the passed install location is within the
	 * VVV install selected. If not it will also bail and stop the process. This
	 * prevents installs that will not actually bootstrap from expanding.
	 *
	 * If any directories do not exist when processing the install location they
	 * will be created with mkdirp.
	 *
	 * @param  {Function} done Callack to tell the environment work is done.
	 * @return {void}
	 */
	_processManifest: function( done ) {
		var manifest, projectPath,
			manifestPath = path.resolve( this.arguments[0] || '.' );

		if ( 'wpmanifest.json' !== path.basename( manifestPath ) ) {
			manifestPath = path.join( manifestPath, 'wpmanifest.json' );
		}

		try {
			fs.lstatSync( manifestPath );
		} catch( e ) {
			try {
				fs.lstatSync(  path.join( tmpDir, 'wpmanifest.json' ) );
				manifestPath = path.join( tmpDir, 'wpmanifest.json' );
			} catch( e ) {
				this.log( chalk.red.bold( 'Could not find a manifest file at ' + manifestPath ) );
				process.exit( 0 );
			}
		}

		try {
			manifest = require( manifestPath );
		} catch( e ) {
			this.log( chalk.red.bold( 'That manifest does not seem to be JSON :(' ) );
			process.exit( 0 );
		}

		if ( ! manifest.name || manifest.name.match( /[^a-zA-z0-9-_\/]/ ) ) {
			this.log( chalk.red.bold( 'This manifest file appears to be malformed... :(' ) );
			process.exit( 0 );
		}

		projectPath = path.resolve( this.arguments[1] || path.join( this.options.vagrantPath, 'www', manifest.name ) );
		if ( ! this.isVVVPath( projectPath ) ) {
			this.log( chalk.red.bold( 'That destination path is not in the VVV directory!' ) );
			this.log( '' );
			this.log( chalk.red( 'You might try...') );
			this.log( chalk.red( '  * Moving to a directory one or two levels deep in the VVV www/ folder.' ) );
			this.log( chalk.red( '  * Not specifying a directory and allowing the generator to create one.' ) );
			process.exit( 0 );
		}

		mkdirp.sync( projectPath );
		this.destinationRoot( projectPath );
		process.chdir( projectPath );
		fs.rename( manifestPath, path.join( projectPath, 'wpmanifest.json' ), done );
	},
	writing: {
		/**
		 * Writes out the supporting WordPress files.
		 *
		 * @return {void}
		 */
		wp: function() {
			// Bail if we have a root repo as a source.
			var context, i, length = this.install.src.length;
			for ( i = 0; i < length; i++ ) {
				if ( 'root' === this.install.src[ i ].map ) {
					return;
				}
			}
			// Copy over the WP configuration files.
			context = {
				contentPath: slash( this.getAppPath( 'content-path' ) ),
				wpPath: slash( this.getAppPath( 'wp-path' ) ),
				vendorDir: slash( this.getAppPath( 'vendor-dir' ) )
			};
			this.globalTemplate( path.join( 'wp', '*' ), 'app', context );
			// NOTE: .gitignore has to be individually copied because the template
			// options object doesn't support globOptions like the copy one does.. :(
			this.globalTemplate(
				path.join( 'wp', '.gitignore' ),
				path.join( 'app', '.gitignore' ),
				context
			);
		},
		/**
		 * Copy over the configuration files and scripts for creating the site.
		 *
		 * @return {void}
		 */
		config: function() {
			mkdirp( this.destinationPath( path.join( 'config', 'data' ) ) );
			this.globalCopy( path.join( 'scripts', '**' ), path.join( 'config', 'scripts' ) );
			this.globalCopy(
				'project-create.sh',
				path.join( 'config', 'scripts',  this.install.site.constants.DB_NAME + '-create.sh' )
			);
		},
		/**
		 * Copy over the root files files, including the Gruntfile.
		 *
		 * @return {void}
		 */
		rootFiles: function() {
			this.globalCopy( path.join( 'root', '*' ), '.' , { globOptions: { dot: true } } );
		}
	},
	/**
	 * Run npm install followed by Grunt, alerting the user it is occuring.
	 *
	 * The options `--skip-install` can be passed to suppress this from running.
	 *
	 * @return {void}
	 */
	install: function() {
		if ( this.options.skipInstall ) {
			return;
		}
		this.log();
		this.log(
			chalk.yellow( 'Running ' ) +
			chalk.yellow.bold( 'npm install' ) +
			chalk.yellow( ' for you. If this fails, try running it yourself.' )
		);
		this.log();
		this.spawnCommandSync( 'npm', [ 'install' ] );

		this.log();
		this.log(
			chalk.yellow( 'Running ' ) +
			chalk.yellow.bold( 'grunt' ) +
			chalk.yellow( ' for you. If this fails, try running it yourself.' )
		);
		this.log();
		this.spawnCommandSync( 'grunt' );
	}
});
