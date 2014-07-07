module.exports = function (grunt) {
	'use strict';
	// Project configuration
	grunt.initConfig({
		pkg:    grunt.file.readJSON('package.json'),
		gitPull: {
<%			 if (dependencies) {
%>			dependencies: {
				repos: [
					{
						path: [],
						dir: 'deps',
						repo: '<%= dependencies %>'
					}
				]
			}<% if ( repos ) { %>,
<% } }
			if ( repos ) {
%>			themes: {
				repos: [
<%					var i, length;
					for (i = 0, length = repos.theme.length; i < length; i++) {
%>					{
						path: ['src', 'themes'],
						repo: '<%= repos.theme[i] %>'
					}<% if((i + 1) !== length) { %>,<% } %>
<% } %>				]
			},
			plugins: {
				repos: [
<%					for (i = 0, length = repos.plugin.length; i < length; i++) {
%>					{
						path: ['src', 'plugins'],
						repo: '<%= repos.plugin[i] %>'
					}<% if((i + 1) !== length) { %>,<% } %>
<% } %>				]
			}<% } %>
		},
		vagrant_commands: {
			restart: {
				commands: [
					['up'],
					['halt'],
					['up', '--provision']
				]
			}
			import_db: {
				commands: [
					['ssh', '--command=cd /var/sites/<%= site.id %> && bash scripts/import-sql.sh']
				]
			},
			install_plugins: {
				commands: [
					['ssh', '--command=cd /var/sites/<%= site.id %> && bash scripts/plugins.sh']
				]
			},
			symlinks: {
				commands: [
					['ssh', '--command=cd /var/sites/<%= site.id %> && bash scripts/clear-links.sh'],
					['ssh', '--command=cd /var/sites/<%= site.id %> && bash scripts/dependencies.sh'],
					['ssh', '--command=cd /var/sites/<%= site.id %> && bash scripts/src.sh']
				]
			}
		}
	});

	// Load tasks
	require('load-grunt-tasks')(grunt);

	// Register tasks
	grunt.registerTask('default', ['gitPull', 'vagrant_commands:restart']);
	grunt.registerTask('provision', ['vagrant_commands:restart']);
	grunt.registerTask('db', ['vagrant_commands:import_db']);
	grunt.registerTask('plugins', ['vagrant_commands:install_plugins']);
	grunt.registerTask('relink', ['gitPull:dependencies', 'vagrant_commands:symlinks']);

	grunt.util.linefeed = '\n';
};
