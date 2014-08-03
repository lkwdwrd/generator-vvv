module.exports = function (grunt) {
	'use strict';
	// Project configuration
	grunt.initConfig({
		pkg:    grunt.file.readJSON('package.json'),<% if ( remoteDatabase ) { %>
		http: {
			remoteDatabases: {
				options: {
					url: '<%= remoteDatabase.url %>'
				},
				dest: 'config/data/<%= remoteDatabase.url.match(/([^\/]*)$/)[0] %>'
			}
		},<% } %>
		gitPull: {
			dependencies: {
				repos: [
					{
						path: [],
						dir: 'deps',
						repo: '<%= dependencies %>'
					}
				]
			}<% if ( repos ) { %>,
<% }
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
					['provision']
				]
			},<% if ( 'trunk' === wordpress.version ) { %>
			svn_up: {
				commands: [
					['ssh', '--command=cd /var/sites/<%= site.id %>/htdocs && svn up']
				]
			},
<% } %>			import_db: {
				commands: [
					['ssh', '--command=cd /var/sites/<%= site.id %> && bash scripts/import-sql.sh']
				]
			},
			install_plugins: {
				commands: [
					['ssh', '--command=cd /var/sites/<%= site.id %> && bash scripts/plugins.sh']
				]
			},
			install_themes: {
				commands: [
					['ssh', '--command=cd /var/sites/<%= site.id %> && bash scripts/themes.sh']
				]
			},
			symlinks: {
				commands: [
					['ssh', '--command=cd /var/sites/<%= site.id %> && bash scripts/clear-links.sh'],
					['ssh', '--command=cd /var/sites/<%= site.id %> && bash scripts/dependencies.sh'],
					['ssh', '--command=cd /var/sites/<%= site.id %> && bash scripts/src.sh']
				]
			},
			proxy_on: {
				commands: [
					['ssh', '--command=cd /var/sites/<%= site.id %> && bash scripts/proxy_on.sh']
				]
			},
			proxy_off: {
				commands: [
					['ssh', '--command=cd /var/sites/<%= site.id %> && bash scripts/proxy_off.sh']
				]
			},
			cleanup: {
				commands: [
					['ssh', '--command=cd /var/sites/<%= site.id %> && bash scripts/cleanup.sh']
				]
			}
		}
	});

	// Load tasks
	require('load-grunt-tasks')(grunt);

	// Register tasks
	grunt.registerTask('default', [<% if ( remoteDatabase ) { %>'http', <% } %>'gitPull', 'vagrant_commands:restart']);<% if ( 'trunk' === wordpress.version ) { %>
	grunt.registerTask('trunk', ['vagrant_commands:svn_up']);<% } %>
	grunt.registerTask('provision', ['vagrant_commands:restart']);
	grunt.registerTask('db', ['vagrant_commands:import_db']);<% if ( remoteDatabase ) { %>
	grunt.registerTask('remoteDB', ['http:remoteDatabases', 'vagrant_commands:import_db']);<% } %>
	grunt.registerTask('plugins', ['vagrant_commands:install_plugins']);
	grunt.registerTask('themes', ['vagrant_commands:install_themes']);
	grunt.registerTask('relink', ['gitPull:dependencies', 'vagrant_commands:symlinks']);
	grunt.registerTask('proxy_on', ['vagrant_commands:proxy_on']);
	grunt.registerTask('proxy_off', ['vagrant_commands:proxy_off']);
	grunt.registerTask('cleanup', ['vagrant_commands:cleanup']);

	grunt.util.linefeed = '\n';
};
