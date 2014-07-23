# generator-vvv

## Dependencies

**1. [Node](http://nodejs.org)**

*Download:* http://nodejs.org/download/

**2. [Grunt](http://gruntjs.com/)**

*Install:*

```
$ npm install -g grunt-cli
```

*Documentation:* http://gruntjs.com/getting-started

**3. [Yeoman](http://yeoman.io/)**

*Install:*

```
$ npm install -g yo
```

*Documentation:* http://yeoman.io/learning/index.html

**4. [Varying Vagrant Vagrants](https://github.com/Varying-Vagrant-Vagrants/VVV)**

*Install:*

```
$ cd ~/
$ mkdir vagrant-local
$ cd vagrant-local
$ git clone git://github.com/Varying-Vagrant-Vagrants/VVV.git .
```

*Documentation:* https://github.com/Varying-Vagrant-Vagrants/VVV#getting-started


## Getting Started

**1. Install generator-vvv from Node Package Manager**

```
$ npm install -g generator-vvv
```

**2. Navigate to your project directory within vagrant-local/www**

```
$ cd ~/vagrant-local/www/projectname
```

**3. Initiate the generator from within your project directory:**

```
$ yo vvv
```

**4. Answer the setup questions:**


* What will your site be called?  [site name]
* What would you like your domain to be? [site domain]
* What is the live domain? [existing live site domain]
* What version of WordPress would you like to install?  [full version # for example ‘3.9.1’ or ‘latest’]
* Will this be a network install?  [y/N]
* Add a plugin [Add plugin repositories to the project]
* Do you want to add an external repo?  [Add a theme, plugin etc.]
* Where is the dependency repository? [Shared repository with common themes, plugins for multiple projects]

Once you answer these question generator-vvv goes to work:

Creates the site configuration files
Runs npm install pulling all of the grunt dependencies
Runs grunt pulling in all repositories
Runs vagrant provision to provision the site.


## Sub-generators

###JSON

To generate just a `vvv.json` file you can use the json sub-generator just like you would the main generator.

```
$ yo vvv:json
```

This will generate just the JSON site configuration file that defines this project.

### Bootstrap

Given a `vvv.json` file, you can run the bootstrap sub-generator to create your project. This will read the `vvv.json` file and set up your your project accordingly.

```
$ yo vvv:bootstrap
```

## License

MIT
