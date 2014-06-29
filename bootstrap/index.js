'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var path = require('path');
var output = require('../output/output.js');


var BootstrapVVV = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);
    var dirPath = '../templates';
    this.sourceRoot(path.join(__dirname, dirPath));
  },
  init: function () {
    this.pkg = require('../package.json');
    try {
      this.vvvJSON = JSON.parse(this.read(process.cwd() + '/vvv.json'));
    } catch (e) {
      this.log.error(e);
      return process.exit(0);
    }

    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.installDependencies(function () {
          if (!this.options['skip-grunt']) {
            this.log(chalk.green.bold('Running default grunt task'));
            this.spawnCommand('grunt', ['default']);
          } else {
            this.log(chalk.yellow('skipping grunt. Run grunt manually when you are ready.'));
          }
        }.bind(this));
      } else {
        this.log(chalk.yellow('skipping install, run npm install and grunt to finish up.'));
      }
    });
  },
  welcome: function () {
    // replace it with a short and sweet description of your generator
    this.log(chalk.magenta('Thanks for bootstapping with yo vvv!'));
  },
  bootstrap: function () {
    var src = this.vvvJSON;
    if (!(src.site && src.wordpress && src.repos && src.plugins)) {
      this.log.error('missing data in vvv.json file.');
      return process.exit(0);
    }
    this.site = src.site;
    this.wordpress = src.wordpress;
    this.repos = src.repos;
    this.plugins = src.plugins;
  },
  // output
  config: output.config,
  src: output.src,
  setup: output.setup
});

module.exports = BootstrapVVV;
