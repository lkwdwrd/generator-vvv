#!/bin/bash
source ../config/site-vars.sh
cd ../

# Deal with our database dumps.
first_sql=$(ls config/data | grep -i -E '\.sql(?:.gz)?$' | head -1)
if [[ ! -z "$first_sql" ]] && [[ -f config/data/$first_sql ]]
	then
	echo "Importing $first_sql for $site_name."
	if [[ $first_sql =~ \.gz$ ]]
		then
		#Deal with gzipped sql files
		gunzip < config/data/$first_sql | mysql -u root --password=root $siteId
	else
		#Deal with normal sql files
		mysql -u root --password=root $siteId < config/data/$first_sql
	fi
	mv ../config/data/$first_sql config/data/$first_sql.imported
	if [[ -d htdocs ]] && [[ ! -z $live_domain ]]
		then
		echo "Updating $site_name domains (this can take a while)."
		cd htdocs
		if [[ "$multisite" == "yes" ]]
			then
			wp --allow-root --url="$domain" search-replace "$live_domain" "$domain" --skip-columns=guid
		else
			wp --allow-root search-replace "$live_domain" "$domain" --skip-columns=guid
		fi
		cd ../
	elif [[ ! -d htdocs ]]
		then
		exit 1
	fi
else
	echo "No SQL file found, skipping import."
fi
