#!/bin/bash
source config/site-vars.sh

# Deal with our database dumps.
first_sql=$(ls config/data | grep -i -E '\.sql(.gz)?$' | head -1)
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
	mv config/data/$first_sql config/data/$first_sql.imported
	if [[ -d htdocs ]] && [[ ! -z $live_domain ]]
		then
		bash scripts/update-db.sh
	elif [[ ! -d htdocs ]]
		then
		sql_imported='yes'
	fi
else
	echo "No SQL file found, skipping import."
fi
