#!/bin/bash
source config/site-vars.sh

# Update domains in the WP DB.
echo "Updating $site_name domains (this can take a while)."
cd htdocs/
if [[ "$multisite" == "yes" ]] && [[ ! -z $(wp --allow-root --url="$live_domain" option get siteurl) ]]
	then
	wp --allow-root --network --url="$live_domain" search-replace "$live_domain" "$domain" --skip-columns=guid
else
	wp --allow-root search-replace "$live_domain" "$domain" --skip-columns=guid
fi
