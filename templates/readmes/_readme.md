### VVV Auto Setup for <%= site.name %>

This will work with a copy of [Varying Vagrant Vagrants](https://github.com/Varying-Vagrant-Vagrants/VVV) to auto set up <%= site.name %> for you. Just clone this into your `www` directory and then run:

```sh
npm install
grunt
```

This will take care of:

 - Setting up your domain at http://<%= site.url %>
 - Installing WordPress if you don't already have an `htdocs` folder
 - Setting up your database for the site if needed
 - Importing any new database found in `config/data` and migrating domains if needed
 - Configuring your WordPress install as needed to work with the database
 - Linking any dropins, themes, or plugins into the correct location

This setup script can be triggered at any time by running vagrant provision on your friendly neighborhood VVV install, or by re-running `grunt provision` from the project root.
