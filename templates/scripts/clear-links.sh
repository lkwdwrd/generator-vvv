#!/bin/bash
cd ../

# Symlink working directories
# First clear out any links already present
find htdocs/wp-content/ -maxdepth 2 -type l -exec rm -f {} \;
