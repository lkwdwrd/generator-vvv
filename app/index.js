'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');


var VVVGenerator = yeoman.generators.Base.extend({
  init: function () {
    this.pkg = require('../package.json');

    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.installDependencies();
      }
    });
  },

  welcome: function () {
    // replace it with a short and sweet description of your generator
    this.log(chalk.magenta('Thanks for generating auto site setups with yo vvv!'));
    this.repos = { theme: [], plugin: [] };
    this.subdomains = [];
    this.plugins = [];
  },

  getSiteInfo: function () {
    var done = this.async();

    var prompts = [
      {
        name:    'siteName',
        message: 'What will your site be called?',
        default: 'The WordPress Genius'
      },
      {
        name:    'siteUrl',
        message: 'What would you like your domain to be?',
        default: 'genius.dev'
      },
      {
        name:    'liveUrl',
        message: 'What is the live domian? (genius.com - blank if none)'
      },
      {
        type:    'confirm',
        name:    'multisite',
        message: 'Will this be a network install?',
        default: false
      },
      {
        when: function (props) { return props.multisite; },
        type:    'confirm',
        name:    'subdomain',
        message: 'Is this a subdomain install?',
        default: false
      }
    ];
    // gather initial settings
    this.prompt(prompts, function (props) {
      this.site = {
        name:      props.siteName,
        url:       props.siteUrl,
        liveUrl:   props.liveUrl,
        multisite: props.multisite,
        subdomain: props.subdomain,
        id:        props.siteUrl.replace(/[^A-Za-z0-9]/g, '').substr(0, 64)
      };
      done();
    }.bind(this));
  },

  promptSubdomains: function (done) {
    done = done || this.async();
    // See if we need to add subdomains to this install.
    if (this.site.multisite && this.site.subdomain) {
      var prompts = [{
        name:    'subdomain',
        message: 'Add a subdomain (blank to continue)'
      }];
      this.prompt(prompts, function (props) {
        if (!! props.subdomain) {
          this.subdomains.push(props.subdomain);
          this.promptSubdomains(done);
        } else {
          done();
        }
      }.bind(this));
    } else {
      done();
    }
  },

  promptPlugins: function (done) {
    done = done || this.async();
    // See if we need to add subdomains to this install.
    var prompts = [{
      name:    'plugin',
      message: 'Add a plugin (blank to continue)'
    }];
    this.prompt(prompts, function (props) {
      if (!! props.plugin) {
        this.plugins.push(props.plugin);
        this.promptPlugins(done);
      } else {
        done();
      }
    }.bind(this));
  },

  haveRepos: function (done) {
    // Do we need to import any theme or plugin repos?
    done = done || this.async();

    var prompts = [{
      type:    'list',
      name:    'repoType',
      message: 'Do you want to add an external repo?',
      choices: [ 'no', 'plugin', 'theme' ]
    }, {
      when: function (props) { return ('no' !== props.repoType); },
      name: 'repo',
      message: 'What\'s the URL to the repo?'
    }];

    this.prompt(prompts, function (props) {
      if ('no' !== props.repoType) {
        this.repos[props.repoType].push(props.repo);
        this.haveRepos(done);
      } else {
        done();
      }
    }.bind(this));
  },

  projectDir: function () {
    this.mkdir(this.site.url);
    process.chdir(this.site.url);
  },

  config: function () {
    this.mkdir('config');

    this.mkdir('config/data');
    this.copy('readmes/data-readme.md', 'config/data/readme.md');
    this.copy('wp-constants', 'config/wp-constants');
    this.template('_org-plugins', 'config/org-plugins');
    this.template('_wp-ms-constants', 'config/wp-ms-constants');
    this.template('_vvv-nginx.conf', 'vvv-nginx.conf');
    this.template('_site-vars.sh', 'config/site-vars.sh');
    this.template('_vvv-hosts', 'config/vvv-hosts');
  },

  src: function () {
    this.mkdir('src');
    this.mkdir('src/dropins');
    this.mkdir('src/plugins');
    this.mkdir('src/themes');

    this.template('readmes/_readme.md', 'readme.md');
    this.copy('readmes/dropins-readme.md', 'src/dropins/readme.md');
    this.copy('readmes/plugins-readme.md', 'src/plugins/readme.md');
    this.copy('readmes/themes-readme.md', 'src/themes/readme.md');
  },

  setup: function () {
    this.copy('_package.json', 'package.json');
    this.copy('vvv-init.sh', 'vvv-init.sh');
    this.template('_Gruntfile.js', 'Gruntfile.js');
  }
});

module.exports = VVVGenerator;