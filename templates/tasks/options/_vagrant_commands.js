module.exports = {
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
<% } %>         import_db: {
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