#!/bin/bash
source config/site-vars.sh

#Install all WordPress.org plugins in the org_plugins file using CLI
echo "Checking WordPress.org Plugins"
if [[ config/org-plugins ]]
then
	# Move back into htdocs to install .org plugins.
	cd htdocs
	while IFS='' read -r line || [ -n "$line" ]
	do
		if [ "#" != "${line:0:1}" ]
		then
			# Only install the plugin if it's not already installed.
			if ! $(wp --allow-root plugin is-installed "$line")
				then
				wp --allow-root plugin install "$line" --allow-root
			else
				echo "$line is already installed";
			fi
		fi
	done < ../config/org-plugins
fi
