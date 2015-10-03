module.exports = {<% if ( dependencies ) { %>
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
%>          themes: {
                repos: [
<%                  var i, length;
                    for (i = 0, length = repos.theme.length; i < length; i++) {
                        if ( 'object' === typeof repos.theme[i] ) {
%>                  {
                        path: ['src', 'themes'],
                        dir: '<%= repos.theme[i].dir %>',
                        repo: '<%= repos.theme[i].repo %>'
                    }<% if((i + 1) !== length) { %>,<% } %>
<%                      } else {
%>                  {
                        path: ['src', 'themes'],
                        repo: '<%= repos.theme[i] %>'
                    }<% if((i + 1) !== length) { %>,<% } %>
<% } }
%>              ]
            },
            plugins: {
                repos: [
<%                  for (i = 0, length = repos.plugin.length; i < length; i++) {
                        if ( 'object' === typeof repos.plugin[i] ) {
%>                  {
                        path: ['src', 'plugins'],
                        dir: '<%= repos.plugin[i].dir %>',
                        repo: '<%= repos.plugin[i].repo %>'
                    }<% if((i + 1) !== length) { %>,<% } %>
<% } else {
%>                  {
                        path: ['src', 'plugins'],
                        repo: '<%= repos.plugin[i] %>'
                    }<% if((i + 1) !== length) { %>,<% } %>
<% } }
%>              ]
            }<% } %>
        }      