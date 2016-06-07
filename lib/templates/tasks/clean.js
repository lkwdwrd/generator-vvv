// Configuration for the grunt clean task.
module.exports = {
	'project': {
		dot: true,
		src: [
			'.env',
			'.env.example',
			'app',
			'composer.json',
			'composer.lock',
			'config',
			'src',
			'tasks',
			'.gitignore',
			'Gruntfile.js',
			'node_modules',
			'package.json',
			'vvv-nginx.conf',
			'wp-cli.yml'
		]
	},
	'content': {
		dot: true,
		src: [],
		filter: function( filePath ){ return require( 'fs' ).lstatSync( filePath ).isSymbolicLink(); }
	},
	'sql-out': {
		src: "config/data/*.sql*"
	},
	'sql-in': {
		src: "./*.sql*",
	}
};
