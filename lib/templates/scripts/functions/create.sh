#!/bin/bash
create(){
  bootstrap
  nginx_conf $GVDIR
  rm_vhosts
  vhosts
  nginx_restart
}