# Init script for VVV Auto Site Setup
source config/site-vars.sh
echo "Commencing $site_name Site Setup"

# Save a site referece where we can get to it.
 if [[ ! -d /var/sites ]]
 	then
 	mkdir /var/sites
 fi
 ln -s $PWD /var/sites/$siteId

# Make a database, if we don't already have one
echo "Checking $site_name database."
mysql -u root --password=root -e "CREATE DATABASE IF NOT EXISTS $siteId"
mysql -u root --password=root -e "GRANT ALL PRIVILEGES ON $siteId.* TO wordpress@localhost IDENTIFIED BY 'wordpress';"

sh scripts/import-sql.sh
# Install WordPress if it's not already present.
if [[ ! -d htdocs ]]
	then
	echo "Installing WordPress using WP-CLI"
	mkdir htdocs
	# Set up the constants
	if [[ "$multisite" == "yes" ]] && [[ "$sql_imported" == "yes" ]]
		then
		constants=$(cat config/wp-constants)$(cat config/wp-ms-constants)
	else
		constants=$(cat config/wp-constants)
	fi
	# Move into htdocs to run 'wp' commands.
	cd htdocs
	wp --allow-root core download --version="$wordpressVersion"
	echo "$constants" | wp --allow-root core config --dbname="$siteId" --dbuser="wordpress" --dbpass="wordpress" --extra-php
	#Install as needed
	if ! $(wp --allow-root core is-installed)
		then
		wp --allow-root core install --url="http://$domain" --title="$site_name" --admin_user="$admin_user" --admin_password="$admin_pass" --admin_email="$admin_email"
	fi
	#Multisite stuff
	if [[ "$multisite" == "yes" ]] && [[ "$sql_imported" != "yes" ]]
		then
		# Configure the network
		if [[ "$subdomain" == "yes" ]]
			then
			wp --allow-root core multisite-convert --title="$site_name" --subdomains
		else
			wp --allow-root core multisite-convert --title="$site_name"
		fi
	fi
	cd ..
	# Update Database as Needed - already checked for $live_domain
	if [[ "$sql_imported" == "yes" ]]
		then
		sh scripts/update-db.sh
	fi
	# If this is multisite and we've imported SQL, update the DB.
	if [[ "$multisite" == "yes" ]] && [[ "$sql_imported" == "yes" ]]
		then
		cd htdocs
		# Attempt to update the network sites if we importend it.
		echo "Updating Network"
		for url in $(wp --allow-root site list --fields=url --format=csv | tail -n +2)
		do
		  wp --url="$url" --allow-root core update-db
		done
		cd ..
	fi
fi

sh scripts/plugins.sh
sh scripts/clear-links.sh
sh scripts/dependencies.sh
sh scripts/src.sh

# The Vagrant site setup script will restart Nginx for us
echo "$site_name is now set up!";
