# Chain of Events
`yo vvv:bootstrap` does a lot of magic. It's worth having an idea of what's happening. When you run the command, here's roughly what happens.

1. Yo looks for the wpmanifest.json file in the specified directory, or downloads it from the provided URL.
1. Yo reads the wpmanifest.json file and prepares the neede data to create the defined install.
1. Yo generates files needed for automatic site setup in the specified directory or in `www/<wpmanifest.name>` if no directory was specified. This includes the config and src directories, nginx config templates, host file templates. It also creats a package.json file to help control the install with some specific grunt modules.
1. Yo runs `npm install`, which reads package.json and downloads the required node modules.
1. Yo runs `grunt`.
	1. Grunt moves any available databases in the install root into the config/data folder.
	1. Grunt clones all your remote repositories. For example, your in-development theme
	1. Grunt runs `vagrant up` which will add the site's domains using the [hostsupdater](https://github.com/cogitatio/vagrant-hostsupdater) or [ghost](https://github.com/10up/vagrant-ghost) plugin.
	1. Grunt runs a vagrant command which triggers internal site setup.
		1. Runs the site's build command, usually triggering a `composer install` which pulls down WordPress and any other dependencies.
		1. Using wp-cli it creates imports the database if one is present. It then runs a `wp search-replace` on domains as needed.
		1. If WordPress is not recognized as installed, wp-cli will install it (typically if no database is proivded).
		1. The script copies the nginx configuration file into place.
		1. The script updates the internal server hosts file.
		1. The script restarts the servers so that the new configurations are available.
	1. Grunt symlinks all of the source files into the proper place in the site content folder.