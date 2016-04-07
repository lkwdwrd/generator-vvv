'use strict';
var Base = require( '../../lib/base' );
var fs = require( 'fs' );
var path = require( 'path' );
var slash = require( 'slash' );
var chalk = require( 'chalk' );
var isURI = require( 'valid-url' ).isWebUri;
var mkdirp = require( 'mkdirp' );
var tmpDir = require( 'os' ).tmpdir();


module.exports = Base.extend({
	_compose: function() {
		this.composeWith( 'vvv:dump', { arguments: [ 'all' ] } );
		this.composeWith( 'vvv:dump-task', { arguments: [ 'all' ] } );
		this.composeWith( 'vvv:pull', { arguments: [ 'uploads', 'db' ] } );
	},
	_initialize: function() {
		this.addRunMethod( 'downloadManifest', this._downloadManifest.bind( this ), 'initializing', 4 );
		this.addRunMethod( 'processManifest', this._processManifest.bind( this ), 'initializing', 4 );
		this.addRunMethod( 'getUploads', this._getUploads.bind( this ), 'configuring' );
		this.removeRunMethod( 'dump:manifest', 'writing' );
	},
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
	_getUploads: function( done ) {
		if ( ! this.install.uploads ) {
			return done();
		}

		done();
	},
	writing: {
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
		config: function() {
			mkdirp( this.destinationPath( path.join( 'config', 'data' ) ) );
			this.globalCopy( path.join( 'scripts', '**' ), path.join( 'config', 'scripts' ) );
			this.globalCopy(
				'project-create.sh',
				path.join( 'config', 'scripts',  this.install.site.constants.DB_NAME + '-create.sh' )
			);
		},
		rootFiles: function() {
			this.globalCopy( path.join( 'root', '*' ), '.' , { globOptions: { dot: true } } );
		}
	},
	install: function() {
		this.spawnCommandSync( 'npm', [ 'install' ] );
		this.spawnCommandSync( 'grunt' );
	}
});
