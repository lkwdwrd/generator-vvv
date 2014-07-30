#!/bin/bash
source config/site-vars.sh

#Install all WordPress.org plugins in the org_plugins file using CLI
echo "Checking WordPress.org Themes"
if [[ config/org-themes ]]
then
	# Move back into htdocs to install .org plugins.
	cd htdocs
	while IFS='' read -r line || [ -n "$line" ]
	do
		if [ "#" != "${line:0:1}" ]
		then
			# Only install the plugin if it's not already installed.
			if ! $(wp --allow-root theme is-installed "$line")
				then
				wp --allow-root theme install "$line" --allow-root
			else
				echo "$line is already installed";
			fi
		fi
	done < ../config/org-themes
fi
