'use strict';

var fs = require('fs');
var path = require('path');

function generateSiteId() {
  this.site.id = this.site.url.replace(/[^A-Za-z0-9]/g, '').substr(0, 64);
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
  this.template('_org-themes', 'config/org-themes');
  this.template('_wp-ms-constants', 'config/wp-ms-constants');
  this.template('_vvv-nginx.conf', 'vvv-nginx.conf');
  this.template('_site-vars.sh', 'config/site-vars.sh');
  this.template('_vvv-hosts', 'config/vvv-hosts');
  this.template('_proxy.conf', 'config/proxy.conf');
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

  this.copy('plugins/object-cache.php', 'src/dropins/object-cache.php');
  this.copy('plugins/advanced-cache.php', 'src/dropins/advanced-cache.php');
}

function node() {
  this.template('_package.json', 'package.json');
  this.template('_Gruntfile.js', 'Gruntfile.js');
}

function scripts() {
  this.copy('scripts/cleanup.sh');
  this.copy('scripts/clear-links.sh');
  this.copy('scripts/dependencies.sh');
  this.copy('scripts/import-sql.sh');
  this.copy('scripts/plugins.sh');
  this.copy('scripts/themes.sh');
  this.copy('scripts/proxy_on.sh');
  this.copy('scripts/proxy_off.sh');
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
  generateSiteId: generateSiteId,
  vvv: vvv,
  config: config,
  src: src,
  node: node,
  scripts: scripts,
  findSQL: findSQL,
  sql: sql
};
