module.exports = {
	'sql-out': {
		expand: true,
		flatten: true,
		src: 'config/data/*.sql*',
		dest: './'
	},
	'sql-in': {
		expand: true,
		flatten: true,
		src: './*.sql*',
		dest: 'config/data/'
	}
};
