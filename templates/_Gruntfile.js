module.exports = function (grunt) {
	'use strict';
	// Project configuration
	grunt.initConfig({
		pkg:    grunt.file.readJSON('package.json'),
		gitPull: {
			<% if (dependencies) {
%>			dependencies: {
				repose: [
					path: ['deps'],
					repo: '<%= dependencies %>'
				]
			}<% if ( repos ) %>,<% } }
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
					['halt'],
					['up', '--provision']
				]
			},
		}
	});

	// Load tasks
	require('load-grunt-tasks')(grunt);

	// Register tasks
	grunt.registerTask('default', ['gitPull', 'vagrant_commands:restart']);
	grunt.registerTask('provision', ['vagrant_commands:restart']);

	grunt.util.linefeed = '\n';
};
