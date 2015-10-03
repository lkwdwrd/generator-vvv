module.exports = function (grunt){
    <% if ( 'trunk' === wordpress.version ) { %>    grunt.registerTask('trunk', ['vagrant_commands:svn_up']);<% }
    %>  grunt.registerTask('provision', ['vagrant_commands:restart']);
        grunt.registerTask('db', ['vagrant_commands:import_db']);<% if ( remoteDatabase ) { %>
        grunt.registerTask('remoteDB', ['http:remoteDatabases', 'vagrant_commands:import_db']);<% } %>
        grunt.registerTask('plugins', ['vagrant_commands:install_plugins']);
        grunt.registerTask('themes', ['vagrant_commands:install_themes']);
        grunt.registerTask('relink', [<% if ( dependencies ) { %>'gitPull:dependencies', <% } %><% if ( svn_dependencies ) { %>'svn_checkout:dependencies', <% } %>'vagrant_commands:symlinks']);
        grunt.registerTask('proxy_on', ['vagrant_commands:proxy_on']);
        grunt.registerTask('proxy_off', ['vagrant_commands:proxy_off']);
        grunt.registerTask('cleanup', ['vagrant_commands:cleanup']);
}