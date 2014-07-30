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

## Rationale

Working in a WordPress agency has some amazing benefits: the close and constant communication, learning, code review and so forth. It also allows projects to get the benefit of many different, more specialized developers. Perhaps we have someone "hop in" on a project to write some complex JS. Or someone who is an expert with caching can come in and make some tweaks.

This is great until you realize that it can take _hours_ for a developer to collect all the resources necessary to create a development environment: Theme repositories, plugins, databases, and configuration details.

Instead of having to communicate these details and let the developer churn through them, we thought it would be awesome to represent each project using a single json file. A lightweight json file can be easily passed around. Development environment ramp-up is reduced to two steps:

1. Put vvv.json into a folder
2. `cd` into that folder and run `yo vvv:bootstrap`

After step two, the site is running on VVV, including host file mapping, databases, all of it. Hours of developer on-boarding is reduced to minutes. Developers will be able to hop in and out of projects faster than ever. Collaboration becomes effortless.

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

## Commands (generators)

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

#### Chain of Events

`vvv:bootstrap` does a lot of magic. It's worth having an idea of what's happening. When you run the command, here's roughly what happens.

1. Yo reads the vvv.json file
1. Yo generates files needed for VVV automatic site setup. This includes the config and src directories, nginx config templates, host file templates. It also creats a package.json file specifically for generator-vvv with some specific grunt modules.
1. Yo runs `npm install`, which reads package.json and downloads the required node modules
1. Yo runs `grunt`
	1. Grunt clones all your remote repositories. For example, your in-development theme
	1. Grunt re-provisions VVV which kicks off VVV auto site setup.
		1. Using wp-cli, VVV triggers a WordPress installation.
		1. Using wp-cli, VVV imports the database
		1. Using wp-cli, VVV installs plugins and themes from the WordPress.org repositories
		1. VVV copies the nginx configuration file
		1. VVV updates its own host file. If the Vagrant [hostsupdater](https://github.com/cogitatio/vagrant-hostsupdater) plugin has been installed, it will also update the local system's host file.
		1. VVV restarts the servers

### vvv:create
```
$ yo vvv:create
```
This command combines `vvv:json` and `vvv:bootstrap` into one command to make it easy to create a completely new site.

@todo: document grunt commands
@todo: document folder structure for auto site setup
@todo: document dependencies repository structure and purpose
