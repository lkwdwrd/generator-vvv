/**
 * A specialized dump command for outputting grunt tasks.
 *
 * This file reads in the manifest declaration and then allows outputting of
 * the following tasks:
 *
 * - symplink (specifically customized by app paths)
 * - vagrant_commands (keys into the DB name among other things)
 * - src (customized by the source repositories defined)
 * - clean (set up to clean the correct app paths)
 * - confirm
 * - copy (copies file to the correct app paths)
 */

'use strict';

// Require dependencies.
var Base = require( '../../lib/base' );
var _ = require( 'lodash' );
var path = require( 'path' );
var slash = require( 'slash' );
var chalk = require( 'chalk' );

// Export the dump-task generator.
module.exports = Base.extend({
	/**
	 * The subgenerator description used in the main `yo:vvv` command.
	 *
	 * @type {String}
	 */
	description: 'Output grunt tasks based on manifest.json values.',
	/**
	 * Maps command line arguments to processing methods for each dump type.
	 *
	 * @type {Object}
	 */
	dumpMap: {
		'symlink': '_dumpSymlink',
		'vagrant_commands': '_dumpVagrantCommands',
		'src': '_dumpSrcTasks',
		'clean': '_dumpClean',
		'confirm': '_dumpConfirm',
		'copy': '_dumpCopy',
	},
	/**
	 * If an argument matches the dump map, add it to the yeoman lifecycle
	 *
	 * This method will always dump the aliases task.
	 *
	 * @param  {String} dump The specific dump to perform.
	 * @return {void}
	 */
	_initialize: function() {
		try {
			this.taskAliases = require( this.destinationPath( path.join( 'tasks', 'aliases.js' ) ) );
		} catch( e ) {
			this.taskAliases = this._getStarterTask( 'aliases' );
		}
		this.arguments.forEach( this._processDump.bind( this ) );
		this.addRunMethod( 'dump:aliases', this.wrapDone( this._dumpAliases ), 'writing', 200 );
	},
	/**
	 * Set up a specific grunt task to output based on the dump map.
	 *
	 * @param  {String} dump The specific task to add ot the lifecycle.
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
	 * Gets a globalized 'starter task' that will be customized before output.
	 *
	 * @param  {string} task The task name to retrieve.
	 * @return {Object}      An object representing the intial task config values.
	 */
	_getStarterTask: function( task ) {
		return require( this.globalTemplatePath( path.join( 'tasks', task + '.js' ) ) );
	},
	/**
	 * Process and output the grunt symlink task.
	 *
	 * @return {void}
	 */
	_dumpSymlink: function() {
		var basicFiles = { expand: true, cwd: 'src', flatten: true },
			taskConfig = this._getStarterTask( 'symlink' );

		taskConfig.src.files.push( _.assign( _.clone( basicFiles ), {
			src: [ 'dropins/*', '*/dropins/*', '*/*' ],
			dest: slash( this.getAppPath( 'content-path', 'app' ) ),
			filter: 'isFile'
		} ) );
		taskConfig.src.files.push( _.assign( _.clone( basicFiles ), {
			src: [ 'plugins/*', '*/plugins/*' ],
			dest: slash( this.getAppPath( 'plugin-path', 'app' ) )
		} ) );
		taskConfig.src.files.push( _.assign( _.clone( basicFiles ), {
			src: [ 'themes/*', '*/themes/*' ],
			dest: slash( this.getAppPath( 'theme-path', 'app' ) )
		} ) );
		taskConfig.src.files.push( _.assign( _.clone( basicFiles ), {
			src: [ 'mu-plugins/*', '*/mu-plugins/*' ],
			dest: slash( this.getAppPath( 'mu-plugin-path', 'app' ) )
		} ) );
		taskConfig.src.files.push( _.assign( _.clone( basicFiles ), {
			cwd: slash( this.getAppPath( 'wp-path', 'app', path.join( 'wp-content', 'themes' ) ) ),
			src: '*',
			dest: slash( this.getAppPath( 'theme-path', 'app' ) )
		} ) );

		this.writeTask( taskConfig, 'symlink' );
	},
	/**
	 * Process and output the grunt vagrant_commands task.
	 *
	 * @return {void}
	 */
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
	/**
	 * Process and output the grunt gitPull and svn_checkout tasks.
	 *
	 * @return {void}
	 */
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
	/**
	 * Process source repositories so they go to the right location based on type.
	 *
	 * @return {void}
	 */
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
	/**
	 * Create a filter function will only allow X of a certian type through.
	 *
	 * @param  {String}   map  A map to the property in each object.
	 * @param  {mixed}    test The value to test for and filter out after X.
	 * @param  {Int}      x    The number of items to let through.
	 * @return {Function}      The function for use as a filter function.
	 */
	_keepX: function( map, test, x ) {
		var propMap = _.property( map );
		x = parseInt( x, 10 );
		/**
		 * A function to filter out items with 'test' value after 'x' number.
		 *
		 * @param  {Object} val The value to test for 'test' value at 'map'.
		 * @return {Bool}       Whether or not the value is present and less
		 *                      than 'x' items with that value have passed
		 *                      through the filter.
		 */
		return function KeepX( val ) {
			if ( propMap( val ) === test ) {
				return ( x-- > 0 );
			} else {
				return true;
			}
		};
	},
	/**
	 * Process and output the grunt aliases file.
	 *
	 * @return {void}
	 */
	_dumpAliases: function() {
		this.writeTask( this.taskAliases, 'aliases' );
	},
	/**
	 * Process and output the grunt clean task.
	 *
	 * @return {void}
	 */
	_dumpClean: function() {
		var taskConfig = this._getStarterTask( 'clean' );
		// Inject correct content directories
		taskConfig.content.src.push( slash( this.getAppPath( 'content-path', 'app', path.join( '*', '*' ) ) ) );
		taskConfig.content.src.push( slash( this.getAppPath( 'content-path', 'app', path.join( '*', '*', '*' ) ) ) );
		this.writeTask( taskConfig, 'clean' );
	},
	/**
	 * Process and output the grunt confirm task.
	 *
	 * @return {void}
	 */
	_dumpConfirm: function() {
		var taskConfig = this._getStarterTask( 'confirm' );
		this.writeTask( taskConfig, 'confirm' );
	},
	/**
	 * Process and output the grunt copy task.
	 *
	 * @return {void}
	 */
	_dumpCopy: function() {
		var taskConfig = this._getStarterTask( 'copy' );
		this.writeTask( taskConfig, 'copy' );
	},

	/**
	 * A noop to trick Yeoman into running this generator with 'no methods'.
	 *
	 * @return {void}
	 */
	allowRun: function(){}
});
