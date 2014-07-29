# generator-vvv

generator-vvv is a [Yeoman](http://yeoman.io/) generator that creates shareable WordPress installations
for [Varying Vagrant Vagrants](https://github.com/Varying-Vagrant-Vagrants/VVV)

## Super Quick Start (kick the tires)

Install (if needed):
* [Varying Vagrant Vagrants](https://github.com/Varying-Vagrant-Vagrants/VVV)
* [Node](http://nodejs.org/)

Starting directory:
`cd` into Vagrant's `www` directory.

````
$ mkdir yo-vvv-test
$ yo vvv:create
````

Follow the prompts. When complete, you'll have a complete WordPress installation. The vvv.json file can be shared with other developers for use with `yo:bootstrap`


## Getting Started

### Varying Vagrant Vagrants
generator-vvv is a companion for [Varying Vagrant Vagrants](https://github.com/Varying-Vagrant-Vagrants/VVV). If you aren't using VVV, it has huge benefits for local WordPress development, and we highly recommend it. However, this generator is really only useful for VVV users.

Additionally, because this is creating shareable WordPress installations, it is designed to run inside vagrant's 'www' folder. If generator-vvv does not have access to a vagrant installation (to run `vagrant` shell commands) it gets indigestion.

### Node
This is a [Yeoman](http://yeoman.io/) generator. Yeoman requires [Node](http://nodejs.org/) 0.8.19 or newer. It also
requires Grunt and Yo, but we'll take care of those if you don't already have them.

### Installing
`npm install -g generator-vvv`

We'll then go get a whole bunch of dependencies and you'll get time for a coffee break and a shiny
new command line tool when you get back.

## Creating a sharable project

If this is a completely new project, consider using `yo vvv:create` and following the prompts. It will generate the vvv.json file and automatically run `yo vvv:bootstrap`. Once complete, you'll have a running WordPress website that's ready for sharing.

If this is an existing project, you'll want to collect some details before running generator-vvv:
* Export a copy of the .sql file (it can be saved in gzipped form, .gz). This can be uploaded to a remote FTP server or just passed around between developers.
* Push the themes and plugins you are developing to their own, individual repositories. These don't have to be private repositories, but everyone you'll share the project with will need access. Note the clone url.
* Bundle any plugins that are not being developed and are not in the wordpress.org repository into a 'dependencies' repository. Note the clone url. (Details below)
* Make a list of all the wordpress.org plugins and themes that need to be installed.
* Note the production URL.
* If this is a subdomain multisite, note each of the subdomains.

Collecting this beforehand will make it easier when you run `vvv:json`.

Once run, take a second look at the resulting JSON file. This file is also what you'd share with other developers (along with the SQL dump).

Finally, bootstrap the JSON file by running `vvv:json`

## Receiving a shared project
If you've been lucky enough to be given a vvv.json file for a project, you're in good shape — and just a few minutes away from a development environment.

Two things you'll need to know, and can answer yourself:
* Do you need a copy of the database?
* What is the development domain name?

If you take a peek at the vvv.json file it has the answers to both those questions. Under "site" it lists the "url" — this is the development url and generally ends in ".dev"

Also in the vvv.json file will be a line that can specify the URL for a remote database. If this line exists, you won't need a database file. If it doesn't exist, you'll need to get in touch with someone to get a copy of the (generally production) database .sql file. This can be .sql or .sql.gz.

### Step 1: Create a folder
Create an empty folder in Vagrant's `www` directory. You can name it whatever you like, but we suggest
using the development domain name (without the tld).

Put the vvv.json file you got inside that empty folder.

If you have a local database .sql file, put that in the folder with vvv.json.

### Step 2: Run generator-vvv

`yo vvv:bootstrap`

This command will use the vvv.json file to download and clone a bunch of things (be sure you have internet).


# Documentation
* [Creating a sharable project](docs/creating-a-project.md)
* [Folder Structure](docs/folder-structure.md)
* [Rationale](docs/rationale.md)
* [Chain of Events](docs/chain-of-events.md)
* [Developers](docs/developers.md)
* [Commands Reference](docs/commands-reference.md)