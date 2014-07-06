'use strict';

var fs = require('fs');
var path = require('path');

function projectDir() {
  this.mkdir(this.site.url);
  process.chdir(this.site.url);
}

function vvv() {
  this.template('_vvv.json', 'vvv.json');
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

function deps() {
  this.copy('readmes/dependencies-readme.md', 'deps/readme.md');
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

function node() {
  this.copy('_package.json', 'package.json');
  this.template('_Gruntfile.js', 'Gruntfile.js');
}

function scripts() {
  this.copy('scripts/clear-links.sh');
  this.copy('scripts/dependencies.sh');
  this.copy('scripts/import-sql.sh');
  this.copy('scripts/plugins.sh');
  this.copy('scripts/src.sh');
  this.copy('scripts/update-db.sh');
  this.copy('vvv-init.sh');
}

function findSQL() {
  var i, length,
      cwd = process.cwd(),
      reg = /\.sql(?:\.gz)?$/,
      done = this.async();

  if (this.options.db) {
    this.db = {
      'type': 'file',
      'location': this.options.db
    };
  } else if ('object' !== this.db || ('file' === this.db.type && ! this.db.location)) {
    fs.readdir(cwd, function (err, files) {
      if (err) {
        this.log.warn('Directory Error: ' + err);
        return;
      }
      for (i = 0, length = files.length; i < length; i++) {
        if (-1 !== files[i].search(reg)) {
          this.db = {
            'type': 'file',
            'location': path.join(cwd, files[i])
          };
          break;
        }
      }
      done();
    }.bind(this));
  }
}

function sql() {
  if ('object' !== typeof this.db) {
    return;
  }

  if ('file' === this.db.type && this.db.location) {
    var fname = path.basename(this.db.location);
    fs.rename(this.db.location, 'config/data/' + fname);
  }
}

module.exports = {
  projectDir: projectDir,
  vvv: vvv,
  config: config,
  deps: deps,
  src: src,
  node: node,
  scripts: scripts,
  findSQL: findSQL,
  sql: sql
};
