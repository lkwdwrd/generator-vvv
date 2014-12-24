'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var path = require('path');
var prompts = require('../prompts/prompts.js');
var output = require('../output/output.js');


var VVVCreate = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);
    var dirPath = '../templates';
    this.sourceRoot(path.join(__dirname, dirPath));
  },
  init: function () {
    this.pkg = require('../package.json');

    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.installDependencies({
          bower: false,
          callback: function () {
            if (!this.options['skip-grunt']) {
              this.log(chalk.green.bold('Running default grunt task'));
              this.spawnCommand('grunt', ['default']);
            } else {
              this.log(chalk.yellow('skipping grunt. Run grunt manually when you are ready.'));
            }
          }.bind(this)
        });
      }
    });
  },
  welcome: function () {
    // replace it with a short and sweet description of your generator
    this.log(chalk.magenta('Thanks for generating auto site setups with yo vvv!'));
  },
  //prompts
  getSiteInfo: prompts.getSiteInfo,
  getWPInfo: prompts.getWPInfo,
  promptSubdomains: prompts.promptSubdomains,
  promptPlugins: prompts.promptPlugins,
  haveRepos: prompts.haveRepos,
  dependencyRepo: prompts.dependencyRepo,
  // output
  generateSiteId: output.generateSiteId,
  ensureValues: output.ensureValues,
  vvv: output.vvv,
  config: output.config,
  src: output.src,
  node: output.node,
  tasks: output.tasks,
  scripts: output.scripts,
  findSQL: output.findSQL,
  sql: output.sql
});

module.exports = VVVCreate;