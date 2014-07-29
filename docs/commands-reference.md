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
Available once yoman has completed to manage the installation's relationship with Vagrant

### Grunt (default)
@todo stub

### provision
@todo stub

### db
@todo stub

### plugins
@todo stub

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