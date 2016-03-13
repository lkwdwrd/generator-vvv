# How to work on a WordPress Site

## The Default Setup

The default WP setup is done in such a way as to bring it somewhat inline with the [12-factor app](http://12factor.net/) method of working on projects. It uses composer to install WordPress and manage/version lock dependencies. It uses [phpdotenv](https://github.com/vlucas/phpdotenv) to configure WordPress and keep sensitive credentials out of the app itself and version control.

WordPress itself is managed as a dependency. The content folder lives along side the WordPress folder to keep the separations of concerns very clear when working with the system. 

A `composer.json` file is included in the file root. If working only on directly version controlled plugins and themes, this app root can be version controlled itself. Deployment then looks like checking out the root repository to a server and running composer install. As long as the deployment environement is set up with the correct environment variables, it's ready to go. The entire application becomes very [disposable](http://12factor.net/disposability).

## Editing a Source

Sources are git or Subversion repositories that are actively being worked on as part of this project. Once bootstrapped, you'll find the sources have been cloned/checked out into the `/src/` directory. They are then symlinked into content directory so they are available to the install. You may interact with those repositories in the `src/` directory as you normally would. This keeps the dependency files and the code being worked on very serparated. While working on a project, you should never find yourself modifying a file in the `app/` directory. If you do, take a step back and determine why it is necessary and try to find a way to do it in a source directory instead.

Too add new sources to the project, simply follow the prompts after running:

```
$ yo vvv:source
```

## Adding Dependencies

To a dependency to your project follow the prompts after runnin:

```
$ yo vvv:require
```

Dependencies in general should be a WordPress plugin, theme, or mu-plugin. These should be located in a WordPress.org repository, on Packagist, as a remotely stored zip archive or tar ball, or in a git or subversion repository.

Commercial plugins and themes can typically be turned into a tarball and added to a protected URL so they are available for checkout when the project is shared or deployed.