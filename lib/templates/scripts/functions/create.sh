#!/bin/bash

# Bootstrap the site and run all needed creation tasks.
create(){
  bootstrap
  nginx_conf $GVDIR
  rm_vhosts
  vhosts
  nginx_restart
}
