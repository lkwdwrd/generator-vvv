#!/bin/bash
source config/site-vars.sh

read -p "Are you sure you want to remove $site_name? [Y/n]" -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]
	then
	mysql -u root --password=root -e "DROP DATABASE $siteId"
	sudo rm /var/sites/$siteId
	find ./  -maxdepth 1 -mindepth 1 \( ! -regex '.*/\..*' \) -exec sudo rm -r {} \;
fi
