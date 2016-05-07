/**
 * Methods to assist in composing generators together in harmony.
 */

/**
 * Add a function to the queue for this generators run loop.
 *
 * This function simply adds it to the runTree. This is typically done in a
 * subgenerator's `_initialize` method. This allows the root subgenerator to
 * remove methods if necessary to further refine the lifecycle. Added run
 * methods then get added to the environments run loop based on their
 * lifecycle stage, priority, and whether or not multiple of this method are
 * allowed (composed generators sometimes add the same thing).
 *
 * @param {String}   name      The name for this run method.
 * @param {Function} callback  The callback function to add to the run loop.
 * @param {String}   lifecycle The yeoman lifecycle stage to run this on.
 * @param {Int}      priority  A numbered priority to control method run order.
 * @param {Bool}     multiple  Whether to allow this method multipl times.
 * @return {void}
 */
function addRunMethod( name, callback, lifecycle, priority, multiple ) {
	var once = !once;
	priority = ( priority ) ? parseInt( priority, 10 ) : 10;
	if ( ! this.runTree[ lifecycle ] ) {
		this.runTree[ lifecycle ] = [];
	}
	if ( ! this.runTree[ lifecycle ][ priority ] ) {
		this.runTree[ lifecycle ][ priority ] = {};
	}
	this.runTree[ lifecycle ][ priority ][ name ] = { cb: callback, multiple: multiple, context: this };
}

/**
 * Removes a run method from the runTree.
 *
 * When done in the `_initialize` method, this stops the callback from being
 * added to the environments run loop. Once there there is no easy way to
 * remove the callback method.
 *
 * @param  {String} name      The run method to remove.
 * @param  {String} lifecycle The yeoman lifecycle stage it was set to run at.
 * @param  {Int}    priority  The priority for the removed run method.
 * @return {void}
 */
function removeRunMethod( name, lifecycle, priority ) {
	priority = ( priority ) ? parseInt( priority, 10 ) : 10;
	if ( this.runTree[ lifecycle ] && this.runTree[ lifecycle ][ priority ] ) {
		delete this.runTree[ lifecycle ][ priority ][ name ];
	}
}

/**
 * Parses the runTree and registers callbacks with the Yeoman run loop.
 *
 * @param  {Function} done Callack to tell the environment work is done.
 * @return {void}
 */
function processRunMethods( done ) {
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
				this.env.runLoop.add( lifecycle, priorityTree[ i ][ name ].cb.bind( priorityTree[ i ][ name ].context ), opts );
			}
		}
	}
	done();
}

/**
 * Sets up object sharing with all of the composed subgenerators.
 *
 * Without sharing object, the composed subgenerators are unaware of critical
 * information about the install, including the install itself, rcConfic,
 * app-paths, and even the correct Vagrant path.
 *
 * @param  {Function} done Callack to tell the environment work is done.
 * @return {void}
 */
function shareObjects( done ) {
	this._composedWith.forEach( _shareObjects.bind( this ) );
	done();
}

/**
 * Sets up object sharing with on composed subgenerator.
 *
 * Shares the main generator's install, rcConfig, app-paths, and vagrantPath
 * with a composed subgenerator. Without sharing, composed subgenerators
 * will generally fall on their face because they are unaware of the
 * selected install's details.
 *
 * @param  {Object} generator The yeoman generator object.
 * @return {void}
 */
function _shareObjects( generator ) {
	generator.install = this.install;
	generator.rcConfig = this.rcConfig;
	generator.appPaths = this.appPaths;
	generator.options.vagrantPath = this.options.vagrantPath;
}

// Export these methods to mix with the base object prototype.
module.exports = {
	addRunMethod: addRunMethod,
	removeRunMethod: removeRunMethod,
	processRunMethods: processRunMethods,
	shareObjects: shareObjects
};
