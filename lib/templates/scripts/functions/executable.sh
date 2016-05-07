#!/bin/bash

# Create an executable breadcrump for puppeting scripts.
link_executable(){
  # Save a site referece to the run.sh file where we can find it.
  rm_executable
  ln -s $SCRIPTDIR/run.sh /usr/local/bin/$WPCONST_DB_NAME
}

# Clean out the executable breadcrumb for this site.
rm_executable(){
  if [ -h /usr/local/bin/$WPCONST_DB_NAME ]
    then
    rm /usr/local/bin/$WPCONST_DB_NAME
  fi
}
