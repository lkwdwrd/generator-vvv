# Creating a Project
@todo stub



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

## Remote Databases
To help distribution, a remote .sql database file can be specified by editing vvv.json. This remote .sql file can be at a public URL or behind HTTP basic auth.

Here is an example using http basic auth.
````
"remoteDatabase" : {
	"url": "http://username:password@remote-databases.mysite.com/remote-databases/myproject.sql"
}
````