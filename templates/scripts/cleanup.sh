#!/bin/bash
source config/site-vars.sh

#Confirm Process
while [[ -z $REPLY ]] || ! [[ $REPLY =~ ^[YyNn]$ ]]
	do
	read -p "Are you sure you want to remove $site_name? [Y/n]" -r
	if ! [[ $REPLY =~ ^[YyNn]$ ]]
		then
		echo "Please enter only Y or n."
	fi
	echo ""
done

#Run cleanup as requested
if [[ $REPLY =~ ^[Yy]$ ]]
	then

	echo "Removing the nginx configuration"
	dirname="$(basename $(pwd -P))"
	find /etc/nginx/custom-sites -name "vvv-auto-${dirname}*.conf" -exec sudo rm {} \;

	echo "Cleaning VM's hosts file."
	if [[ -f config/vvv-hosts ]]
		then
		domains=""
		while IFS='' read -r line || [ -n "$line" ]; do
			if [[ "#" != ${line:0:1} ]];
				then
				domains="$domains\|$line"
			fi
		done < config/vvv-hosts
		domains="${domains:2}"
		sed "/\(${domains}\)/d" /etc/hosts > /tmp/hosts
		sudo mv /tmp/hosts /etc/hosts
		sudo chown root:root /etc/hosts
	fi
	
	echo "Removing the database"
	mysql -u root --password=root -e "DROP DATABASE $siteId"
	
	echo "Removing stored site references"
	sudo rm /var/sites/$siteId

	if [[ -f vvv.json ]]
		then
		echo "Saving your configuration file."
		mv vvv.json \#vvv.json
	fi
	
	echo "Saving any imported data files."
	cd config/data
	find . -maxdepth 1 -mindepth 1 -name '*.imported' -exec basename {} \; | while read NAME ; do mv "${NAME}" "../../#${NAME%.imported}" ; done
	cd ../../

	echo "Removing site files."
	find ./ -maxdepth 1 -mindepth 1 ! -name "#*" -exec sudo rm -r {} \;
	
	echo "Restoring saved files."
	find . -maxdepth 1 -mindepth 1 -name '#*' -exec basename {} \; | while read NAME ; do mv "$NAME" "${NAME:1}" ; done

	echo "$site_name has been removed from your VVV install."
fi
