# Folder Structure

This generator creates a fair amount of project configuration files. However, it's worth noting that an effort is made to ensure this wraps around the install in the `app/` directory providing a layer of tooling around it while allowing the internals of the install to behave as needed for the particular needs of the project.

## /config

Config contains the configuration needed to set up and control the site and server. The `data` directory is where .sql or .sql.gz files shoudl be placed for import. Once imported they will be renamed with a .imported extension. `vvv-hosts` and `proxy.conf` are found in the config folder as well.

The `scripts` folder contains all of the shell commands for controlling the site and server, genrally broken up into function and run by creating an internal environment for the site and then invoking a specific function.

## /src
This is the destination of anything defined as a source in the `wpmanifest.json` file. These items will be place in the correct subfolder and grunt will symlink them to the proper place within the WordPress content folder.

## Gruntfile.js, package.json, /tasks
The entire project has a number of Grunt commands available to help manage its relationship with Vagrant. This is set up to be controlled modularly using the `load-grunt-config` package from NPM. All available grunt tasks and configuration are contained in the `/tasks` folder.

See: [Commands Reference](commands-reference.md) for more information on available Grunt commands.

## composer.json
This is the development `composer.json` file and is used when running composer commands inside the VM. This version of the `composer.json` file doesn't include definitions for source repositories because they are being controlled by the `grunt pull` command.

## vvv-nginx.conf
This is the nginx configuration that is symlinked into Vagrant. You may safely ignore this. It must be located in the root for the replace token to work thta tells nginx where the actual site root is.

## wp-cli.yml
This allows `$ wp ...` commands to be runn from the site root by specifying the install path for WP-CLI. In addition, this is where site install configuration is defined.

## wpmanifest.json
This the main file for the generator. It contains all the configuration details necessary to successfully set up a new site. This file is all that is needed to get started on a project.