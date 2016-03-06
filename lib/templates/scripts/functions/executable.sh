#!/bin/bash
link_executable(){
  # Save a site referece to the run.sh file where we can find it.
  rm_executable
  ln -s $SCRIPTDIR/run.sh /usr/local/bin/$WPCONST_DB_NAME
}
rm_executable(){
  if [ -h /usr/local/bin/$WPCONST_DB_NAME ]
    then
    rm /usr/local/bin/$WPCONST_DB_NAME
  fi
}