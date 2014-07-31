# How to work on a WordPress Site

In a nutshell:
* Every theme and plugin you want to work on should be in its own git repo
* Every wordpress.org plugin and theme are specified in vvv.json
* 3rd party themes and plugins are kept all together in a dependencies repository

## Editing a theme or plugin
Theme and plugin repositories are defined in vvv.json. There are some requirements:
* It must be a git repository.
* The computer running `yo vvv:bootstrap` must be able to access the repository.

Once vvv.json has been bootstrapped, you'll find those themes and plugins have been cloned into the `/src/` directory. They are also symlinked into `htdocs/wp-content`. You may interact with those repositories as you normally would.

### Adding a new 1st party theme or plugin — something you're working on.
1. Add the git repository url to vvv.json
1. Clone the plugin or theme into the appropriate directory in `/src/`
2. Run `grunt relink` to symlink the new files into `htdocs/wp_content`

## Installing WordPress.org theme or plugin
1. Add the plugin or theme slug to the appropriate entry in vvv.json
1. Add the plugin or theme slug to the appropriate file. Either `/config/org-plugins` or `/config/org-themes`
1. Run `grunt plugins` or `grunt themes` respectively.

## Installing 3rd party, including commercial, themes or plugins
Not every theme or plugin can be represented by a git url or a wordpress.org slug. Especially commercial themes and plugins. To manage all these dependencies, we can store all the 3rd party themes and plugins in a single git repository.

That single repository is then specified in vvv.json. Inside the depdencies repository is a directory for `/themes/`. '/plugins/`, and '/dropins/'. Themes and plugins are symlinked to their respective folders in `/htdocs/wp-content/`. Drop in files are symlinked to `/htdocs/wp-content/` and are best used for custom sunrise or caching files.

If vvv.json has already run, you can still add new dependencies. Add them to the dependencies repository first, then run `grunt relink`