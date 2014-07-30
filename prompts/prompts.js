'use strict';

function getSiteInfo() {
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
    }
  ];
  // gather initial settings
  this.prompt(prompts, function (props) {
    this.site = {
      name:      props.siteName,
      url:       props.siteUrl,
      liveUrl:   props.liveUrl,
    };
    done();
  }.bind(this));
}

function getWPInfo() {
  var done = this.async();

  var prompts = [
    {
      name:    'version',
      message: 'What version of WordPress would you like to install?',
      default: 'latest'
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
    },
		{
			name: 'prefix',
			message: 'database prefix',
			default: 'wp_'
		}
  ];
  // gather initial settings
  this.prompt(prompts, function (props) {
    this.wordpress = {
      version: props.version,
      multisite: props.multisite,
      subdomain: props.subdomain,
      subdomains: [],
			prefix: props.prefix
    };
    done();
  }.bind(this));
}

function promptSubdomains(done) {
  done = done || this.async();
  // See if we need to add subdomains to this install.
  if (this.wordpress.multisite && this.wordpress.subdomain) {
    var prompts = [{
      name:    'subdomain',
      message: 'Add a subdomain (blank to continue)'
    }];
    this.prompt(prompts, function (props) {
      if (!! props.subdomain) {
        this.wordpress.subdomains.push(props.subdomain);
        this.promptSubdomains(done);
      } else {
        done();
      }
    }.bind(this));
  } else {
    done();
  }
}

function promptPlugins(done) {
  done = done || this.async();
  this.plugins = this.plugins || [];
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
}

function haveRepos(done) {
  // Do we need to import any theme or plugin repos?
  done = done || this.async();
  this.repos = this.repos || { theme: [], plugin: [] };

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
}

function dependencyRepo() {
  // Do we have a dependency repository?
  var done = this.async();

  this.prompt([{
      name:    'dependencies',
      message: 'Where is the dependency repository?'
    }], function (props) {
      this.dependencies = props.dependencies;
      done();
    }.bind(this)
  );
}

module.exports = {
  getSiteInfo: getSiteInfo,
  getWPInfo: getWPInfo,
  promptSubdomains: promptSubdomains,
  promptPlugins: promptPlugins,
  haveRepos: haveRepos,
  dependencyRepo: dependencyRepo
};
