'use strict';

function projectDir() {
  this.mkdir(this.site.url);
  process.chdir(this.site.url);
}

function config() {
  this.mkdir('config');

  this.mkdir('config/data');
  this.copy('readmes/data-readme.md', 'config/data/readme.md');
  this.copy('wp-constants', 'config/wp-constants');
  this.template('_org-plugins', 'config/org-plugins');
  this.template('_wp-ms-constants', 'config/wp-ms-constants');
  this.template('_vvv-nginx.conf', 'vvv-nginx.conf');
  this.template('_site-vars.sh', 'config/site-vars.sh');
  this.template('_vvv-hosts', 'config/vvv-hosts');
}

function src() {
  this.mkdir('src');
  this.mkdir('src/dropins');
  this.mkdir('src/plugins');
  this.mkdir('src/themes');

  this.template('readmes/_readme.md', 'readme.md');
  this.copy('readmes/dropins-readme.md', 'src/dropins/readme.md');
  this.copy('readmes/plugins-readme.md', 'src/plugins/readme.md');
  this.copy('readmes/themes-readme.md', 'src/themes/readme.md');
}

function setup() {
  this.copy('_package.json', 'package.json');
  this.copy('vvv-init.sh', 'vvv-init.sh');
  this.template('_Gruntfile.js', 'Gruntfile.js');
}

module.exports = {
  projectDir: projectDir,
  config: config,
  src: src,
  setup: setup
};
