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
		},<% } if ( repos || dependencies ) { %>
		gitPull: {<% if ( dependencies ) { %>
			dependencies: {
				repos: [
					{
						path: [],
						dir: 'deps',
						repo: '<%= dependencies %>'
					}
				]
			}<% if ( repos && dependencies ) { %>,
<% } }
			if ( repos ) {
%>			themes: {
				repos: [
<%					var i, length;
					for (i = 0, length = repos.theme.length; i < length; i++) {
						if ( 'object' === typeof repos.theme[i] ) {
%>					{
						path: ['src', 'themes'],
						dir: '<%= repos.theme[i].dir %>',
						repo: '<%= repos.theme[i].repo %>'
					}<% if((i + 1) !== length) { %>,<% } %>
<%						} else {
%>					{
						path: ['src', 'themes'],
						repo: '<%= repos.theme[i] %>'
					}<% if((i + 1) !== length) { %>,<% } %>
<% } }
%>				]
			},
			plugins: {
				repos: [
<%					for (i = 0, length = repos.plugin.length; i < length; i++) {
						if ( 'object' === typeof repos.plugin[i] ) {
%>					{
						path: ['src', 'plugins'],
						dir: '<%= repos.plugin[i].dir %>',
						repo: '<%= repos.plugin[i].repo %>'
					}<% if((i + 1) !== length) { %>,<% } %>
<% } else {
%>					{
						path: ['src', 'plugins'],
						repo: '<%= repos.plugin[i] %>'
					}<% if((i + 1) !== length) { %>,<% } %>
<% } }
%>				]
			}<% } %>
		},<% } if ( svn_repos || svn_dependencies ) { %>
		svn_checkout: {<% if ( svn_dependencies ) { %>
			dependencies: {
				repos: [
					{
						path: [],
						dir: 'deps',
						repo: '<%= svn_dependencies %>'
					}
				]
			}<% } if ( svn_repos && svn_dependencies ) { %>,
<% }
			if ( svn_repos ) { %>
			themes: {
				repos: [
<%					var i, length;
					for (i = 0, length = svn_repos.theme.length; i < length; i++) {
						if ( 'object' === typeof svn_repos.theme[i] ) {
%>					{
						path: ['src', 'themes'],
						dir: '<%= svn_repos.theme[i].dir %>',
						repo: '<%= svn_repos.theme[i].repo %>'
					}<% if((i + 1) !== length) { %>,<% } %>
<%						} else {
%>					{
						path: ['src', 'themes'],
						repo: '<%= svn_repos.theme[i] %>'
					}<% if((i + 1) !== length) { %>,<% } %>
<% } }
%>				]
			},
			plugins: {
				repos: [
<%					for (i = 0, length = svn_repos.plugin.length; i < length; i++) {
						if ( 'object' === typeof svn_repos.plugin[i] ) {
%>					{
						path: ['src', 'plugins'],
						dir: '<%= svn_repos.plugin[i].dir %>',
						repo: '<%= svn_repos.plugin[i].repo %>'
					}<% if((i + 1) !== length) { %>,<% } %>
<% } else {
%>					{
						path: ['src', 'plugins'],
						repo: '<%= svn_repos.plugin[i] %>'
					}<% if((i + 1) !== length) { %>,<% } %>
<% } }
%>				]
			}<% } %>
		},<% } %>
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
	grunt.registerTask('default', [<% if ( remoteDatabase ) { %>'http', <% } %><% if ( repos || dependencies ) { %>'gitPull', <% } %><% if ( svn_repos || svn_dependencies ) { %>'svn_checkout', <% } %>'vagrant_commands:restart']);
<% if ( 'trunk' === wordpress.version ) { %>	grunt.registerTask('trunk', ['vagrant_commands:svn_up']);<% }
%>	grunt.registerTask('provision', ['vagrant_commands:restart']);
	grunt.registerTask('db', ['vagrant_commands:import_db']);<% if ( remoteDatabase ) { %>
	grunt.registerTask('remoteDB', ['http:remoteDatabases', 'vagrant_commands:import_db']);<% } %>
	grunt.registerTask('plugins', ['vagrant_commands:install_plugins']);
	grunt.registerTask('themes', ['vagrant_commands:install_themes']);
	grunt.registerTask('relink', [<% if ( dependencies ) { %>'gitPull:dependencies', <% } %><% if ( svn_dependencies ) { %>'svn_checkout:dependencies', <% } %>'vagrant_commands:symlinks']);
	grunt.registerTask('proxy_on', ['vagrant_commands:proxy_on']);
	grunt.registerTask('proxy_off', ['vagrant_commands:proxy_off']);
	grunt.registerTask('cleanup', ['vagrant_commands:cleanup']);

	grunt.util.linefeed = '\n';
};
