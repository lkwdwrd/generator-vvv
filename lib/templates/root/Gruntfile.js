var path = require( 'path' );
var gruntConfig = require( 'load-grunt-config' );

module.exports = function ( grunt ) {
	gruntConfig( grunt, {
		configPath: path.join( process.cwd(), 'tasks' ),
		jitGrunt: {
			staticMappings: {
				gitPull: 'grunt-gitpull'
			}
		}
	} );
};
