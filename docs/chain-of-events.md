# Chain of Events

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