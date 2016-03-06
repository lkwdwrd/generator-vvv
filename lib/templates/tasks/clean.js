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
		src: []
	},
	'sql-out': {
		src: "config/data/*.sql*"
	},
	'sql-in': {
		src: "./*.sql*",
	}
};
