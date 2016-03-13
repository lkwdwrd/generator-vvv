# Generator VVV

Gnerator VVV is a [Yeoman](http://yeoman.io/) generator that creates shareable WordPress installations for [Varying Vagrant Vagrants](https://github.com/Varying-Vagrant-Vagrants/VVV) and potentailly other vagrant instances in the future.

At a high level, this generator creates a JSON file that describes your WordPress installation. Other developers can use that JSON file and this generator to create their own development environment that is exactly the same as yours.

## Getting Started

### Dependencies
You'll need this software to use generator-vvv

#### Varying Vagrant Vagrants
Generator VVV is a companion for [Varying Vagrant Vagrants](https://github.com/Varying-Vagrant-Vagrants/VVV). If you aren't using VVV, it has huge benefits for local WordPress development, and we highly recommend it. However, this generator is really only useful for VVV users at this time. Follow the (how to use)[https://github.com/Varying-Vagrant-Vagrants/VVV#how-to-use-varying-vagrant-vagrants] guide for VVV to get it installed if it isn't already.

#### Node
This is a [Yeoman](http://yeoman.io/) generator. Yeoman requires [Node](http://nodejs.org/) 4.3.1 or newer. It also requires Grunt and Yo.

Check that Node and NPM are installed:

````
$ node -v
v5.7.1
````

```
$ npm -v
3.6.0
```

If you do not get version number when running the -v commands, [download and install Node](https://nodejs.org/en/download/) for your computer. Once installed, try the commands again. Installing node will also install NPM.

## Installation

To install Generator VVV run:

```
$ npm install -g yo grunt generator-vvv
```

When the NPM install finishes successfully, you will now have access to the yo vvv family of commands. To learn more about the available commands and what they do see the [commands reference](docs/commands-reference.md).

_Note:_ if you're intending to contribute code back to the generator, you may want to clone the repo instead. [See the contributing docs for details.](CONTRIBUTING.md)

## Receiving a wpmanifest.json file
If you've been lucky enough to be working on a project that already has a vmanifest.json, you're in good shape — and just a few minutes away from a development environment! If the manifest is at a remote URL, simply run `yo vvv:bootstrap <url>` from anywhere on your machine. If you were give the file, run `yo vvv:bootstrap <path>` telling the generator where the file is located. If you do not specify a path it will look in the current working directory.

You will find your new install located at `<vvv_directory>/www/<project.name>`.

_Note:_ You will be prompted for your VVV directory on the first run. It will automatically detect the VVV directory for you if you run the command from the VVV folder or a subfolder.

## Starting a new sharable project

To create a sharable project can can run either of these commands:

````
$ yo vvv:create
````

Follow the prompts. It will generate a wpmanifest.json file that defines the project. Check out the [WPManifest JSON schema](docs/manifest-schema.md) to better understand what can be defined in the manifest file. The file will be located at `<vagrant_directory>/www/<project.name>`.

The generator then uses the JSON file to bootstrap several scripts ultimately resulting in a new WordPress site. The `wpmanifest.json` file can be shared and used by other developers with `yo vvv:bootstrap <url/path>`.

After the command has finished executing, you will have a brand new WordPress site ready to go at the local URL you specified during the creation process.

For more details, including how to set up an existing project, [there is a more in-depth version of this guide.](docs/creating-a-project.md)

_Tip:_ If you instead run `$ yo vvv:json` you can create the JSON file without also bootstrapping the site.

## Additional Info

### Default WP Admin Credentials

 - **username:** admin
 - **password:** password

### Default Database Credentials

 - **username:** wordpress
 - **password:** wordpress

### Documentation

 - [WPManifest JSON Schema](docs/manifest-schema.md): The WP Manifest schema defined.
 - [Working on WordPress](docs/working-on-wordpress.md): Editing themes & installing plugins.
 - [Commands Reference](docs/commands-reference.md): All of the `yo` and `grunt` commands available.
 - [Creating a sharable project](docs/creating-a-project.md): In-depth setting up an existing project to make it sharable.
 - [Folder Structure](docs/folder-structure.md): The file system result of running `yo vvv:bootstrap`.
 - [Chain of Events](docs/chain-of-events.md): What happens when running `yo vvv:bootstrap`.
 - [Development](docs/development.md): How to contribute.
 - [Rationale](docs/rationale.md): Why we built this.
