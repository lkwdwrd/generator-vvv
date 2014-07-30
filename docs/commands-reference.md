# Command Reference

## Yoman commands

### vvv
```
$ yo vvv
```

Lists available generators

### vvv:json
```
$ yo vvv:json
```
This command creates a `vvv.json` file that can then be shared with other developers. This JSON file defines the entire WordPress site, including domain names, plugins, and themes.

See "Creating a Shareable Project" above for workflow tips.

### vvv:bootstrap
```
$ yo vvv:bootstrap
```

This command takes a `vvv.json` file and (depending) a database .sql file and creates the entire project. See "Receiving a shared project" for workflow tips.

### vvv:create
```
$ yo vvv:create
```
This command combines `vvv:json` and `vvv:bootstrap` into one command to make it easy to create a completely new site.

## Grunt Commands
Available once yoman has completed to manage the installation's relationship with Vagrant. Provides access to handy shell files and vagrant commands from a grunt command line that is running on the host machine.

### Grunt (default)
````
$ grunt
````
Runs `git pull` on your theme, plugin, and dependencies repositories. It then runs `vagrant up`, which will have no effect if vagrant is already running, and then `vagrant provision` (see below)

### provision
````
$ grunt provision
````
Runs `vagrant provision`

### db
````
$ grunt db
````
This command imports any .sql or .sql.gz file it finds in `/config/data/'.
If vvv.json specifies an original/production URL, it will also run an update db script that runs the wp-cli command `wp search-replace`.

This can be a handy command if you want to switch between databases. For example you have a database that mirrors production and you also have a database with theme unit tests. You can have both sql files in `/config/data/` — to switch, remove the .imported extension and run this command.

### plugins
````
$ grunt plugins
````
Runs a script that updates the current installation with any plugins specified in the `/config/org-plugins` file. This file is created by vvv.json.

To add a wordpress.org plugin to an already active installation:
* add the plugin slug to the vvv.json file (so that others you share this project get the benefit).
* add the plugin slug to `/config/org-plugins`
* run this command

### themes
@todo stub

### relink
@todo stub

### proxy_on
@todo stub

### proxy_off
@todo stub

### cleanup
@todo stub