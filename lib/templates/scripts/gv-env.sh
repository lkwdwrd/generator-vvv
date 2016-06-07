#!/bin/bash

#Set Up Directories
SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $SCRIPTDIR/../..
GVDIR=$PWD

#Include functions
for file in $SCRIPTDIR/functions/* ; do
  if [ -f "$file" ]
    then
    . "$file"
  fi
done

#Include site environment vars
if [ -f "$GVDIR/.env" ]
  then
  source $GVDIR/.env
fi
if [ -f "$GVDIR/app/.env" ]
  then
  source $GVDIR/app/.env
fi

#Get URL data directly from the JSON
GVLOCALURL=$( echo "console.log(require('./wpmanifest.json').server.local);" | node )
if [ "$GVLOCALURL" == "undefined" ] || [ "$GVLOCALURL" == "false" ]
  then
  GVLOCALURL=$(false)
fi

GVREMOTEURL=$( echo "console.log(require('./wpmanifest.json').server.remote);" | node )
if [ "$GVREMOTEURL" == "undefined" ] || [ "$GVLOCALURL" == "false" ]
  then
  GVREMOTEURL=$(false)
fi

GVSUBDOMAINS=($( echo "var sub = require('./wpmanifest.json').server.subdomains; console.log( sub instanceof Array ? sub.join( ' ' ) : false );" | node ))
if [ "$GVSUBDOMAINS" == "undefined" ] || [ "$GVSUBDOMAINS" == "false" ]
  then
  GVSUBDOMAINS=$(false)
fi
