#!/bin/bash
source config/site-vars.sh

# Plugins
echo "Linking working directory pluins"
find src/plugins/ \( ! -regex '.*/\..*' \) -maxdepth 1 -mindepth 1 -exec ln -s $PWD/{} $PWD/htdocs/wp-content/plugins/ \;
# Themes
echo "Linking working directory themes"
find src/themes/ \( ! -regex '.*/\..*' \) -maxdepth 1 -mindepth 1 -exec ln -s $PWD/{} $PWD/htdocs/wp-content/themes/ \;
# Dropins
echo "Linking any available drop-ins"
find src/dropins/ \( ! -regex '.*/\..*' \) -maxdepth 1 -mindepth 1 -exec ln -s $PWD/{} $PWD/htdocs/wp-content/ \;
