# generator-vvv

generator-vvv is a [Yeoman](http://yeoman.io/) generator that creates shareable WordPress installations
for [Varying Vagrant Vagrants](https://github.com/Varying-Vagrant-Vagrants/VVV).

At a high level, this generator creates a JSON file that describes your WordPress installation. Other developers can use that JSON file and this generator to create their own development environment that is exactly the same as yours.

## Dependencies
You'll need this software to use generator-vvv

### Varying Vagrant Vagrants
generator-vvv is a companion for [Varying Vagrant Vagrants](https://github.com/Varying-Vagrant-Vagrants/VVV). If you aren't using VVV, it has huge benefits for local WordPress development, and we highly recommend it. However, this generator is really only useful for VVV users.

### Node
This is a [Yeoman](http://yeoman.io/) generator. Yeoman requires [Node](http://nodejs.org/) 4.3.1 or newer. It also requires Grunt and Yo.

Check that Node is installed:
````
$ node -v
````

## Installation
`npm install -g yo grunt generator-vvv`

We'll then go get a whole bunch of dependencies and you'll get time for a coffee break and a shiny new command line tool when you get back.

_Note:_ if you're intending to contribute code back to the generator, you may want to clone the repo instead. [See the contributing docs for details.](CONTRIBUTING.md)

## Creating a sharable project (quickest start)

Starting directory:
`cd` into Vagrant's `www` directory.

````
$ mkdir yo-vvv-test
$ yo vvv:create
````

Follow the prompts. It will generate a vvv.json file. The generator uses the JSON file to bootstrap several scripts ultimately resulting in Vagrant re-provisioning and creating a new WordPress site. The vvv.json file can be shared, along with a databse export, and used by other developers with `yo vvv:bootstrap`.

For more details, including how to set up an existing project, [there is a more in-depth version of this guide.](docs/creating-a-project.md)

## Receiving a vvv.json file
If you've been lucky enough to be given a vvv.json file for a project, you're in good shape — and just a few minutes away from a development environment.

### Step 1: Create a Folder
1. Create an empty folder in Vagrant's `www` directory to house the project.
1. Put the vvv.json file you got inside that empty folder.
1. Put a copy of the database (.sql or .sql.gz) into the folder with the JSON file.

_Note:_ It's possible that you won't need a database. Check vvv.json file for a line that specifies a remote database URL. If specified, you can skip this step.


### Step 2: Run generator-vvv
Be sure you have internet access and run:
````
$ yo vvv:bootstrap
````
The generator uses the JSON file to bootstrap several scripts, clone theme and plugin repositories, and ultimately end up with a development environment.

You may now navigate to the development environment domain. It's "URL" in vvv.json. If you don't have Vagrant's autohostupdater plugin installed, you'll need to enter the domain in your hosts file.

## Notes
### Default Admin Credentials
Username and password are both **wordpress**

# Documentation
* [Working on WordPress](docs/working-on-wordpress.md): Editing themes & installing plugins.
* [Creating a sharable project](docs/creating-a-project.md): In-depth setting up an existing project to make it sharable.
* [Folder Structure](docs/folder-structure.md): The file system result of running `yo vvv:bootstrap`.
* [Chain of Events](docs/chain-of-events.md): What happens when running `yo vvv:bootstrap`.
* [Development](docs/development.md): How to contribute.
* [Commands Reference](docs/commands-reference.md): All of the `yo` and `grunt` commands available.
* [Rationale](docs/rationale.md): Why we built this.
