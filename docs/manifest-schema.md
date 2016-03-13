#VManifest Schema

## Name

**Required.** *(string)* The 'name' of the project. This mirrors the [name](https://getcomposer.org/doc/04-schema.md#name) property of the Composer JSON schema, and is used as the name for the `composer.json` files that get dumped during processing. The name also determines the default forlder the site will live in. For Composer, it typically follows the `namespace/project-name` convention. This would result in the default folder being at `www/namespace/project-name/`. The name field supports upper/lower case letters, numbers, dashes, underscores, and forward slashes.

## Title

**Required.** *(string)* The 'Title' field of the project determines the site title and is used generally to refer to the project throughtout generator processing.

## Description

*(string)* The description of the projects is a handful of lines that describe what the project is in plain text. This is the same as the [Composer JSON description](https://getcomposer.org/doc/04-schema.md#description) and is output as the description for the `composer.json` files when dumped.

## Homepage

*(string)* The site where you can learn more about the project. This could be anything from a repository with a good README file to a documentation site, to a basecamp project URL. This is the same as [Composer JSON homepage](https://getcomposer.org/doc/04-schema.md#homepage) and is output as the homepage for the `composer.json` files when dumped.

## Site

**Required.** *(object)* Defines the necessary items to set up the website itself. This includes things like constants and other site variables as necessary depending on the type of site being defined.

### Prefix

*(string)* The site prefix to use for the database. If it is not defined, it will default to 'wp_'.

### Base

*(string)* The base defines what will go in the `$base` global variable for multisite environments. If this is not defined it will default to '/'.

### Admin-User

*(string)* The admin user name to use when installing the site from scratch. This gets placed into the `wp-cli.yml` file that controls the `$ wp core install` command when it's run. If a database is supplied, this key is not used. Default: admin

### Admin-Pass

*(string)* The admin user name to use when installing the site from scratch. This gets placed into the `wp-cli.yml` file that controls the `$ wp core install` command when it's run. If a database is supplied, this key is not used. Default: password

### Admin-Email

*(string)* The admin user name to use when installing the site from scratch. This gets placed into the `wp-cli.yml` file that controls the `$ wp core install` command when it's run. If a database is supplied, this key is not used. Default: admin@<server.local>.

### External-Env

*(boolean)* This controls whether the environment file (.env) is output in the app root (`app/`), or if it is put in the project root (`./`). If version controlling a root repository that should not contain an environment file, set this to false. Default is true.

### Constants

**Required.** *(object)* The constants object contains key-value pairs that will be defined as WordPress constants when the site is loaded. Most of the default WordPress constant values can be omitted and will be set to default values. The notable exception is the DB_NAME constant. This should always be defined in the JSON file. This constant is used in many places as a breadcrumb to refer to this install. Any constant can be defined in the constants object as needed.

 - **DB_NAME** *(required)* The name of the database. This constant can only contain upper and lower case letters, numbers, and underscores.
 - **DB_USER** The name of the user that will access the database for this install. Defaults to 'wordpress'.
 - **DB_PASSWORD** The password for the user taht will access the database for this install. Defaults to 'wordpress'.
 - **Keys and Salts** All of the WP required keys and salts (AUTH_KEY, NONCE_SALT, etc.). These will automatically be generated when creating the site and do not need to be defined, however they can be if a specific value is required.

### Env

*(object)* Any extra environment variables that should be defined for the application. These get output to the .evn file and loaded by default using [phpdotenv](https://github.com/vlucas/phpdotenv).

## Server

**Required.** *(object)* The server object defines the necessary items for setting up the server to run the defined site.

### Local

**Required.** *(string)* The local URL for the site (without the http:// portion).

### Remote

*(string)* The remote URL of the site (without the http:// portion). This is useful to define where an included database is coming from and is used in the search/replace operation after the database is imported.

### Subdomains
*(array)* An array of subdomains the site will use. This is useful for multisite instances that use a subdomain install. These subdomains will automatically be added to the nginx config as well as the hosts files of the host and guest machines.

### Proxies

*(object)* Allows the set up of multiple static file proxies as needed. The keys will be used to name the location blocks in the config file, and the values control how the blocks are configured. Each proxy can be defined as a boolean `true` value, a string URL value, or as an options object. If defined as a boolean `true` value, the defined remote URL will be used as the proxy URL over https with no rewriting of paths for the default static types. If a string URL is given, the proxy will be defined for that URL with no rewriting of paths and the default types. The options for the value objects follows giving fine grained control over how the proxy works.

#### Types

*(array)* Overrides the default list of static file types this proxy will be in effect for. The default list of file types follows:

 - js 
 - css 
 - png 
 - jpg 
 - jpeg 
 - gif
 - ico
 - mp3 
 - mov 
 - tif 
 - tiff 
 - swf 
 - txt 
 - html

#### Types-Include

*(array)* Adds to the list of types affected by this proxy.

#### Types-Exclude

*(array)* Removes types from the list affected by this proxy.

#### Match

*(string)* Allows a custom location block match to be specified for this proxy. If the match key is defined, none of the types keys will be used.

#### Proxies

*(array)* An array of proxy URLs to try for this proxy. Each can be defined as a string, or as an object. A string will be the proxy URL (with no trailing slash). The object allows defining of both a rewrite of the matched URL path as well as the proxy URL.

##### Rewrite

*(string)* This will rewrite the URL path for the proxy. For example, if the images are located on a CDN and do not have the wp-content/ path, then you can pass the following string to strip wp-content/ before sending it to the proxy URL: `'/wp-content(.*) $1'`. It is worth noting that proxies will be tried in the order they are defined. If a URL is rewritten in a preceeding proxy, the proxy is passed the *rewritten* path, not the original path.

##### URL

*(string)* This is the URL that will be sent the request for the matched asset after the URL path has been rewritten. This should be given *with* the protocol (http://, https://, etc) and should not have a trailing slash on the end.

## App-Paths

*(object)* The App-Paths key allows custom paths to be defined for different parts of the application. This is useful if a root repository is defined that has different paths than the default. All paths are relative to the app path (`app/`).

### Composer-Path

*(string)* This is the path to the application's Composer JSON file. While the default Composer file for controlling the local isntall will remain in the root, the app's Composer JSON file will by default be in the app root. To change this, specify the correct path using this key. The app's Composer JSON file will contain repo definitions and require the source repositories if applicable.

### Vendor-Dir

*(string)* This is the path to the applications Composer vendor directory. By default this will be a folder called 'vendor' at the root of the application. This can be overridden and renamed as necessary using this key.

### WP-Path

*(string)* This is the path to the folder containing the WordPress files. By default this will be at `wp/` relative to the application root. If a root repository is defined with a different WordPress root (for example, `live/wp/` ), this key can be used to define that location.

### Content-Path

*(string)* This is the path to the wp-content folder. By default `wp-content/` is located in the app root along side the `wp/` folder. In addition to specifying a different location for the wp-content folder, this key can be used to give a custom name to the content folder (`content/` for example).

### Root

*(string)* This is the path to the entry point for the application. By default, this is the `app/` folder. However if a custom root repository is used and nginx should point to a subfolder as the site root, this key will do just that.

## Src

**Required.** *Array* This allows the definition of different git or subversion repositories that are being actively worked on in this install. Each source definition is an object with the following properties.

### URL

**Required** *(string)* The URL to the repository. This can be https, git@, or any other URL to the repo.

### Type
**Required.** *(string)* This defines the URL type. Supported values are 'git' and 'svn'.

### Map

**Required.** *(string)* This defines where within the WP architecture this repository is version controlling. Supported values are:

 - *root* - The root of the site. This may version control the entire install for git deploy on something like WP Engine or Pantheon, or it may define the bare bones of the install with a `composer.json` file that will pull in the needed dependencies. Unlike the other types, there can be only one root reposotiroy. Only the first definition will be used, any further root definitions will be ignored. The root repository is checked out to the `app/` folder.
 - *content* - This folder mirros the wp-content folder. Inside it can contain drop-in files (note that drop ins can also be defined in a `dropins/` folder if desired), `plugins/`, `themes/`, and `mu-plugins/` as needed.
 - *plugin* - A WordPress plugin.
 - *mu-plugin* - A WordPress mu-plugin.
 - *theme* - A WordPress theme.
 - *plugins-folder* - A repo full of WordPress plugins in subdirectories (think version controlling `wp-content/plugins`).
 - *themes-folder* - A repo full of WordPress themes in subdirectories (think version controlling `wp-content/themes`).
 - *mu-plugins-folder* - A repo full of WordPress MU plugins in subdirectories (think version controlling `wp-content/mu-plugins`).

### Name

*(string)* The Composer name for a theme/plugin/mu-plugin. This key should be omitted for other map types. When the app Composer file is dumped, it will include these repository definitions and require this name.
 
### Stable

*(string)* This defines the stable version of this package for deployment. This is used in the app Composer file for theme/plugin/mu-plugin map types. This key should be omitted for other map types.

## Composer

*(object)* All values needed to output the Composer JSON file. Composer is used to control dependencies, including WordPress .org plugins and themes through the [WordPress Packagist](https://wpackagist.org/). By default, this will contain `type: 'root'`, `minimum-stability: 'dev'`, `prefer-stable: true`, `respositories:` adding the WordPress Packagist repo, as well as `require:` with all of the needed dependencies. Any additional [Composer JSON schema values](https://getcomposer.org/doc/04-schema.md) can be added as needed. It's also worth noting that `name:`, `description:`, and `homepage:` are defined in the main manifest file and will make their way to the output `composer.json` files, so including them in the Composer object is unnecessary.

By default, Composer will install a copy of WordPress using [John Bloch's WordPress installer](https://github.com/johnpbloch/wordpress-core-installer). The extras config will be added automatically based on the defined app-paths. Similarly, the [Composer Installers](https://github.com/composer/installers) project will be included and extras defined to map the plugins and themes to the proper place in the content folder defined by app-paths. Finally, the config for defining the vendor dir will also automatically be output as needed based on the composer-path and vendor-dir definitions in app-paths.

## Composer-In-App

*(boolean)* If a root repository is defined, and it doesn't use Composer, or you do not wish to manage it's Composer JSON file with the generator, you can set composer-in-app to false and the generator will only dump the root level `composer.json` file.