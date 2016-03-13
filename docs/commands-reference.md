# Command Reference

## Yoman commands

### vvv
```
$ yo vvv
```

Lists available sub-generators. This command allows you to select and run an available subgenerator.

### vvv:json
```
$ yo vvv:json
```
This command creates a `wpmanifest.json` file that can then be shared with other developers. This JSON file defines the entire WordPress site, including domain names, sources, dependencies and more.

See "Creating a Shareable Project" above for workflow tips.

### vvv:bootstrap
```
$ yo vvv:bootstrap [source] [destination]
```

This command takes a `wpmanifest.json` file from `source`. `source` can be a URL or path where the `wpmanifest.json` file is availabe. If not specified it will look in the current directory. It will create the project defined by the manifest file in the `destination` directory. If no destination directory is defined, it will create the site in the `www/<wpmanifest.name>/` directory. See "Receiving a shared project" for workflow tips.

### vvv:create
```
$ yo vvv:create
```
This command combines `vvv:json` and `vvv:bootstrap` into one command to make it easy to create a completely new site from the ground up. This site will always be created in the `www/<wpmanifest.name>/` directory.

### vvv:dump
```
$ yo vvv:dump [items...]
```

This command reprocesses the `wpmanifest.json` file of the selected install and recreates different project files depending on what `items` were passed. You can dump the following items:

 - **manifest** - Dumps the manifest file (used internally).
 - **composer** - Dumps the composer JSON file in the root and the app if not disabled.
 - **env** - Dumps the .env file with the defined constants and environment variables.
 - **domains** - Dumps the hosts file and nginx config so new hosts are recongnized.
 - **wp-cli** - Dumps the wp-cli.yml file to control the core install commands.
 - **package** - Dumps the package.json file defining the neede NPM dependencies.
 - **nginx-config** - Dumps the site's nginx config and proxy config files.
 - **all** - Dumps everything available to be dumped with the dump command.

### vvv:dump-task
```
$ yo vvv:dump [items...]
```

This command reprocesses the `wpmanifest.json` file of the selected install and recreates different grunt tasks depending on what `items` were passed. The aliases file is always dumped regaurdless of which items are passed. You can dump the following items:

 - **symlink** - Dumps the symlink task with the correct content paths.
 - **vagrant_commands** -  Dumps the vagrant\_commands task with the correct internal names.
 - **src** - Dumps the git pull and svn checkout tasks to get the source repositories.
 - **clean** - Dumps the clean command with the correct content paths.
 - **confirm** - Dumps the confirm task.
 - **copy** - Dumps the copy task.
 - **all** - Dumps everything available to be dumped with the dump-task command.

### vvv:require
```
$ yo vvv:require
```
Runs through a looped set of questions to add dependency requirements to an existing project. These can be themes, plugins, and mu-plugins from WordPress.org, downloadable tarballs or zip archives, packagist, or a VCS repository (git, svn, etc.). It then records these dependencies in the `wpmanifest.json` file, dumps composer, and runs the build command to install them.

### vvv:source
```
$ yo vvv:source
```

Runs through a looped set of questions to add sources to an existing project. Once complete, these are recorded in the `wpmanifest.json` file. It then dumps the source tasks and runs grunt to clone down and symlink the new files in place.

### Global Options

There are a handful of global options that can be provided to the `yo vvv` commands to control what and how the installs will be worked on. Most of these are useful primarily with commands that work on existing installs.

```
  --vagrant-path="/file/path" # Define which vagrant install to work on.
  --name="install/name        # work on an install as specified by its 'name' property.
  --path="path/to/project"    # work on an install as specified by its directory location.
  --manual-conflict           # Manual resolve overwritten files that change when dumped.
```

## Grunt Commands
Available once Yeoman has finished bootstrapping an install. These are used to control the install's relationship with Vagrant and more. In general it allows easy access to commands within the guest machine as well as file control and maintenance for the host, such as symlinking.

### Grunt (default)
````
$ grunt
````
Runs the commands necessary to bootstrap the install. It will move any SQL files in the root into the config/data folder, clean out the current content folder of symlinks, clone/checkout any source repositories, run vagrant up to ensure the VM is running and add domains, run the bootstrap command which will typically run a composer install and import the database/install the site fresh, and then symlink sources into place within the content folder.

### Pull
````
$ grunt pull
````
Runs `git clone` or `git pull` on git sources and `svn checkout` or `svn up` on subversion sources.

### Import
````
$ grunt import
````
This command imports any .sql or .sql.gz file it finds in `/config/data/'.
If the `wpmanifest.json` specifies a remote URL for the site, it will also run an update db script that runs the wp-cli command `wp search-replace` from the remote URL to the local URL.

This can be a handy command if you want to switch between databases. For example you have a database that mirrors production and you also have a database with theme unit tests. You can have both sql files in `/config/data/` — to switch, remove the .imported extension and run this command.

### Backup
```
$ grunt backup
```

This command runs `wp db export` within the guest machine to dump the current state of the database into the `config/data` folder. If a database of the same name exists it will *not* be overwritten, but rather start adding a number post-fix to the name.

### Relink
````
$ grunt relink
````
Cleans symlinks out of the content repository, trigges the `grunt pull` task to update sources, runs a composer install inside the guest machine, and then runs `grunt symlink` to restablish all content symlinks.

### Cleanup
````
$ grunt cleanup
````
This removes _everything_ that generator-vvv created _except_ wpmanifest.json and any local databases. It creates a DB snapshot before removing all of the files.

If you'd like to re-create the install from scratch, you can immediately run `yo vvv:bootstrap`. It's worth noting the first found sql file will be used for the import, so it's best to make sure backup created on cleanup is the first or only .sql or .sql.gz file in the directory.