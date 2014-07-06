#!/bin/bash
source ../config/site-vars.sh
cd ../htdocs/

# Update domains in the WP DB.
if [[ "$multisite" == "yes" ]] && [[ "$sql_imported" == "yes" ]]
	then
	# Attempt to update the network sites if we importend it.
	echo "Updating Network"
	for url in $(wp --allow-root site list --fields=url --format=csv | tail -n +2)
	do
	  wp --url="$url" --allow-root core update-db
	done
fi
