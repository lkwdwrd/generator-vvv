#!/bin/bash

# Remove this install from Vagrant.
cleanup(){
  db_bak
  rm_db
  rm_executable
  rm_nginx_conf $GVDIR
  rm_vhosts
  nginx_restart
}
