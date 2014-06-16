# Init script for VVV Auto Site Setup
source config/site-vars.sh
echo "Commencing $site_name Site Setup"

# Make a database, if we don't already have one
echo "Creating $site_name database (if it's not already there)"
mysql -u root --password=root -e "CREATE DATABASE IF NOT EXISTS $database"
mysql -u root --password=root -e "GRANT ALL PRIVILEGES ON $database.* TO $dbuser@localhost IDENTIFIED BY '$dbpass';"

# Deal with our database dumps.
first_sql=$(ls src/data | grep -i -E '\.sql$' | head -1)
if [[ ! -z "$first_sql" ]] && [[ -f src/data/$first_sql ]]
	then
	echo "First SQL is present and there is a file..right?"
	echo "$first_sql"
else
	echo "First SQL is not present, shouldn't be set at all"
fi
if [[ ! -z "$first_sql" ]] && [[ -f src/data/$first_sql ]]
	then
	echo "Importing first found database for $site_name (this can take a while)"
	mysql -u root --password=root $database < src/data/$first_sql
	mv src/data/$first_sql src/data/$first_sql.imported
	if [[ -d htdocs ]]
		then
		cd htdocs
		# Use the simpler single site setup for all find replace operations.
		mv wp-config.php wp-config.php.old
		echo "$(cat config/wp-constants)" | wp --allow-root core config --dbname="$database" --dbuser="$dbuser" --dbpass="$dbpass" --extra-php
		wp --allow-root search-replace "$old_domain" "$new_domain" --skip-columns=guid
		rm wp-config.php
		mv wp-config.php.old wp-config.php
		cd ../
	else
		sql_imported="yes"
	fi
fi
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
	wp --allow-root core download
	echo "$constants" | wp --allow-root core config --dbname="$database" --dbuser="$dbuser" --dbpass="$dbpass" --extra-php
	#Install as needed
	if ! $(wp --allow-root core is-installed)
		then
		wp --allow-root core install --url="$domain" --title="$site_name" --admin_user="$admin_user" --admin_password="$admin_pass" --admin_email="$admin_email"
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
	# Update Database as Needed
	if [[ "$sql_imported" == "yes" ]]
		then
		# Make sure we're using a single site config file to ensure search-replace works.
		mv wp-config.php wp-config.php.old
		echo "$(cat config/wp-constants)" | wp --allow-root core config --dbname="$database" --dbuser="$dbuser" --dbpass="$dbpass" --extra-php
		wp --allow-root search-replace "$old_domain" "$new_domain" --skip-columns=guid
		rm wp-config.php
		mv wp-config.php.old wp-config.php
	fi
	# If this is multisite and we've imported SQL, update the DB.
	if [[ "$multisite" == "yes" ]] && [[ "$sql_imported" == "yes" ]]
		then
		# Attempt to update the network sites if we importend it.
		echo "Updating Network"
		for url in $(wp --allow-root site list --fields=url --format=csv | tail -n +2)
		do
		  wp --url="$url" --allow-root core update-db
		done
	fi
	# Move back to root to finish up shell commands.
	cd ..
fi

#Install all WordPress.org plugins in the org_plugins file using CLI
echo "Checking for missing WordPress.org Plugins"
if [[ config/org-plugins ]]
then
	# Move back into htdocs to install .org plugins.
	cd htdocs
	while IFS='' read -r line || [ -n "$line" ]
	do
		if [ "#" != "${line:0:1}" ]
		then
			# Only install the plugin if it's not already installed.
			if ! $(wp --allow-root plugin is-installed $line )
				then
				wp plugin install $line --allow-root
			fi
		fi
	done < ../config/org-plugins
	# Move back to the root directory.
	cd ..
fi

# Symlink working directories
# First clear out any links already present
find htdocs/wp-content/ -maxdepth 2 -type l -exec rm -f {} \;
# Next attach symlinks for eacy of our types.
# Plugins
echo "Linking working directory pluins"
find src/plugins/ \( ! -regex '.*/\..*' \) -maxdepth 1 -mindepth 1 -exec ln -s $PWD/{} $PWD/htdocs/wp-content/plugins/ \;
# Themes
echo "Linking working directory themes"
find src/themes/ \( ! -regex '.*/\..*' \) -maxdepth 1 -mindepth 1 -exec ln -s $PWD/{} $PWD/htdocs/wp-content/themes/ \;
# Dropins
echo "Linking any available drop-ins"
find src/dropins/ \( ! -regex '.*/\..*' \) -maxdepth 1 -mindepth 1 -exec ln -s $PWD/{} $PWD/htdocs/wp-content/ \;

# The Vagrant site setup script will restart Nginx for us
echo "$site_name is now set up!";