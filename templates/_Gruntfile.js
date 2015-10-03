function loadConfig(path) {
  var glob = require('glob');
  var object = {};
  var key;
 
  glob.sync('*', {cwd: path}).forEach(function(option) {
    key = option.replace(/\.js$/,'');
    object[key] = require(path + option);
  });
 
  return object;
}

module.exports = function (grunt) {
	'use strict';
	// Project configuration

	var config = {
	  pkg: grunt.file.readJSON('package.json'),
	  env: process.env
	};
	 
	grunt.util._.extend(config, loadConfig('./tasks/options/'));
	 
	grunt.initConfig(config);
		
	// Load tasks
	require('load-grunt-tasks')(grunt);

	// Register tasks
	grunt.registerTask('default', [<% if ( remoteDatabase ) { %>'http', <% } %><% if ( repos || dependencies ) { %>'gitPull', <% } %><% if ( svn_repos || svn_dependencies ) { %>'svn_checkout', <% } %>'vagrant_commands:restart']);

	grunt.loadTasks('tasks');
	
	grunt.util.linefeed = '\n';
};
