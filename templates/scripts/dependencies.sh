#!/bin/bash
source config/site-vars.sh

# Then link dependecy Repos
if [[ -d deps/plugins ]]
	then
	echo "Linking plugin dependencies"
	find deps/plugins/ -maxdepth 1 -mindepth 1 \( ! -regex '.*/\..*' \) -exec ln -s $PWD/{} $PWD/htdocs/wp-content/plugins/ \;
fi
if [[ -d deps/themes ]]
	then
	echo "Linking themes dependencies"
	find deps/themes/ -maxdepth 1 -mindepth 1 \( ! -regex '.*/\..*' \) -exec ln -s $PWD/{} $PWD/htdocs/wp-content/themes/ \;
fi
if [[ -d deps/dropins ]]
	then
	echo "Linking dropin dependencies"
	find deps/dropins/ -maxdepth 1 -mindepth 1 \( ! -regex '.*/\..*' \) -exec ln -s $PWD/{} $PWD/htdocs/wp-content/ \;
fi
