module.exports = {<% if ( svn_dependencies ) { %>
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
<%                  var i, length;
                    for (i = 0, length = svn_repos.theme.length; i < length; i++) {
                        if ( 'object' === typeof svn_repos.theme[i] ) {
%>                  {
                        path: ['src', 'themes'],
                        dir: '<%= svn_repos.theme[i].dir %>',
                        repo: '<%= svn_repos.theme[i].repo %>'
                    }<% if((i + 1) !== length) { %>,<% } %>
<%                      } else {
%>                  {
                        path: ['src', 'themes'],
                        repo: '<%= svn_repos.theme[i] %>'
                    }<% if((i + 1) !== length) { %>,<% } %>
<% } }
%>              ]
            },
            plugins: {
                repos: [
<%                  for (i = 0, length = svn_repos.plugin.length; i < length; i++) {
                        if ( 'object' === typeof svn_repos.plugin[i] ) {
%>                  {
                        path: ['src', 'plugins'],
                        dir: '<%= svn_repos.plugin[i].dir %>',
                        repo: '<%= svn_repos.plugin[i].repo %>'
                    }<% if((i + 1) !== length) { %>,<% } %>
<% } else {
%>                  {
                        path: ['src', 'plugins'],
                        repo: '<%= svn_repos.plugin[i] %>'
                    }<% if((i + 1) !== length) { %>,<% } %>
<% } }
%>              ]
            }<% } %>
        }