
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

function removeRunMethod( name, lifecycle, priority ) {
	priority = ( priority ) ? parseInt( priority, 10 ) : 10;
	if ( this.runTree[ lifecycle ] && this.runTree[ lifecycle ][ priority ] ) {
		delete this.runTree[ lifecycle ][ priority ][ name ];
	}
}

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

function shareObjects( done ) {
	this._composedWith.forEach( _shareObjects.bind( this ) );
	done();
}

function _shareObjects( generator ) {
	generator.install = this.install;
	generator.rcConfig = this.rcConfig;
	generator.appPaths = this.appPaths;
	generator.options.vagrantPath = this.options.vagrantPath;
}

module.exports = {
	addRunMethod: addRunMethod,
	removeRunMethod: removeRunMethod,
	processRunMethods: processRunMethods,
	shareObjects: shareObjects
};
