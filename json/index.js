'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var path = require('path');
var prompts = require('../prompts/prompts.js');
var output = require('../output/output.js');


var JSONGenerator = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);
    var dirPath = '../templates';
    this.sourceRoot(path.join(__dirname, dirPath));
  },
  init: function () {
    this.pkg = require('../package.json');
  },
  welcome: function () {
    // replace it with a short and sweet description of your generator
    this.log(chalk.magenta('Thanks for generating auto site setups with yo vvv!'));
  },
  //prompts
  getSiteInfo: prompts.getSiteInfo,
  generateSiteId: prompts.generateSiteId,
  getWPInfo: prompts.getWPInfo,
  promptSubdomains: prompts.promptSubdomains,
  promptPlugins: prompts.promptPlugins,
  haveRepos: prompts.haveRepos,
  dependencyRepo: prompts.dependencyRepo,
  // output
  vvv: output.vvv
});

module.exports = JSONGenerator;