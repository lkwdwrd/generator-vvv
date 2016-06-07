/**
 * Provide an interface for managing the persistent .gvrc config files.
 *
 * Currently this supports get, set, and delete as actions.
 */

'use strict';

// Require dependencies.
var Base = require( '../../lib/base' );
var _ = require( 'lodash' );
var Promise = require( 'bluebird' );
var chalk = require( 'chalk' );

// Export the Source generator.
module.exports = Base.extend({
	/**
	 * The subgenerator description used in the main `yo:vvv` command.
	 *
	 * @type {String}
	 */
	description: 'Get and set config values with the command line.',
	/**
	 * Custom constructor to add argument and option definitions.
	 *
	 * @return {Generator} The constructed yeoman generator object.
	 */
	constructor: function() {
		Base.apply( this, arguments );
		this.argument( 'operation', {
			desc: '"get", "set", or "delete".',
			required: true
		} );
		this.argument( 'configKey', {
			desc: 'Config key or "all".',
			required: false
		} );
		this.argument( 'configVal', {
			desc: 'The value to set',
			required: false
		} );
		this.option( 'global', {
			type: Boolean,
			desc: 'Get or write to the global settings',
			alias: 'g'
		} );
	},
	/**
	 * Compose require with the dump and dump-task to output the affected files.
	 *
	 * Since config doesn't really deal with installs directly except for
	 * creating and modifying the local .gvrc file, this method removes most of
	 * the default actions.
	 *
	 * The passed 'operation' argument is then matched to it's corresponding
	 * processing method and it is added to the yeoman run-loop. If no valid
	 * operation is sent, execution is stopped and an error is output.
	 *
	 * @return {void}
	 */
	_initialize: function() {
		this.removeRunMethod( 'welcome', 'initializing', 1 );
		this.removeRunMethod( 'setUpAppPaths', 'initializing', 9 );
		this.removeRunMethod( 'shareObjects', 'initializing', 9 );
		this.removeRunMethod( 'goodbye', 'end', 100 );
		if ( this.options.global ) {
			this.removeRunMethod( 'isVagrant', 'initializing', 3 );
			this.removeRunMethod( 'gatherInstalls', 'initializing', 5 );
			this.removeRunMethod( 'selectInstall', 'initializing', 7 );
		}
		if ( 'get' === this.operation ) {
			this.addRunMethod(
				'configGet',
				this._getValue,
				'configuring'
			);
		} else if ( 'set' === this.operation ) {
			this.addRunMethod(
				'configSet',
				this._setValue,
				'configuring'
			);
		} else if ( 'delete' === this.operation ) {
			this.addRunMethod(
				'configDelete',
				this._deleteValue,
				'configuring'
			);
		} else {
			this.log (
				chalk.red( 'The config operation must be ' ) +
				chalk.red.bold( '"get"' ) +
				chalk.red( ', ' ) +
				chalk.red.bold( '"set"' ) +
				chalk.red( ', or ' ) +
				chalk.red.bold( '"delete"' ) +
				chalk.red( '.' )
			);
			process.exit( 1 );
		}
	},
	/**
	 * Gets a configuration value from the rc config and outputs it.
	 *
	 * Object syntax is accepted to get nested values. So for instance if you
	 * have an object that looks like the following you could ask for
	 * 'someKey.nested' and it would return 'value'.
	 *
	 * ```
	 * {
	 *   someKey: {
	 *     nested: value
	 *   }
	 * }
	 * ```
	 *
	 * Dashes are also converted to camelCase for ease of use on the command
	 * line. So for instance given the above object I could output value by
	 * running:
	 *
	 * ```
	 * $ yo vvv:config get some-key.nested
	 * ```
	 *
	 * It's worth noting 'get' will by default look for values in any of the
	 * potential rc locations. Local will override global, will override the
	 * superglobal values, but if a value is present and the 'rc' module can
	 * find it, it will be returned. If the global flag is set, ONLY the user
	 * specific global .gvrc values will be returned.
	 *
	 * @param  {Function} done Callack to tell the environment work is done.
	 * @return {void}
	 */
	_getValue: function( done ){
		if ( ! this.configKey ) {
			this.log( chalk.red( 'You must pass a key to get a config value.' ) );
			this.log( chalk.red( 'yo vvv:config get <key>' ) );
			process.exit( 1 );
		}
		var key = this._camelCasify( this.configKey ),
			context = this.options.global ? 'global' : null,
			value = ( 'all' === key ) ? this.rcConfig.getAll( context ) : this.rcConfig.get( key, context );

		if ( 'object' === typeof value ) {
			this.log( JSON.stringify( value, null, '  ' ) );
		} else if ( undefined !== value ) {
			this.log( value );
		} else {
			this.log(
				chalk.blue.bold( this.configKey ) +
				chalk.yellow( ' does not appear to be set.' )
			);
		}
		done();
	},
	/**
	 * Sets a speciic configuration value and saves it to the config file.
	 *
	 * Object syntax is accepted to set nested values.  
	 *
	 * ```
	 * {
	 *   "someKey": {
	 *     "nested": "value"
	 *   }
	 * }
	 * ```
	 *
	 * If your configuration looks like the above you could set another value
	 * in 'someKey' by running `yo vvv:config set somekey.other foo` and it will
	 * make the saved config object look like this:
	 *
	 * ```
	 * {
	 *   "someKey": {
	 *     "nested": "value",
	 *     "other": "foo"
	 *   }
	 * }
	 * ```
	 *
	 * Dashes are also converted to camelCase for ease of use on the command
	 * line. So for instance given the example above I could have added the
	 * value by running:
	 *
	 * ```
	 * $ yo vvv:config set some-key.other foo
	 * ```
	 *
	 * @param  {Function} done Callack to tell the environment work is done.
	 * @return {void}
	 */
	_setValue: function( done ){
		if ( ! this.configKey ) {
			this.log( chalk.red( 'You must pass a key to get a config value.' ) );
			this.log( chalk.red( 'yo vvv:config set <key> <value>' ) );
			process.exit( 1 );
		}
		if ( ! this.configVal ) {
			this.log( chalk.red( 'You must pass a value to set.' ) );
			this.log( chalk.red( 'yo vvv:config set <key> <value>' ) );
			process.exit( 1 );
		}
		this.rcConfig.set(
			this._camelCasify( this.configKey ),
			this.configVal,
			this.options.global
		).then( function(){
			this.log(
				chalk.green.bold( 'Success: ' ) +
				chalk.blue.bold( this._camelCasify( this.configKey ) ) +
				' has been set to ' +
				chalk.blue.bold( this.configVal )
			);
			done();
		}.bind( this ) );
	},
	/**
	 * Removes one or more values from a config file.
	 *
	 * All arguments passed are expected to be keys for removal. If a key does
	 * not exist, it is ignored. The configuration file is only written if
	 * the object it represents has been mutated.
	 *
	 * As in the get and set methods, if you run the delete method, nested
	 * keys can be removed by using object syntax. If you desire, dash syntax
	 * is also converted to camel case for ease of use. For example:
	 *
	 * ```
	 * {
	 *   "someKey": {
	 *     "nested": "value",
	 *     "other": "foo"
	 *   }
	 * }
	 * ```
	 *
	 * I can remove the 'other' key from the config by running the following:
	 *
	 * ```
	 * $ yo vvv:config delete some-key.other
	 * ```
	 *
	 * Once run the other key will be gone, but the 'someKey' objects and the
	 * 'someKey.nested' property will still be available.
	 * 
	 * @param  {Function} done Callack to tell the environment work is done.
	 * @return {void}
	 */
	_deleteValue: function( done ) {
		if ( ! this.configKey ) {
			this.log( chalk.red( 'You must pass a key to remove a config value.' ) );
			this.log( chalk.red( 'yo vvv:config delete <key..>' ) );
			process.exit( 1 );
		}
		var keys = _.without( _.clone( this.arguments ), [ 'delete' ] ),
			write = false;

		Promise.all(
			keys.map( function( key ) {
				return this.rcConfig.delete(
					this._camelCasify( key ),
					this.options.global,
					false
				).then( function( key ){
					write = true;
					return chalk.green.bold( 'Success: ' ) +
						chalk.blue.bold( this._camelCasify( key ) ) +
						' has been removed.';
				}.bind( this ) ).catch( function( key ) {
					return chalk.yellow.bold( 'Info: ' ) +
						chalk.blue.bold( this._camelCasify( key ) ) +
						' does not exist in the config.';
				}.bind( this ) );
			}, this )
		).then( function( messages ) {
			this.log( messages.join( "\n" ) );
			if ( write ) {
				return this.rcConfig._save( this.options.global )
					.then( this.rcConfig.reset.bind( this.rcConfig ) )
					.then( done );
			} else {
				done();
			}
		}.bind( this ) );
	},
	/**
	 * A helper which takes a dahsed-key and returns it camelCased.
	 *
	 * @param  {String} key A dashed key (this-is-a-key).
	 * @return {String}     A camel cased key (thisIsAKey).
	 */
	_camelCasify: function( key ) {
		return key.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
	}
});
