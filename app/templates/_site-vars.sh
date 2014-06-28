# Modify the variables below to match your project.

# This specifies the main site name in provisioning.
site_name='<%= site.name %>'

# The site details
domain='<%= site.url %>'
admin_user='wordpress'
admin_pass='wordpress'
admin_email='wordpress@<%= site.url %>'
<% if ( site.multisite ) { %>
multisite='yes'
subdomain='<% if ( site.subdomain ) { print("yes"); } else { print("no"); } %>'
<% } else { %>
multisite='no'
<% } %>

# Set live domain to trigger search-replace functionality
<% if ( site.liveUrl ) { %>
live_domain='<%= site.liveUrl %>'
<% } else { %>
# live_domain=
<% } %>

# This sets up the name of the DB and the user and password for the DB.
siteId='<%= site.id %>'
