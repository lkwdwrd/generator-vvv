var Base = require( '../../lib/base' );
var _ = require( 'lodash' );
var path = require( 'path' );
var slash = require( 'slash' );
var chalk = require( 'chalk' );

module.exports = Base.extend({
	dumpMap: {
		'symlink': '_dumpSymlink',
		'vagrant_commands': '_dumpVagrantCommands',
		'src': '_dumpSrcTasks',
		'clean': '_dumpClean',
		'confirm': '_dumpConfirm',
		'copy': '_dumpCopy',
	},
	_initialize: function() {
		try {
			this.taskAliases = require( this.destinationPath( path.join( 'tasks', 'aliases.js' ) ) );
		} catch( e ) {
			this.taskAliases = this._getStarterTask( 'aliases' );
		}
		this._testing = 0;
		this.arguments.forEach( this._processDump.bind( this ) );
		this.addRunMethod( 'dump:aliases', this.wrapDone( this._dumpAliases ), 'writing', 200 );
	},
	_processDump: function ( dump ) {
		this._testing++;
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
	_getStarterTask: function( task ) {
		return require( this.globalTemplatePath( path.join( 'tasks', task + '.js' ) ) );
	},
	_dumpSymlink: function() {
		var basicFiles = { expand: true, cwd: 'src', flatten: true },
			taskConfig = this._getStarterTask( 'symlink' );

		taskConfig.src.files.push( _.assign( _.clone( basicFiles ), {
			src: [ 'dropins/*', '*/dropins/*', '*/*', '../config/.protected/*' ],
			dest: slash( this.getAppPath( 'content-path', 'app' ) ),
			filter: 'isFile'
		} ) );
		taskConfig.src.files.push( _.assign( _.clone( basicFiles ), {
			src: [ 'plugins/*', '*/plugins/*', '../config/.protected/plugins/*' ],
			dest: slash( this.getAppPath( 'plugin-path', 'app' ) )
		} ) );
		taskConfig.src.files.push( _.assign( _.clone( basicFiles ), {
			src: [ 'themes/*', '*/themes/*', '../config/.protected/themes/*' ],
			dest: slash( this.getAppPath( 'theme-path', 'app' ) )
		} ) );
		taskConfig.src.files.push( _.assign( _.clone( basicFiles ), {
			src: [ 'mu-plugins/*', '*/mu-plugins/*', '../config/.protected/mu-plugins/*' ],
			dest: slash( this.getAppPath( 'mu-plugin-path', 'app' ) )
		} ) );
		taskConfig.src.files.push( _.assign( _.clone( basicFiles ), {
			cwd: slash( this.getAppPath( 'wp-path', 'app', path.join( 'wp-content', 'themes' ) ) ),
			src: '*',
			dest: slash( this.getAppPath( 'theme-path', 'app' ) )
		} ) );

		this.writeTask( taskConfig, 'symlink' );
	},
	_dumpVagrantCommands: function() {
		var taskConfig = this._getStarterTask( 'vagrant_commands' ),
			projectSlug = this.install.site.constants.DB_NAME;

		taskConfig = _.assign( taskConfig, {
			'import-db': { commands: [ [ 'ssh', '--command=sudo ' + projectSlug + ' db_import' ] ] },
			'backup-db': { commands: [ [ 'ssh', '--command=sudo ' + projectSlug + ' db_bak'    ] ] },
			'build':     { commands: [ [ 'ssh', '--command=sudo ' + projectSlug + ' build'     ] ] },
			'cleanup':   { commands: [ [ 'ssh', '--command=sudo ' + projectSlug + ' cleanup'   ] ] },
			'bootstrap': { commands: [ [ 'ssh', '--command=find /srv/www -mindepth 3 -maxdepth 5 -name "' + projectSlug + '-create.sh" | head -1 | xargs sudo bash' ] ] }
		} );

		this.writeTask( taskConfig, 'vagrant_commands' );
	},
	_dumpSrcTasks: function() {
		var tasks = _.chain( this.install.src )
			.filter( this._keepX( 'map', 'root', 1 ) )
			.groupBy( 'type' )
			.mapValues( this._splitSrcTasks.bind( this ) )
			.value();

		if ( tasks.git ) {
			this.taskAliases.pull.push( 'gitPull' );
			this.writeTask( tasks.git, 'gitPull' );
		} else {
			this.fs.delete( this.destinationPath( path.join( 'tasks', 'gitPull.js' ) ) );
			this.taskAliases.pull = _.without( this.taskAliases.pull, 'gitPull' );
		}

		if ( tasks.svn ) {
			this.taskAliases.pull.push( 'svn_checkout' );
			this.writeTask( tasks.svn, 'svn_checkout' );
		} else {
			this.fs.delete( this.destinationPath( path.join( 'tasks', 'svn_checkout.js' ) ) );
			this.taskAliases.pull = _.without( this.taskAliases.pull, 'svn_checkout' );
		}

		// Ensure unique values only in the pull alias
		this.taskAliases.pull = _.uniq( this.taskAliases.pull );
	},
	_splitSrcTasks: function( val ) {
		var repoPathMap = {
			root: [ 'app' ],
			content: [ 'src' ],
			plugin: [ 'src', 'plugins' ],
			theme: [ 'src', 'themes' ],
			muplugin: [ 'src', 'mu-plugins' ],
			dropin: [ 'src', 'dropins' ],
			vip: [ 'src', 'vip' ]
		};
		val = _.groupBy( val, 'map' );
		return _.mapValues( val, function( val ){
			return { repos: _.map( val, function( val ) {
				var repo = {};
				if ( val.map.endsWith( '-folder' ) ) {
					var folderType = val.map.slice( 0, -7 );
					if ( -1 === [ 'themes', 'plugins', 'mu-plugins' ].indexOf( folderType ) ) {
						this.log(
							chalk.red.bold( "Uh oh!\n" ) +
							chalk.red( "One of your source maps contains a folder type that " ) +
							chalk.red( "doesn't exist... please fix this and try again. :(\n" ) +
							chalk.red( "Folder maps must be themes-folder, plugins-folder, or " ) +
							chalk.red( "mu-plugins-folder.\n\n") +
							chalk.red.bold( "See :\n") +
							chalk.red( JSON.stringify( val, null, "  " ) )
						);
						process.exit( 0 );
					}
					repo.dir = folderType;
					if ( val.dir ) {
						repo.path = [ 'src', val.dir ];
					} else if ( path.extname( val.url ) ) {
						repo.path = [ 'src', path.basename( val.url ).slice( 0, 0 - path.extname( val.url ) ) ];
					} else {
						repo.path = [ 'src', path.basename( val.url ) ];
					}
				}
				return _.assign( {
					repo: val.url,
					path: repoPathMap[ val.map ],
				}, repo );
			}.bind( this ) ) };
		}.bind( this ) );
	},
	_keepX: function( map, test, x ) {
		var propMap = _.property( map );
		x = parseInt( x, 10 );
		return function KeepX( val ) {
			if ( propMap( val ) === test ) {
				return ( x-- > 0 );
			} else {
				return true;
			}
		};
	},
	_dumpAliases: function() {
		this.writeTask( this.taskAliases, 'aliases' );
	},
	_dumpClean: function() {
		var taskConfig = this._getStarterTask( 'clean' );
		// Inject correct content directories
		taskConfig.content.src.push( slash( this.getAppPath( 'content-path', 'app', '*' ) ) );
		taskConfig.content.src.push( slash( this.getAppPath( 'content-path', '!app', 'uploads' ) ) );
		this.writeTask( taskConfig, 'clean' );
	},
	_dumpConfirm: function() {
		var taskConfig = this._getStarterTask( 'confirm' );
		this.writeTask( taskConfig, 'confirm' );
	},
	_dumpCopy: function() {
		var taskConfig = this._getStarterTask( 'copy' );
		taskConfig.protected.cwd = slash( this.getAppPath( 'content-path', 'app' ) );
		this.writeTask( taskConfig, 'copy' );
	},
	allowRun: function(){}
});
