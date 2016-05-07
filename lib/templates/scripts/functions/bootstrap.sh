#!/bin/bash

# Bootstrap this site.
bootstrap(){
  echo "Bootstrapping $SITE_TITLE"
  link_executable
  db_create
  build
  db_import
  wp_install
}
