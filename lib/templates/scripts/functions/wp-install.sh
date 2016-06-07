#!/bin/bash

# Install this site via WP-ClI
wp_install(){
  #Install as needed
  if [[ $WPCONST_MULTISITE ]] && ! $(wp --allow-root core is-installed --network > /dev/null 2>&1)
    then
    wp --allow-root core multisite-install
  elif ! $(wp --allow-root core is-installed > /dev/null 2>&1)
    then
    wp --allow-root core install
  fi
}
