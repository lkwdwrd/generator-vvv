#!/bin/bash
nginx_restart(){
  service nginx restart
}

nginx_conf(){
  # Look for Nginx vhost files, copy them into the custom sites dir
  for SITE_CONFIG_FILE in $(find $1 -maxdepth 5 -name 'vvv-nginx.conf' | head -1); do
    DEST_CONFIG_FILE=${SITE_CONFIG_FILE//\/srv\/www\//}
    DEST_CONFIG_FILE=${DEST_CONFIG_FILE//\//\-}
    DEST_CONFIG_FILE=${DEST_CONFIG_FILE/%-vvv-nginx.conf/}
    DEST_CONFIG_FILE="vvv-auto-$DEST_CONFIG_FILE-$(md5sum <<< "$SITE_CONFIG_FILE" | cut -c1-32).conf"
    find /etc/nginx/custom-sites -name "$DEST_CONFIG_FILE" -exec rm {} \;
    # We allow the replacement of the {vvv_path_to_folder} token with
    # whatever you want, allowing flexible placement of the site folder
    # while still having an Nginx config which works.
    DIR="$(dirname "$SITE_CONFIG_FILE")"
    echo "Copying the nginx config for $SITE_TITLE."
    sed "s#{vvv_path_to_folder}#$DIR#" "$SITE_CONFIG_FILE" > "/etc/nginx/custom-sites/""$DEST_CONFIG_FILE"
  done
}

rm_nginx_conf(){
  # Look for Nginx vhost files, remove them from the custom sites dir
  for SITE_CONFIG_FILE in $(find $1 -maxdepth 5 -name 'vvv-nginx.conf' | head -1); do
    DEST_CONFIG_FILE=${SITE_CONFIG_FILE//\/srv\/www\//}
    DEST_CONFIG_FILE=${DEST_CONFIG_FILE//\//\-}
    DEST_CONFIG_FILE=${DEST_CONFIG_FILE/%-vvv-nginx.conf/}
    DEST_CONFIG_FILE="vvv-auto-$DEST_CONFIG_FILE-$(md5sum <<< "$SITE_CONFIG_FILE" | cut -c1-32).conf"
    echo "Removing nginx config for $SITE_TITLE."
    find /etc/nginx/custom-sites -name "$DEST_CONFIG_FILE" -exec rm {} \;
  done
}
