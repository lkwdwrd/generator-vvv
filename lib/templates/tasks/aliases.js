module.exports = {
	'default': [
		'sql-in',
		'clean:content',
		'pull',
		"copy:protected",
		"clean:content",
		'vagrant_commands:up',
		'vagrant_commands:bootstrap',
		'hardlink'
	],
	'pull': [],
	'relink': [
		'clean:content',
		'pull',
		'vagrant_commands:build',
		'hardlink'
	],
	'import': [
		'sql-in',
		'vagrant_commands:import-db'
	],
	'backup': [
		'vagrant_commands:backup-db'
	],
	'cleanup': [
		'confirm:cleanup',
		'vagrant_commands:cleanup',
		'sql-out',
		'clean:project'
	],
	'sql-in': [
		'copy:sql-in',
		'clean:sql-in'
	],
	'sql-out': [
		'copy:sql-out',
		'clean:sql-out'
	]
};