#!/bin/bash
wp_install(){
  #Install as needed
  if ! $(wp --allow-root core is-installed)
    then
    wp --allow-root core install
    #Multisite stuff
    if [[ $WPCONST_MULTISITE ]]
      then
      # Configure the network
      if [[ $WPCONST_SUBDOMAIN_INSTALL ]]
        then
        wp --allow-root core multisite-convert --subdomains
      else
        wp --allow-root core multisite-convert
      fi
    fi
  fi
}